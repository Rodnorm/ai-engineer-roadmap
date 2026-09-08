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

ChromaDB keeps the demo architecture simple and local-first. The multilingual MiniLM
model avoids paid retrieval calls, but model download, cold start, disk, CPU, and
multilingual retrieval quality still need measurement on the target host.
