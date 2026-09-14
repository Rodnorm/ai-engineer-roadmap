# Fallstudie: App 04 — pocketRag

## Überblick

pocketRag ist eine private, mehrsprachige Wissensbasis für PDF-, Markdown-, TXT- und DOCX-Dokumente. Hochgeladene Originaldateien werden für eine begrenzte Aufbewahrungszeit gespeichert, ihre Inhalte indexiert und fundierte Antworten mit nachvollziehbaren Inline-Quellenangaben ausgegeben.

## Architektur

FastAPI validiert und verarbeitet Uploads innerhalb fester Grenzen. Azure OpenAI erzeugt Vektoren mit `text-embedding-3-small`. SQLite speichert Dokumentmetadaten, Textabschnitte, Embeddings, gemeinsam genutzte Kontingente und Generierungsereignisse. Das Retrieval berechnet die Kosinus-Ähnlichkeit direkt mit SQLite/NumPy und benötigt daher keinen separaten Vektordatenbankdienst. Next.js stellt Dokumentverwaltung, fiktive deutsche Beispieldokumente, Fragevorschläge, Chat, Telemetrie und tastaturbedienbare Quellendialoge bereit.

## Zuverlässigkeit, Datenschutz und Kostenkontrolle

- Upload- und Löschvorgänge koordinieren Originaldateien, SQLite-Metadaten und Vektoren mit Rollback-Verhalten.
- Persönliche Uploads verfallen nach 30 Minuten durch eine serverseitige Bereinigung; die isolierten Beispieldokumente bleiben erhalten.
- In Produktion ist ein privater Bearer-Schlüssel erforderlich. Der Modus ist bewusst für einen einzelnen Benutzer und nicht als öffentliche Multi-Tenant-Demo ausgelegt.
- Bei schwacher Evidenz enthält sich das Retrieval einer Antwort, behandelt Dokumenttext als nicht vertrauenswürdige Daten und verwirft unbekannte Quellenverweise.
- Gemeinsame SQLite-Kontingente, begrenzter Kontext und Output, Provider-Timeouts, Wiederholungsversuche, ein Parallelitätslimit und ein Kill Switch schützen die kostenpflichtige Azure-Nutzung.
- Tests verwenden temporären Speicher, deterministische Embeddings, ein simuliertes LLM und blockierte Netzwerkzugriffe.

## Status

Implementierung, CI-Abdeckung, Beispieldokumente und reproduzierbare RAGAS-Werkzeuge sind fertig. Gemessene RAGAS-Ergebnisse und Nachweise zur dauerhaften Speicherung nach einem Neustart auf dem endgültigen Host fehlen noch als Release-Kriterien. Deshalb bleibt die App als in Entwicklung gekennzeichnet.
