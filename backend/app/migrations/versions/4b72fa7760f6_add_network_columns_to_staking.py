"""add_network_columns_to_staking

Revision ID: 4b72fa7760f6
Revises: d323e7c7892f
Create Date: 2025-03-06 20:33:08.838246

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4b72fa7760f6'
down_revision: Union[str, None] = 'd323e7c7892f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add network column
    op.add_column('staking', sa.Column('network', sa.String(), nullable=True))
    
    # Add unstake_requested_at column
    op.add_column('staking', sa.Column('unstake_requested_at', sa.DateTime(), nullable=True))
    
    # Add destination_address column
    op.add_column('staking', sa.Column('destination_address', sa.String(), nullable=True))
    
    # Update existing records to have default values
    op.execute("UPDATE staking SET network = 'ETH' WHERE network IS NULL")
    
    # Make network column not nullable after setting default values
    op.alter_column('staking', 'network', nullable=False)


def downgrade() -> None:
    # Remove the columns in reverse order
    op.drop_column('staking', 'destination_address')
    op.drop_column('staking', 'unstake_requested_at')
    op.drop_column('staking', 'network')
