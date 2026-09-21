"""Deliberate, credentialed RAGAS evaluation. It is never run by normal CI."""

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import uuid

import httpx
from datasets import Dataset
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from ragas import evaluate
from ragas.metrics import answer_relevancy, context_precision, faithfulness


ROOT = Path(__file__).resolve().parent
DEFAULT_EVALUATION_OWNER_ID = "6f3ad8f4-78c1-4e42-9f8d-3b73c2e5d904"


def load_golden() -> list[dict]:
    return [json.loads(line) for line in (ROOT / "golden.jsonl").read_text(encoding="utf-8").splitlines()]


def require_environment(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise SystemExit(f"Missing required environment variable: {name}")
    return value


def evaluation_owner_id() -> str:
    configured = os.getenv("POCKET_RAG_EVALUATION_OWNER_ID", DEFAULT_EVALUATION_OWNER_ID)
    try:
        owner_id = uuid.UUID(configured)
    except ValueError as error:
        raise SystemExit("POCKET_RAG_EVALUATION_OWNER_ID must be a valid UUID") from error
    if owner_id.version != 4:
        raise SystemExit("POCKET_RAG_EVALUATION_OWNER_ID must be a UUIDv4")
    return str(owner_id)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--api-url", default="http://localhost:8000")
    parser.add_argument("--output", default=str(ROOT / "results.json"))
    parser.add_argument("--include-regressions", action="store_true")
    args = parser.parse_args()

    access_key = os.getenv("POCKET_RAG_API_KEY", "")
    headers = {"X-Owner-ID": evaluation_owner_id()}
    if access_key:
        headers["Authorization"] = f"Bearer {access_key}"
    rows = load_golden()
    if not args.include_regressions:
        rows = [row for row in rows if "regression" not in row]

    with httpx.Client(base_url=args.api_url, headers=headers, timeout=120) as client:
        client.delete("/api/documents").raise_for_status()
        for corpus_path in sorted((ROOT / "corpus").glob("*.md")):
            with corpus_path.open("rb") as source:
                response = client.post("/api/documents/upload", files={"file": (corpus_path.name, source)})
            response.raise_for_status()

        samples = []
        raw_results = []
        for row in rows:
            response = client.post(
                "/api/query",
                json={"question": row["question"], "language": row["language"], "top_k": 4},
            )
            response.raise_for_status()
            result = response.json()
            contexts = [chunk["content"] for chunk in result["retrieved_chunks"]]
            samples.append(
                {
                    "question": row["question"],
                    "answer": result["answer"],
                    "contexts": contexts,
                    "ground_truth": row["reference"],
                }
            )
            raw_results.append({**row, "response": result})

    evaluator_llm = AzureChatOpenAI(
        azure_endpoint=require_environment("RAGAS_AZURE_ENDPOINT"),
        api_key=require_environment("RAGAS_AZURE_API_KEY"),
        azure_deployment=require_environment("RAGAS_CHAT_DEPLOYMENT"),
        api_version=os.getenv("RAGAS_AZURE_API_VERSION", "2024-08-01-preview"),
        temperature=0,
    )
    evaluator_embeddings = AzureOpenAIEmbeddings(
        azure_endpoint=require_environment("RAGAS_AZURE_ENDPOINT"),
        api_key=require_environment("RAGAS_AZURE_API_KEY"),
        azure_deployment=require_environment("RAGAS_EMBEDDING_DEPLOYMENT"),
        api_version=os.getenv("RAGAS_AZURE_API_VERSION", "2024-08-01-preview"),
    )
    scores = evaluate(
        Dataset.from_list(samples),
        metrics=[faithfulness, answer_relevancy, context_precision],
        llm=evaluator_llm,
        embeddings=evaluator_embeddings,
    ).to_pandas().to_dict(orient="records")
    output = {
        "executed_at": datetime.now(timezone.utc).isoformat(),
        "configuration": {
            "generator": os.getenv("AZURE_OPENAI_DEPLOYMENT", "unknown"),
            "evaluator": os.getenv("RAGAS_CHAT_DEPLOYMENT", "unknown"),
            "evaluator_embeddings": os.getenv("RAGAS_EMBEDDING_DEPLOYMENT", "unknown"),
            "retrieval_embeddings": "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
            "chunk_size_words": 500,
            "chunk_overlap_words": 50,
            "top_k": 4,
        },
        "targets": {"faithfulness": 0.8, "answer_relevancy": 0.75, "context_precision": 0.7},
        "results": [{**raw, "ragas": score} for raw, score in zip(raw_results, scores)],
    }
    Path(args.output).write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()

