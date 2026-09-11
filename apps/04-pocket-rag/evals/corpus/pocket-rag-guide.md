# pocketRag evaluation guide

pocketRag stores uploaded original files in a private local directory. Document metadata, text chunks, and embedding vectors are stored in SQLite.

The application supports PDF, Markdown, TXT, and DOCX files. The default upload limit is 10 MB. Scanned PDFs without extractable text require OCR, which pocketRag does not provide.

Answer generation is disabled by default. When enabled, the server sends the question and only the retrieved excerpts to Azure OpenAI. The server instructs the model to treat document contents as untrusted data and to ignore instructions found inside documents.

Documents can be deleted individually. Deletion removes the original file, its SQLite metadata, and its vector chunks. A separate confirmed action removes all documents.

The browser displays independent questions. Visible chat history is not sent to the backend, so the current application does not provide persistent multi-turn memory.
