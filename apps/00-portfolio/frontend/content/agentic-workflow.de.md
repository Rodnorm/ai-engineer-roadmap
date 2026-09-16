# Fallstudie: App 05 — Agentic Workflow

## Übersicht

Agentic Workflow implementiert eine autonome Ausführungsschleife basierend auf dem ReAct-Paradigma (Gedanke -> Aktion -> Beobachtung -> Finale Antwort) mit deterministischem Tool-Aufruf und obligatorischer Human-in-the-Loop-Autorisierung.

## Architektur

FastAPI steuert eine iterative Denkschleife, in der ein LLM (oder ein deterministischer Offline-Planer) Aufgaben analysiert, Werkzeuge aus registrierten Schemas auswählt und Ergebnisse auswertet. Sensible Aktionen unterbrechen die Zustandsmaschine der Sitzung, bis ein Operator die vorgeschlagene Aktion in Next.js überprüft und ausdrücklich genehmigt oder ablehnt.

## Zuverlässigkeits-, Sicherheits- und Kostenkontrollen

- Iterationsbegrenzung (maximal 4 Schritte) verhindert Endlosschleifen und unkontrollierten Tokenverbrauch.
- Parameter werden vor der Ausführung validiert; mathematische Ausdrücke werden sicher via AST ohne dynamische Codeausführung (`eval`) ausgewertet.
- Kritische Werkzeuge (`send_alert`) pausieren im persistenten Zustand `waiting_approval`, sodass keine folgenschwere Aktion ohne menschliche Freigabe ausgeführt wird.
- Dreistufige In-Memory-Ratenbegrenzung und Nebenläufigkeits-Semaphoren schützen die Backend-Ressourcen.
- Vollständig offline testbar und lauffähig ohne externe API-Schlüssel.

## Status

Die Implementierung ist vollständig mit Frontend-Internationalisierung (EN, PT, DE), barrierefreien Genehmigungskarten und automatisierter Testabdeckung.
