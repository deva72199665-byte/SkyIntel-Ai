"""Add rainfall measurement to weather history."""

from alembic import op
import sqlalchemy as sa

revision = "0002_add_rainfall"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("weather_history") as batch:
        batch.add_column(sa.Column("rainfall", sa.Float(), nullable=False, server_default="0"))


def downgrade() -> None:
    with op.batch_alter_table("weather_history") as batch:
        batch.drop_column("rainfall")
