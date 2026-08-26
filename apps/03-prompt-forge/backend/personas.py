"""Persona -> system prompt mapping."""
from __future__ import annotations

PERSONAS: dict[str, dict[str, str]] = {
    "friendly": {
        "name": "Friendly SaaS Marketer",
        "system": (
            "You are a friendly SaaS marketer. "
            "Write in a warm, benefit-led, conversational tone. "
            "Prefer short sentences and a clear call to action."
        ),
    },
    "technical": {
        "name": "Technical Blogger",
        "system": (
            "You are a technical blogger. "
            "Write in a precise, credible, educational tone. "
            "Include concrete details, trade-offs, and one practical tip."
        ),
    },
    "cfo": {
        "name": "Skeptical CFO",
        "system": (
            "You are a skeptical CFO. "
            "Write in a direct, evidence-driven, ROI-focused tone. "
            "Quantify impact where possible and flag risks explicitly."
        ),
    },
}


def system_prompt_for(persona: str) -> str:
    entry = PERSONAS.get(persona)
    if entry is None:
        raise ValueError(f"Unknown persona: {persona}")
    return entry["system"]


def persona_name(persona: str) -> str:
    return PERSONAS.get(persona, {}).get("name", persona)
