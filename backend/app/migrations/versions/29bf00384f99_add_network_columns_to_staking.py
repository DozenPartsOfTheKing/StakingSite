"""add_network_columns_to_staking

Revision ID: 29bf00384f99
Revises: df48a4d20fdd
Create Date: 2025-03-06 20:35:23.857111

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '29bf00384f99'
down_revision: Union[str, None] = 'df48a4d20fdd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
