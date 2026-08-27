import type { Locale } from "@/lib/i18n/locales";

export type AppInfoConfig = {
	title: string;
	category: string;
	status: string;
	description: string;
	whatItDoes: readonly string[];
	howToUse: readonly string[];
	technologies: readonly string[];
	labels: {
		about: string;
		close: string;
		category: string;
		status: string;
		whatItDoes: string;
		howToUse: string;
		technologies: string;
	};
};

const appInfoByLocale: Record<Locale, AppInfoConfig> = {
	en: {
		title: "Support Bot",
		category: "NLP / Knowledge Base",
		status: "Completed",
		description:
			"A conversational assistant for common healthcare billing questions.",
		whatItDoes: [
			"Answers billing questions with an Azure AI Foundry agent grounded by locally retrieved FAQs.",
			"Shows language, sentiment, key phrases, and entities detected by Azure AI Language.",
		],
		howToUse: [
			"Choose a suggested question or type your own message in the chat.",
			"Read the answer and expand the NLP analysis when you want more detail.",
			"Open the FAQ for a browsable list of common billing topics.",
		],
		technologies: [
			"Next.js 16",
			"React 19",
			"TypeScript",
			"Tailwind CSS 4",
			"FastAPI",
			"Azure AI Foundry",
			"Azure AI Language",
		],
		labels: {
			about: "About this app",
			close: "Close",
			category: "Category",
			status: "Status",
			whatItDoes: "What the app does",
			howToUse: "How to use it",
			technologies: "Main technologies",
		},
	},
	de: {
		title: "Support Bot",
		category: "NLP / Knowledge Base",
		status: "Completed",
		description:
			"Ein dialogorientierter Assistent für häufige Fragen zur medizinischen Abrechnung.",
		whatItDoes: [
			"Beantwortet Abrechnungsfragen mit einem Azure AI Foundry Agent auf Basis lokal abgerufener FAQs.",
			"Zeigt die von Azure AI Language erkannten Sprachen, Stimmungen, Schlüsselbegriffe und Entitäten.",
		],
		howToUse: [
			"Wählen Sie eine vorgeschlagene Frage oder schreiben Sie eine eigene Nachricht in den Chat.",
			"Lesen Sie die Antwort und öffnen Sie bei Bedarf die NLP-Analyse für weitere Details.",
			"In den FAQ finden Sie häufige Abrechnungsthemen als übersichtliche Liste.",
		],
		technologies: [
			"Next.js 16",
			"React 19",
			"TypeScript",
			"Tailwind CSS 4",
			"FastAPI",
			"Azure AI Foundry",
			"Azure AI Language",
		],
		labels: {
			about: "Über diese App",
			close: "Schließen",
			category: "Kategorie",
			status: "Status",
			whatItDoes: "Was die App macht",
			howToUse: "So funktioniert sie",
			technologies: "Wichtigste Technologien",
		},
	},
	"pt-BR": {
		title: "Support Bot",
		category: "NLP / Knowledge Base",
		status: "Completed",
		description:
			"Um assistente conversacional para dúvidas comuns sobre faturamento de saúde.",
		whatItDoes: [
			"Responde a dúvidas de faturamento com um agente do Azure AI Foundry baseado em FAQs recuperadas localmente.",
			"Exibe idioma, sentimento, frases-chave e entidades detectados pelo Azure AI Language.",
		],
		howToUse: [
			"Escolha uma pergunta sugerida ou digite sua própria mensagem no chat.",
			"Leia a resposta e expanda a análise de NLP quando quiser mais detalhes.",
			"Abra o FAQ para consultar uma lista de temas comuns de faturamento.",
		],
		technologies: [
			"Next.js 16",
			"React 19",
			"TypeScript",
			"Tailwind CSS 4",
			"FastAPI",
			"Azure AI Foundry",
			"Azure AI Language",
		],
		labels: {
			about: "Sobre este app",
			close: "Fechar",
			category: "Categoria",
			status: "Status",
			whatItDoes: "O que o app faz",
			howToUse: "Como usar",
			technologies: "Principais tecnologias",
		},
	},
};

export function getAppInfo(locale: Locale): AppInfoConfig {
	return appInfoByLocale[locale];
}
