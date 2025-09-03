def test_dashboard_resumen_success(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.v1.endpoints.dashboard.get_dashboard_summary",
        lambda db: {
            "total_patients": 10,
            "total_appointments": 5,
            "active_therapies": 2,
            "appointments_by_status": {"scheduled": 3, "completed": 1, "cancelled": 1},
        },
    )
    resp = client.get("/api/v1/dashboard/resumen")
    assert resp.status_code == 200
    data = resp.json()
    # schema uses English keys (total_patients)
    assert data.get("total_patients") == 10


def test_metricas_tiempo_real(client, monkeypatch):
    monkeypatch.setattr(
        "app.api.v1.endpoints.dashboard.get_dashboard_summary",
        lambda db: {
            "total_patients": 2,
            "total_appointments": 1,
            "active_therapies": 0,
            "appointments_by_status": {},
        },
    )
    monkeypatch.setattr(
        "app.api.v1.endpoints.dashboard.get_today_appointments",
        lambda db: {
            "appointments": [{"status": "scheduled"}],
            "next_appointment": None,
        },
    )
    resp = client.get("/api/v1/dashboard/metricas-tiempo-real")
    assert resp.status_code == 200
    j = resp.json()
    assert "timestamp" in j
    assert "citas_hoy" in j
