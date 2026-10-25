"""Create user, weather history, and prediction history tables."""

from alembic import op
import sqlalchemy as sa

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table(
        "weather_history",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("country", sa.String(length=80)),
        sa.Column("temperature", sa.Float(), nullable=False), sa.Column("humidity", sa.Float(), nullable=False),
        sa.Column("pressure", sa.Float(), nullable=False), sa.Column("wind_speed", sa.Float(), nullable=False),
        sa.Column("cloudiness", sa.Float(), nullable=False), sa.Column("description", sa.String(length=255), nullable=False),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False), sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_weather_history_user_id", "weather_history", ["user_id"])
    op.create_index("ix_weather_history_city", "weather_history", ["city"])
    op.create_index("ix_weather_history_created_at", "weather_history", ["created_at"])
    op.create_table(
        "prediction_history",
        sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("weather_history_id", sa.Integer(), sa.ForeignKey("weather_history.id")), sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("rain_probability", sa.Float(), nullable=False), sa.Column("flood_risk", sa.String(length=20), nullable=False),
        sa.Column("drying_condition", sa.String(length=20), nullable=False), sa.Column("recommendations", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_prediction_history_user_id", "prediction_history", ["user_id"])
    op.create_index("ix_prediction_history_created_at", "prediction_history", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_prediction_history_created_at", table_name="prediction_history")
    op.drop_index("ix_prediction_history_user_id", table_name="prediction_history")
    op.drop_table("prediction_history")
    op.drop_index("ix_weather_history_created_at", table_name="weather_history")
    op.drop_index("ix_weather_history_city", table_name="weather_history")
    op.drop_index("ix_weather_history_user_id", table_name="weather_history")
    op.drop_table("weather_history")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
