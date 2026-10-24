
from typing import Literal
from pydantic import BaseModel, Field


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class SymptomRequest(BaseModel):
    user_input: str = Field(min_length=1, max_length=4000)
    language: str = "auto"
    conversation_history: list[ConversationMessage] = Field(
        default_factory=list
    )
    location: str | None = None


class AssessmentResponse(BaseModel):
    status: Literal[
        "follow_up_needed",
        "recommendation",
        "uncertain"
    ]
    follow_up_question: str | None = None
    options: list[str] = Field(default_factory=list)
    other_option_placeholder: str | None = None
    care_type: str | None = None
    urgency: str | None = None
    red_flags: list[str] = Field(default_factory=list)
    reasoning: str
    next_steps: list[str] = Field(default_factory=list)
    caregivers: list[dict] = Field(default_factory=list)
