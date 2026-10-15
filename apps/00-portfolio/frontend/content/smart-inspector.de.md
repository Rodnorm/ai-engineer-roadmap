# Fallstudie: App 01 — Smart Inspector

## 1. Übersicht
Smart Inspector ist eine multimodale Bildanalyseanwendung. Benutzer können Bilder hochladen und erhalten automatisch strukturierte Bildunterschriften, Schlagwörter, erkannte physische Objekte und präzise OCR-Texterkennung.

## 2. Lern- und Technikziele
- Integration der Azure OpenAI Responses API für multimodale Bildverarbeitung.
- Strikte serverseitige Bildvalidierung (Magic Bytes, Bildabmessungen, EXIF-Entfernung).
- Zweistufiges Kostenschutzmodell (Rate Limiting, Parallelitätsgrenzen, Kill Switch).

## 3. Architektur & Technologie-Stack
- **Frontend:** Next.js 16, Tailwind CSS, TypeScript.
- **Backend:** FastAPI, Python 3.12, Pillow, Azure OpenAI SDK.

## 4. Sicherheits- und Kostenkontrollentscheidungen
- **Bildvalidierung:** Upload-Prüfung via Pillow (`Image.open`, `verify`) mit Grenzwerten bis max. 8000x8000 px / 24M Pixel.
- **EXIF-Bereinigung:** Kamera- und Ortsmetadaten werden im Speicher vor Weiterleitung an Azure vollständig entfernt.
- **Rate Limiting:** `InMemoryRateLimiter` mit 3 Anfragen/Minute pro IP und einem globalen Tageslimit von 100 Anfragen.
- **Parallelitätskontrolle:** `asyncio.Semaphore` begrenzt gleichzeitige Analysen auf maximal 2.

## 5. Ergebnis
Smart Inspector ist vollständig abgesichert, responsiv, in 3 Sprachen lokalisiert (`de`, `en`, `pt-BR`) und für öffentliche Demos freigegeben.
