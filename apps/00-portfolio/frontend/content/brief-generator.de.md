# Fallstudie: App 07 — Multi-Agent Brief Generator

## Problemstellung

Technische Führungskräfte und Enterprise-Architekten stehen häufig vor der Herausforderung, tiefgehende technische Recherchen mit präziser Management-Kommunikation in Einklang zu bringen. Technische Analysen erzeugen oft unstrukturierte Notizen, Metriken und Sicherheits-Trade-offs, während Führungskräfte prägnante, risikobewusste Zusammenfassungen ohne technische Halluzinationen erwarten. Monolithische Single-Prompt-Ansätze überfordern Entscheider entweder mit detaillierten Logs oder lassen kritische Architekturrisiken aus.

## Lösung

Der Multi-Agent Brief Generator implementiert eine heterogene zweistufige Agenten-Pipeline, die Recherche und Management-Synthese strikt voneinander trennt:

1. **Researcher Agent:** Ausgestattet mit deterministischen Werkzeugen (`search_facts`, `verify_claim`, `extract_metrics`) und Fachheuristiken zur Erhebung von Fakten, Verifizierung von Thesen und Aufdeckung operativer Reibungspunkte.
2. **Orchestrator & Handoff-Protokoll:** Validiert das strukturierte Recherche-Dossier gegen ein striktes Schema, schätzt den Token-Bedarf und übergibt die Ergebnisse über ein werkzeugloses Kontextprotokoll an die nächste Stufe.
3. **Writer Agent:** Ein auf Executive-Synthese spezialisierter Agent ohne externe Werkzeuge, der ein 5-teiliges Management-Briefing (Management Summary, Wichtigste Erkenntnisse, Betriebsmetriken, Architektur-Trade-offs und Handlungsempfehlungen) verfasst.

Die Benutzeroberfläche bietet Echtzeit-Streaming via Server-Sent Events (SSE), einen Diagnose-Drawer, 12 Beispielszenarien und kryptografische Session-Isolation im Browser.

## Architekturentscheidungen

- **Heterogene Spezialisierung:** Der Researcher Agent nutzt gezielte Tools zur Verifikation; der Writer Agent arbeitet bewusst ohne Tools, um Halluzinationen bei der Texterstellung auszuschließen.
- **Strikte Datenverträge:** Schnittstellen zwischen Agenten werden zur Laufzeit typisiert validiert, was vollständige Nachvollziehbarkeit und Reproduzierbarkeit garantiert.
- **Provider-neutrale Dual-Engine:** Unterstützt Azure OpenAI in Produktionsumgebungen und eine deterministische Offline-Engine für CI und lokale Tests ohne API-Kosten.
- **Streaming-Telemetrieprotokoll:** SSE überträgt Fortschrittsschritte und Phasenwechsel ohne clientseitiges Polling in Echtzeit.
- **Kryptografische Session-Isolation:** Arbeitsbereiche und Briefings werden clientseitig über HMAC-SHA256-signierte Cookies isoliert, ohne Registrierungszwang.

## Sicherheits-, Zuverlässigkeits- und Kostenkontrollen

- Längenbegrenzung von Nutzereingaben verhindert Prompt-Injections und übermäßigen Ressourcenverbrauch.
- Konfigurierbare Obergrenze für Rechercherunden (`MAX_RESEARCH_ROUNDS`) begrenzt die Tiefe der Abfragen und API-Kosten.
- Globaler Nebenläufigkeits-Semaphor und IP-basiertes Rate-Limiting schützen die Serverkapazität.
- Notfall-Schalter (`GENERATION_ENABLED`) ermöglicht eine sofortige Deaktivierung bei Bedarf.
- Keine sensiblen Nutzereingaben oder generierten Dokumente werden in Server-Logs protokolliert.

## Validierung

- Umfassende automatisierte Tests für Pipeline, Rate-Limiting, Kill-Switch, Rundenbegrenzung und Session-Tokens.
- Vollständig offline in CI ausführbar ohne externe Cloud-Abhängigkeiten.
- Besteht TypeScript-Typüberprüfung und statische Next.js-Builds.

## Was dieses Projekt demonstriert

Das Projekt demonstriert moderne Multi-Agenten-Orchestrierung, typisierte Datenübergaben (Handoffs), Streaming-Telemetrie, sicheres Session-Management im Browser und Enterprise-Sicherheitskontrollen in Fullstack-TypeScript.
