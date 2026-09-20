import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | AI Engineer Roadmap",
  description: "Informationen zur Verarbeitung personenbezogener Daten in den Roadmap-Anwendungen.",
};

const appRows = [
  ["Portfolio", "Sprach- und Theme-Einstellung im Browser.", "Bis zur Löschung im Browser."],
  ["Smart Inspector", "Ein hochgeladenes Bild wird von Metadaten bereinigt und zur Analyse an Azure AI übermittelt. Das Bild wird nicht durch die Anwendung gespeichert.", "Rate-Limit-Pseudonym: 24 Stunden."],
  ["Support Bot", "Nachrichtentext wird an Azure AI Language und Azure Agent/OpenAI übermittelt. Die Anwendung speichert keinen Chatverlauf.", "Rate-Limit-Pseudonym: 24 Stunden."],
  ["Prompt Forge", "Briefing und Zielgruppe werden an Azure Content Safety und Azure OpenAI übermittelt. Der Verlauf bleibt nur im Arbeitsspeicher des geöffneten Browsers.", "Rate-Limit-Pseudonym: 24 Stunden."],
  ["Pocket RAG", "Dokument, extrahierter Text und Embeddings werden lokal verarbeitet; Embeddings, Fragen und notwendiger Kontext werden an Azure OpenAI übermittelt.", "Automatische Löschung nach 30 Minuten; vorzeitige Löschung ist möglich."],
  ["Agentic Workflow", "Prompt und Workflow-Nachrichten werden im Serverspeicher verarbeitet und bei konfiguriertem Betrieb an Azure OpenAI übermittelt.", "Sitzung: 30 Minuten Inaktivität; Rate-Limit-Pseudonym: 24 Stunden."],
  ["Agent Workspace", "Ein notwendiges Eigentümer-Cookie ordnet den Browser seinem Workspace zu. Gespräche werden im Serverspeicher oder in Cosmos DB gespeichert und können an Azure AI Foundry übermittelt werden.", "Cookie: 30 Tage; Gespräche und Workspace-Daten: bis zur Löschung durch den Nutzer."],
] as const;

export default function DatenschutzPage() {
  return (
    <article className="mx-auto max-w-4xl space-y-10 py-6 text-text-secondary">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Rechtliches</p>
        <h1 className="text-4xl font-bold text-foreground">Datenschutzerklärung</h1>
        <p className="text-sm text-text-muted">Stand: 20. September 2026</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">1. Verantwortlicher</h2>
        <address className="not-italic">
          Rodrigo Normando Horácio da Silva<br />
          <strong>[POSTANSCHRIFT VOR VERÖFFENTLICHUNG EINTRAGEN]</strong><br />
          E-Mail: <strong>[E-MAIL VOR VERÖFFENTLICHUNG EINTRAGEN]</strong>
        </address>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">2. Grundsatz und Zweck</h2>
        <p>
          Diese Portfolio-Anwendungen erheben keine Analytics-Daten, verwenden keine Werbung,
          keine Tracking-Pixel und erstellen keine geräteübergreifenden Nutzerprofile.
          Verarbeitet werden nur Daten, die zum Ausführen der jeweils angeforderten Demo,
          zur Absicherung gegen Missbrauch und zur technischen Fehlerdiagnose erforderlich sind.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">3. Hosting und technische Protokolle</h2>
        <p>
          Die Anwendungen werden auf einem Server der Hetzner Online GmbH über Coolify und
          Traefik bereitgestellt. Beim Abruf einer Website verarbeitet die Infrastruktur
          technisch notwendige Verbindungsdaten, insbesondere die IP-Adresse, um Inhalte
          auszuliefern und Angriffe abzuwehren.
        </p>
        <p>
          Die Anwendungsprotokolle enthalten nach ihrer Konzeption nur technische Angaben wie
          Request-ID, Status, Dauer, Größen oder Fehlerkategorien. Eingaben, Nachrichten,
          Dokumentinhalte und Bilder werden nicht absichtlich protokolliert. Apps mit
          persistentem Rate Limiting wandeln die IP-Adresse vor der Speicherung mit einem
          geheimen Schlüssel in ein nicht direkt zuordenbares Pseudonym um; Einträge werden
          nach 24 Stunden gelöscht.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Das berechtigte Interesse besteht
          im sicheren, stabilen und missbrauchsgeschützten Betrieb der Dienste.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">4. Verarbeitung in den einzelnen Apps</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface-muted text-foreground">
              <tr>
                <th className="p-4">Anwendung</th>
                <th className="p-4">Verarbeitung</th>
                <th className="p-4">Speicherdauer</th>
              </tr>
            </thead>
            <tbody>
              {appRows.map(([app, processing, retention]) => (
                <tr key={app} className="border-t border-border align-top">
                  <th className="p-4 font-semibold text-foreground">{app}</th>
                  <td className="p-4">{processing}</td>
                  <td className="p-4">{retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Soweit die Verarbeitung zur Bereitstellung einer ausdrücklich angeforderten Funktion
          erforderlich ist, beruht sie auf Art. 6 Abs. 1 lit. b DSGVO; Sicherheitsmaßnahmen
          beruhen auf Art. 6 Abs. 1 lit. f DSGVO.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">5. Empfänger und Drittlandübermittlung</h2>
        <p>
          Empfänger können Hetzner Online GmbH sowie Microsoft-Dienste (Azure AI Language,
          Azure OpenAI, Azure AI Foundry, Content Safety und Cosmos DB, abhängig von der
          verwendeten App) sein. Bei Azure-Verarbeitung können Daten außerhalb der EU bzw.
          des EWR verarbeitet werden. Maßgeblich sind die vertraglichen Datenschutz- und
          Transfergarantien des jeweiligen Anbieters.
        </p>
        <p>
          Links zu GitHub und LinkedIn übertragen erst dann Daten an diese Anbieter, wenn sie
          angeklickt werden.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">6. Cookies und lokaler Speicher</h2>
        <p>
          Es werden nur technisch notwendige Speichermechanismen verwendet: Einstellungen
          für Sprache oder Theme sowie im Agent Workspace ein signiertes Eigentümer-Cookie.
          Es gibt keine Analytics- oder Marketing-Cookies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">7. Ihre Rechte</h2>
        <p>
          Sie haben im Rahmen der gesetzlichen Voraussetzungen Rechte auf Auskunft,
          Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und
          Widerspruch. Außerdem besteht ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde,
          beispielsweise bei der Landesbeauftragten für Datenschutz und Informationsfreiheit
          Nordrhein-Westfalen.
        </p>
      </section>

      <p className="border-t border-border pt-6 text-sm text-text-muted">
        <Link href="/impressum" className="font-medium text-primary hover:underline">Zum Impressum</Link>
      </p>
    </article>
  );
}
