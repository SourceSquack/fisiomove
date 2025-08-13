"""add_first_name_last_name_fields

Revision ID: add_first_last_name
Revises:
Create Date: 2025-08-13 10:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

revision = "add_first_last_name"
down_revision = None
head = "add_first_last_name"


def upgrade() -> None:
    op.add_column(
        "users", sa.Column("first_name", sa.String(length=100), nullable=True)
    )
    op.add_column("users", sa.Column("last_name", sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "last_name")
    op.drop_column("users", "first_name")
