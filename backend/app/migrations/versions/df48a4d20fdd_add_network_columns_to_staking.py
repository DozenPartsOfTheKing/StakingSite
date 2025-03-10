"""add_network_columns_to_staking

Revision ID: df48a4d20fdd
Revises: 4b72fa7760f6
Create Date: 2025-03-06 20:35:02.433204

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df48a4d20fdd'
down_revision: Union[str, None] = '4b72fa7760f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
