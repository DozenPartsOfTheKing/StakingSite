"""merge heads

Revision ID: 38aef68da497
Revises: 84c015d8d526, d91698f20065
Create Date: 2025-03-04 20:50:51.702194

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '38aef68da497'
down_revision: Union[str, None] = ('84c015d8d526', 'd91698f20065')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
