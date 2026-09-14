"""Deterministic tools for App 05 Agentic Workflow."""

from __future__ import annotations

import ast
import operator
from typing import Any, Callable, Dict, List

# Allowed AST operators for safe calculation
_SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _eval_ast_node(node: ast.AST) -> float | int:
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    if isinstance(node, ast.UnaryOp):
        op_type = type(node.op)
        if op_type in _SAFE_OPERATORS:
            return _SAFE_OPERATORS[op_type](_eval_ast_node(node.operand))
    if isinstance(node, ast.BinOp):
        op_type = type(node.op)
        if op_type in _SAFE_OPERATORS:
            left = _eval_ast_node(node.left)
            right = _eval_ast_node(node.right)
            return _SAFE_OPERATORS[op_type](left, right)
    raise ValueError(f"Unsupported expression element: {ast.dump(node)}")


def calculator(expression: str) -> str:
    """Safely evaluates a basic mathematical expression (e.g. '(15 * 40) + 120')."""
    cleaned = expression.strip().replace(",", ".")
    try:
        parsed = ast.parse(cleaned, mode="eval")
        result = _eval_ast_node(parsed.body)
        if isinstance(result, float) and result.is_integer():
            result = int(result)
        return f"Calculation Result: {result}"
    except Exception as exc:
        return f"Error evaluating expression '{expression}': {str(exc)}"


# Internal Knowledge Base
_KNOWLEDGE_DOCUMENTS = {
    "refund": (
        "Reimbursement & Refund Policy: Expenses up to $500 can be reimbursed directly "
        "by team leads within 5 business days. Receipts must be submitted in PDF format."
    ),
    "sla": (
        "Service Level Agreement (SLA): Production API services require 99.9% uptime. "
        "P1 critical incidents must be acknowledged within 15 minutes and resolved within 2 hours."
    ),
    "oncall": (
        "On-Call Directory: Current DevOps primary on-call is Sarah (@sarah.ops). "
        "Escalation contact is Alex (@alex.lead). Support hotline channel is #incident-response."
    ),
    "servers": (
        "Infrastructure Architecture: Cluster eu-west-1 runs 6 Kubernetes nodes with 32GB RAM each. "
        "Database is Azure PostgreSQL flexible server with daily automated snapshots."
    ),
}


def knowledge_search(query: str) -> str:
    """Searches internal organizational documentation, policies, and directories."""
    q_lower = query.lower()
    matches = []
    for key, text in _KNOWLEDGE_DOCUMENTS.items():
        if key in q_lower or any(word in text.lower() for word in q_lower.split() if len(word) > 3):
            matches.append(text)

    if matches:
        return "\n\n".join(matches)
    return (
        f"No direct knowledge records found for '{query}'. "
        "Available topics include: refund policies, incident SLAs, on-call directory, and server infrastructure."
    )


def send_alert(recipient: str, message: str) -> str:
    """Dispatches a notification/alert to a designated person or channel. SENSITIVE: Requires Human Approval."""
    recipient_clean = recipient.strip()
    msg_clean = message.strip()
    return f"ALERT DISPATCHED: Successfully sent message '{msg_clean}' to target '{recipient_clean}'."


# Tool Registry & Schemas
TOOLS_METADATA: Dict[str, Dict[str, Any]] = {
    "calculator": {
        "fn": calculator,
        "requires_approval": False,
        "description": "Performs mathematical calculations safely.",
    },
    "knowledge_search": {
        "fn": knowledge_search,
        "requires_approval": False,
        "description": "Searches organizational knowledge, policies, SLA, and infrastructure records.",
    },
    "send_alert": {
        "fn": send_alert,
        "requires_approval": True,
        "description": "Sends an alert or notification. SENSITIVE: requires explicit human authorization.",
    },
}

TOOLS_SCHEMA: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "calculator",
            "description": "Performs mathematical calculations safely. Pass valid mathematical expressions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "Mathematical formula to evaluate, e.g. '(25 * 40) + 150'",
                    }
                },
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "knowledge_search",
            "description": "Searches internal documentation, policy, on-call schedules, and infrastructure specifications.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Keywords or search term to look up.",
                    }
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "send_alert",
            "description": "Dispatches an operational alert or notification. Triggering this tool requires explicit human approval.",
            "parameters": {
                "type": "object",
                "properties": {
                    "recipient": {
                        "type": "string",
                        "description": "Target recipient, user, or notification channel (e.g. '@sarah.ops' or '#incident-response').",
                    },
                    "message": {
                        "type": "string",
                        "description": "The exact alert text or warning message.",
                    },
                },
                "required": ["recipient", "message"],
            },
        },
    },
]
