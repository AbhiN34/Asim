"""
Episode contract schema — shared between graph-service and any Python consumer.

IMPORTANT: This schema must stay in sync with episode.ts.
Any changes require explicit approval from the contracts owner (W1).
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class EpisodeType(str, Enum):
    """Source format of the episode content."""

    message = "message"
    json = "json"
    text = "text"


class EpisodeInput(BaseModel):
    """Schema for creating a new episode via the API."""

    name: str = Field(description="Human-readable name for the episode")
    body: str = Field(description="Raw episode content")
    source: EpisodeType = Field(
        default=EpisodeType.text, description="Source format of the content"
    )
    source_description: str = Field(
        default="manual", description="Description of where this episode came from"
    )
    group_id: str = Field(
        default="default", description="Graph partition / group identifier"
    )
    reference_time: Optional[datetime] = Field(
        default=None,
        description="When the original content was created. Defaults to now.",
    )


class EpisodeResponse(BaseModel):
    """Schema returned after an episode is ingested."""

    uuid: str = Field(description="Unique identifier for the episode node")
    name: str
    group_id: str
    source: EpisodeType
    source_description: str
    content: str
    created_at: datetime
    valid_at: datetime


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
    graphiti_connected: bool = False
    neo4j_uri: str = ""
