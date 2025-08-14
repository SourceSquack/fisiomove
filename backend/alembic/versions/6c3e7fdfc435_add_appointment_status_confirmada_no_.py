"""add_appointment_status_confirmada_no_show

Revision ID: 6c3e7fdfc435
Revises: b5ee9ab17407
Create Date: 2025-08-14 14:19:51.425861

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "6c3e7fdfc435"
down_revision = "b5ee9ab17407"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Agregar los nuevos valores al enum appointment_status
    op.execute("ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'confirmada'")
    op.execute("ALTER TYPE appointment_status ADD VALUE IF NOT EXISTS 'no_show'")


def downgrade() -> None:
    # No podemos eliminar valores de un enum en PostgreSQL fácilmente
    # En caso de revertir, sería necesario recrear el enum
    pass
