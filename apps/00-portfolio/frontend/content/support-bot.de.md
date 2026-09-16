# Fallstudie: App 02 — Support Bot

## 1. Übersicht
Support Bot ist ein KI-Assistent für das Abrechnungswesen im Gesundheitsbereich. Er verarbeitet Patientenanfragen in natürlicher Sprache und liefert präzise Antworten auf Basis einer validierten FAQ-Wissensdatenbank.

## 2. Lern- und Technikziele
- Integration von Azure AI Language Diensten (Spracherkennung, Sentimentanalyse, Schlüsselbegriffsextraktion).
- Automatisches Maskieren personenbezogener Daten (PII) vor Protokollierung oder Modellaufrufen.
- Strikte Trennung nicht vertrauenswürdiger Eingaben gegen Prompt Injections durch XML-Tags.

## 3. Architektur & Technologie-Stack
- **Frontend:** Next.js 16, Tailwind CSS, TypeScript.
- **Backend:** FastAPI, Python 3.12, Azure AI Language SDK, Azure AI Agents SDK.

## 4. Sicherheitsentscheidungen
- **Datenschutz & PII-Maskierung:** Patienten- und Kartendaten werden im Vorfeld sanitisiert.
- **Eingabeisolierung:** Benutzereingaben werden in `<user_input>`-Tags gekapselt mit klaren Systemanweisungen gegen Instruktionsüberschreibungen.
- **Ratenbegrenzung:** Serverseitiges Rate Limiting schützt vor Denial-of-Wallet-Angriffen.

## 5. Ergebnis
Ein sicherer, rechtskonformer Support-Assistent mit hoher Antworttreue und Ausfallsicherheit.
