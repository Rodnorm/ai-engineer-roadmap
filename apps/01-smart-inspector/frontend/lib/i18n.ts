/**
 * Static UI translations for the Smart Inspector frontend.
 * Three locales are supported: Portuguese (pt-BR), English (en), and German (de).
 * The default locale is German (de) per project requirements.
 */

export type Locale = "pt-BR" | "en" | "de";

export const LOCALES: ReadonlyArray<Locale> = ["pt-BR", "en", "de"];

export const LOCALE_LABELS: Record<Locale, string> = {
	"pt-BR": "Português (BR)",
	en: "English",
	de: "Deutsch",
};

export const DEFAULT_LOCALE: Locale = "de";

const translations = {
	"pt-BR": {
		// page
		"page.title": "Smart Inspector",
		"page.subtitle":
			"Envie uma imagem e veja as tags, o caption, os objetos detectados e o texto OCR ao lado.",

		// left card
		"left.heading": "Imagem",
		"left.remove": "Remover",
		"left.previewAlt": "Pré-visualização",
		"left.dropzonePrompt": "Clique para selecionar uma imagem ou tire uma foto",
		"left.dropzoneHint": "PNG, JPG ou WEBP",
		"left.noFile": "Nenhuma imagem selecionada",
		"left.submit": "Enviar",
		"left.submitting": "Enviando...",

		// right card
		"right.heading": "Resultado da análise",
		"right.success": "Sucesso",
		"right.processing": "Processando...",
		"right.emptyFile":
			"Anexe uma imagem à esquerda e clique em **Enviar** para ver aqui as tags, o caption, os objetos detectados e o texto OCR.",
		"right.readyToSubmit":
			"Pronto para enviar. Clique em **Enviar** quando quiser.",

		// result fields
		"result.caption": "Caption",
		"result.tags": "Tags",
		"result.objects": "Objetos detectados",
		"result.ocr": "Texto OCR",
		"result.averagePrice": "Preço médio",
		"result.lowestPriceLink": "Link do menor preço",

		// errors
		"error.invalidFile": "Selecione um arquivo de imagem válido.",
		"error.unknown": "Falha desconhecida ao analisar a imagem.",
		"error.network":
			"Não foi possível conectar ao serviço de análise ({url}): {reason}",
		"error.serviceStatus": "Serviço respondeu {status}",
		"error.serviceStatusWithDetail": "Serviço respondeu {status}: {detail}",

		// language selector
		"lang.menuLabel": "Idioma",
		"lang.changeTo": "Mudar idioma para {language}",
	},

	en: {
		"page.title": "Smart Inspector",
		"page.subtitle":
			"Upload an image and see the tags, caption, detected objects, and OCR text next to it.",

		"left.heading": "Image",
		"left.remove": "Remove",
		"left.previewAlt": "Preview",
		"left.dropzonePrompt": "Click to select an image or take a photo",
		"left.dropzoneHint": "PNG, JPG or WEBP",
		"left.noFile": "No image selected",
		"left.submit": "Submit",
		"left.submitting": "Submitting...",

		"right.heading": "Analysis result",
		"right.success": "Success",
		"right.processing": "Processing...",
		"right.emptyFile":
			"Attach an image on the left and click **Submit** to see the tags, caption, detected objects, and OCR text here.",
		"right.readyToSubmit":
			"Ready to submit. Click **Submit** whenever you want.",

		"result.caption": "Caption",
		"result.tags": "Tags",
		"result.objects": "Detected objects",
		"result.ocr": "OCR text",
		"result.averagePrice": "Average price",
		"result.lowestPriceLink": "Lowest price link",

		"error.invalidFile": "Please select a valid image file.",
		"error.unknown": "Unknown failure while analyzing the image.",
		"error.network":
			"Could not connect to the analysis service ({url}): {reason}",
		"error.serviceStatus": "Service responded with {status}",
		"error.serviceStatusWithDetail":
			"Service responded with {status}: {detail}",

		"lang.menuLabel": "Language",
		"lang.changeTo": "Change language to {language}",
	},

	de: {
		"page.title": "Smart Inspector",
		"page.subtitle":
			"Laden Sie ein Bild hoch und sehen Sie daneben die Tags, die Bildunterschrift, die erkannten Objekte und den OCR-Text.",

		"left.heading": "Bild",
		"left.remove": "Entfernen",
		"left.previewAlt": "Vorschau",
		"left.dropzonePrompt":
			"Klicken Sie, um ein Bild auszuwählen oder machen Sie ein Foto",
		"left.dropzoneHint": "PNG, JPG oder WEBP",
		"left.noFile": "Kein Bild ausgewählt",
		"left.submit": "Senden",
		"left.submitting": "Wird gesendet...",

		"right.heading": "Analyseergebnis",
		"right.success": "Erfolgreich",
		"right.processing": "Wird verarbeitet...",
		"right.emptyFile":
			"Hängen Sie links ein Bild an und klicken Sie auf **Senden**, um hier die Tags, die Bildunterschrift, die erkannten Objekte und den OCR-Text zu sehen.",
		"right.readyToSubmit":
			"Bereit zum Senden. Klicken Sie jederzeit auf **Senden**.",

		"result.caption": "Bildunterschrift",
		"result.tags": "Tags",
		"result.objects": "Erkannte Objekte",
		"result.ocr": "OCR-Text",
		"result.averagePrice": "Durchschnittspreis",
		"result.lowestPriceLink": "Link zum niedrigsten Preis",

		"error.invalidFile": "Bitte wählen Sie eine gültige Bilddatei aus.",
		"error.unknown": "Unbekannter Fehler bei der Bildanalyse.",
		"error.network":
			"Verbindung zum Analysedienst ({url}) fehlgeschlagen: {reason}",
		"error.serviceStatus": "Dienst hat mit {status} geantwortet",
		"error.serviceStatusWithDetail":
			"Dienst hat mit {status} geantwortet: {detail}",

		"lang.menuLabel": "Sprache",
		"lang.changeTo": "Sprache zu {language} ändern",
	},
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

/**
 * Replace `{name}` placeholders in a translation string with the matching
 * value from the `params` object. Unknown placeholders are left as-is.
 */
function interpolate(
	template: string,
	params?: Record<string, string | number>,
): string {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (match, key: string) => {
		const value = params[key];
		return value === undefined ? match : String(value);
	});
}

export type Translator = (
	key: TranslationKey,
	params?: Record<string, string | number>,
) => string;

/**
 * Build a translator bound to a given locale.
 */
export function createTranslator(locale: Locale): Translator {
	const dict = translations[locale] as Record<TranslationKey, string>;
	return (key, params) => interpolate(dict[key] ?? key, params);
}

/**
 * Splits a translated string on `**...**` markers so callers can render the
 * highlighted spans as `<b>` (or any other emphasis element). Pairs of
 * delimiters produce alternating plain/emphasized segments — like a tiny
 * subset of Markdown. Unmatched delimiters are left as literal text.
 */
export function splitEmphasis(
	text: string,
): Array<{ text: string; bold: boolean }> {
	const segments: Array<{ text: string; bold: boolean }> = [];
	const re = /\*\*(.+?)\*\*/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;
	while ((match = re.exec(text)) !== null) {
		if (match.index > lastIndex) {
			segments.push({ text: text.slice(lastIndex, match.index), bold: false });
		}
		segments.push({ text: match[1], bold: true });
		lastIndex = match.index + match[0].length;
	}
	if (lastIndex < text.length) {
		segments.push({ text: text.slice(lastIndex), bold: false });
	}
	return segments;
}
