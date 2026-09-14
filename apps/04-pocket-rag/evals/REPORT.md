# RAGAS evaluation report

Status: **not executed**. No simulated result is presented as measured evidence.

The runner defines acceptance targets before execution: faithfulness >= 0.80,
answer relevancy >= 0.75, and context precision >= 0.70. `golden.jsonl`
contains five required golden examples plus unsupported-question and prompt-injection
regressions. The versioned corpus contains no private data.

Run the evaluation deliberately with generation enabled and separate Azure evaluator
credentials:

```bash
python -m pip install -r evals/requirements-eval.txt
python evals/run_evaluation.py --include-regressions
```

The command clears only the configured pocketRag instance, uploads the evaluation
corpus, queries the API, and writes untracked `evals/results.json`. Review per-question
scores, aggregates, failures, token usage, and Azure cost before replacing this status.

SQLite vector search keeps the demo architecture simple and lightweight, avoiding
multi-gigabyte local embedding models and native vector databases. Azure OpenAI
embeddings provide fast, high-quality multilingual retrieval while allowing the application
to deploy easily on serverless environments.
