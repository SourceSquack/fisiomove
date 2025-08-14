"""Add appointment_type field to appointments table

Revision ID: b5ee9ab17407
Revises: 4f24a085fce1
Create Date: 2025-08-14 11:42:48.366752

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "b5ee9ab17407"
down_revision = "4f24a085fce1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the appointment_type enum
    appointment_type_enum = sa.Enum(
        "evaluacion_inicial",
        "fisioterapia",
        "rehabilitacion",
        "seguimiento",
        "consulta",
        "otro",
        name="appointment_type",
    )
    appointment_type_enum.create(op.get_bind())

    # Add the appointment_type column with default value
    op.add_column(
        "appointments",
        sa.Column(
            "appointment_type",
            appointment_type_enum,
            nullable=False,
            server_default="consulta",
        ),
    )


def downgrade() -> None:
    # Drop the appointment_type column
    op.drop_column("appointments", "appointment_type")

    # Drop the appointment_type enum
    op.execute("DROP TYPE appointment_type")
    op.create_table(
        "historiales",
        sa.Column("id", sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column("diagnostico", sa.VARCHAR(), autoincrement=False, nullable=False),
        sa.Column("notas", sa.VARCHAR(), autoincrement=False, nullable=True),
        sa.Column("fecha", sa.DATE(), autoincrement=False, nullable=False),
        sa.Column("paciente_id", sa.INTEGER(), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(
            ["paciente_id"], ["patients.id"], name="historiales_paciente_id_fkey"
        ),
        sa.PrimaryKeyConstraint("id", name="historiales_pkey"),
    )
    op.create_index("ix_historiales_id", "historiales", ["id"], unique=False)
    # ### end Alembic commands ###
