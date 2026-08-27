"""Dependency-free keyword retrieval for the local FAQ dataset."""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path


_WORD_PATTERN = re.compile(r"[a-z0-9]+")
_STOP_WORDS = {
    "about", "after", "also", "and", "are", "can", "could", "does",
    "for", "from", "have", "how", "into", "mein", "meine", "mit",
    "nicht", "oder", "para", "por", "que", "the", "this", "und",
    "was", "what", "when", "where", "which", "why", "with", "would",
    "you", "your", "como", "uma", "das", "der", "die", "ein", "eine",
}


def _terms(text: str) -> set[str]:
    normalized = unicodedata.normalize("NFKD", text.lower()).encode(
        "ascii", "ignore"
    ).decode("ascii")
    terms = set()
    for word in _WORD_PATTERN.findall(normalized):
        if len(word) < 3 or word in _STOP_WORDS:
            continue
        if len(word) > 4 and word.endswith("s") and not word.endswith("ss"):
            word = word[:-1]
        terms.add(word)
    return terms


class LocalFaqRetriever:
    def __init__(self, faq_path: Path):
        with faq_path.open(encoding="utf-8") as faq_file:
            payload = json.load(faq_file)

        self.entries = payload["entries"]

    def search(
        self,
        query: str,
        key_phrases: list[str] | None = None,
        limit: int = 3,
    ) -> list[dict]:
        query_terms = _terms(" ".join([query, *(key_phrases or [])]))
        if not query_terms or limit < 1:
            return []

        scored_entries = []
        for position, entry in enumerate(self.entries):
            question_matches = len(query_terms & _terms(entry["question"]))
            answer_matches = len(query_terms & _terms(entry["answer"]))
            score = (question_matches * 2) + answer_matches
            if score:
                scored_entries.append((score, position, entry))

        scored_entries.sort(key=lambda item: (-item[0], item[1]))
        return [entry for _, _, entry in scored_entries[:limit]]


FAQ_PATH = Path(__file__).parent / "data" / "healthcare-billing-kb.json"
faq_retriever = LocalFaqRetriever(FAQ_PATH)
