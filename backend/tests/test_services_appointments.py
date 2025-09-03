import builtins
from datetime import datetime, timedelta, timezone

import pytest

from app.services import appointments as ap_svc
from app.schemas.appointments import PatientInfo, FisioInfo


class DummyAppointment:
    def __init__(self, start_time, duration_minutes, patient_id=None, fisio_id=None):
        self.start_time = start_time
        self.duration_minutes = duration_minutes
        self.patient_id = patient_id
        self.fisio_id = fisio_id
        self.id = 0
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
        from app.models.appointment import AppointmentStatus, AppointmentType

        self.appointment_type = AppointmentType.consulta
        self.status = AppointmentStatus.programada


def test_naive_utc_converts_timezone():
    aware = datetime.now(timezone.utc)
    naive = ap_svc._naive_utc(aware)
    assert naive.tzinfo is None


def test_split_full_name_various():
    assert ap_svc._split_full_name("") == ("", "")
    assert ap_svc._split_full_name("Single") == ("Single", "")
    assert ap_svc._split_full_name("First Last") == ("First", "Last")
    assert ap_svc._split_full_name("A B C") == ("A", "B C")


def test_has_overlap_true_and_false():
    start = datetime.now(timezone.utc)
    ap = DummyAppointment(start_time=start, duration_minutes=60)
    # Overlap interval
    assert ap_svc.has_overlap(
        ap, start - timedelta(minutes=10), start + timedelta(minutes=10)
    )
    # Non-overlap
    later = start + timedelta(hours=2)
    assert not ap_svc.has_overlap(ap, later, later + timedelta(minutes=30))


def test_extract_ids_and_create_info():
    start = datetime.now(timezone.utc)
    a1 = DummyAppointment(start, 30, patient_id="1", fisio_id="f1")
    a2 = DummyAppointment(start, 30, patient_id="abc", fisio_id=None)
    patient_ids, fisio_ids = ap_svc._extract_ids_from_appointments([a1, a2])
    assert patient_ids == [1]
    assert fisio_ids == ["f1"]

    # _create_patient_info reads from patients_info mapping keyed by int id
    class P:
        def __init__(self):
            self.id = 1
            self.full_name = "John Doe"
            self.email = "j@d.com"

    patient_info = ap_svc._create_patient_info(a1, {1: P()})
    assert isinstance(patient_info, PatientInfo)
    assert patient_info.first_name == "John"

    # _create_fisio_info expects fisios_info keyed by fisio_id
    class F:
        def __init__(self):
            self.id = "f1"
            self.first_name = "Fisio"
            self.last_name = "One"
            self.email = "f@io.com"

    fisio_info = ap_svc._create_fisio_info(a1, {"f1": F()})
    assert isinstance(fisio_info, FisioInfo)
    assert fisio_info.email == "f@io.com"


def test_create_appointment_triggers_pending_notification(monkeypatch):
    # Fake DB with minimal API: query(...).filter(...).all() and add/commit/refresh
    class FakeQuery:
        def __init__(self, model):
            self.model = model

        def filter(self, *args, **kwargs):
            return self

        def all(self):
            # return empty lists for users
            return []

        def order_by(self, *a, **k):
            return self

        def first(self):
            return None

    class FakeDB:
        def query(self, model=None):
            return FakeQuery(model)

        def add(self, obj):
            # mimic setting id on refresh later
            obj.id = 123

        def commit(self):
            # This method is intentionally left empty.
            # Reason: FakeDB is a test double used in unit tests and does not persist any changes.
            # The commit operation is a no-op to simulate transactional behavior without side effects.
            pass

        def refresh(self, obj):
            # ensure id exists
            if not getattr(obj, "id", None):
                obj.id = 123

        def delete(self, obj):
            # This method is intentionally left empty.
            # Reason: FakeDB is a test double used in unit tests and does not persist any changes.
            # The delete operation is a no-op to simulate transactional behavior without side effects.
            pass

    called = {}

    def fake_notify_pending(db, ap_id, admin_ids, fisio_ids):
        called["pending"] = (ap_id, admin_ids, fisio_ids)

    monkeypatch.setattr(ap_svc, "notify_cita_pendiente_asignacion", fake_notify_pending)
    db = FakeDB()
    start = datetime.utcnow()
    ap = ap_svc.create_appointment(
        db, start_time=start, duration_minutes=30, patient_id="42", fisio_id=None
    )
    assert ap.id == 123
    assert "pending" in called


def test_update_appointment_conflict_raises(monkeypatch):
    # Prepare an appointment-like object
    ap = DummyAppointment(datetime.utcnow(), 30, patient_id="1", fisio_id="2")
    ap.id = 5

    class FakeDB:
        def add(self, obj):
            pass

        def commit(self):
            pass

        def refresh(self, obj):
            pass

    def fake_has_conflict(db, *, fisio_id, start, end, exclude_id=None):
        return True

    monkeypatch.setattr(ap_svc, "has_conflict", fake_has_conflict)
    with pytest.raises(ValueError):
        ap_svc.update_appointment(
            FakeDB(), ap, start_time=datetime.utcnow(), duration_minutes=60
        )


def test_cancel_appointment_calls_notify_and_returns(monkeypatch):
    ap = DummyAppointment(datetime.utcnow(), 30, patient_id="1", fisio_id="2")
    ap.id = 7

    called = {}

    def fake_notify_cancelled(db, ap_id, user_ids):
        called["cancel"] = (ap_id, user_ids)

    def fake_get_users_by_ids(db, ids):
        # return mapping of ids to simple objects
        class U:
            def __init__(self, id):
                self.id = str(id)
                self.first_name = "X"
                self.last_name = "Y"
                self.email = f"u{id}@ex"

        return {str(1): U(1), str(2): U(2)}

    monkeypatch.setattr(ap_svc, "notify_cita_cancelada", fake_notify_cancelled)
    monkeypatch.setattr(ap_svc, "get_users_by_ids", fake_get_users_by_ids)

    class FakeDB:
        def add(self, obj):
            pass

        def commit(self):
            pass

        def refresh(self, obj):
            pass

    ar = ap_svc.cancel_appointment(FakeDB(), ap)
    assert ar.status == "cancelada"
    assert "cancel" in called
