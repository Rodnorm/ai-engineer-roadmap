# Fallstudie: App 03 — Prompt Forge

## 1. Übersicht
Prompt Forge ist eine Entwicklungsumgebung zur zielgerichteten Text- und Content-Erstellung. Sie ermöglicht die Definition unterschiedlicher Personas, Modellparameter und die Anzeige von Echtzeit-Streamingantworten per SSE.

## 2. Lern- und Technikziele
- Vorschaltung von Azure Content Safety zur Moderation vor ressourcenintensiven LLM-Aufrufen.
- Zuverlässiges Server-Sent Events (SSE) Streaming ohne zwischengeschaltete Caches.
- Konsequente clientseitige Speicherung (`localStorage`) zur vollständigen Wahrung der Privatsphäre.

## 3. Architektur & Technologie-Stack
- **Frontend:** Next.js 16, Tailwind CSS, TypeScript.
- **Backend:** FastAPI, Python 3.12, Azure OpenAI SDK, Azure Content Safety SDK.

## 4. Sicherheitsarchitektur
- **Inhaltsüberprüfung:** Automatische Vorabprüfung auf unangemessene oder schädliche Inhalte.
- **Keine serverseitige Persistenz:** Weder Prompts noch Client-IDs werden auf dem Server gespeichert.
- **Ressourcenschutz:** Ratenbegrenzung und Concurrency-Semaphore schützen die Backend-Kapazität.

## 5. Ergebnis
Ein intuitives, hochgradig responsives Tool für Prompt Engineering und kontrollierte Content-Generierung.
