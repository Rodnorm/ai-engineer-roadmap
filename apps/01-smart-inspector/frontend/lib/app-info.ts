import type { Locale } from "@/lib/i18n";

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
    title: "Smart Inspector",
    category: "Computer Vision",
    status: "Completed",
    description:
      "Inspect an image and receive a structured, easy-to-scan analysis.",
    whatItDoes: [
      "Generates a caption, tags, detected objects, and OCR text from an uploaded image.",
      "Adds price information and a shopping link when a product can be identified confidently.",
    ],
    howToUse: [
      "Select an image or take a photo, then choose Submit.",
      "Review the analysis and copy any extracted text you need.",
    ],
    technologies: [
      "Next.js 14",
      "React 18",
      "TypeScript",
      "Tailwind CSS 4",
      "FastAPI",
      "Azure OpenAI Responses API",
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
    title: "Smart Inspector",
    category: "Computer Vision",
    status: "Completed",
    description:
      "Untersuchen Sie ein Bild und erhalten Sie eine strukturierte, übersichtliche Analyse.",
    whatItDoes: [
      "Erstellt eine Bildbeschreibung, Tags, erkannte Objekte und OCR-Text aus einem hochgeladenen Bild.",
      "Ergänzt Preisinformationen und einen Einkaufslink, wenn ein Produkt zuverlässig erkannt wird.",
    ],
    howToUse: [
      "Wählen Sie ein Bild aus oder nehmen Sie ein Foto auf und klicken Sie dann auf Senden.",
      "Prüfen Sie die Analyse und kopieren Sie bei Bedarf den erkannten Text.",
    ],
    technologies: [
      "Next.js 14",
      "React 18",
      "TypeScript",
      "Tailwind CSS 4",
      "FastAPI",
      "Azure OpenAI Responses API",
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
    title: "Smart Inspector",
    category: "Computer Vision",
    status: "Completed",
    description:
      "Inspecione uma imagem e receba uma análise estruturada e fácil de consultar.",
    whatItDoes: [
      "Gera uma descrição, tags, objetos detectados e texto OCR a partir de uma imagem enviada.",
      "Acrescenta informações de preço e um link de compra quando identifica um produto com confiança.",
    ],
    howToUse: [
      "Selecione uma imagem ou tire uma foto e clique em Enviar.",
      "Consulte a análise e copie o texto extraído quando precisar.",
    ],
    technologies: [
      "Next.js 14",
      "React 18",
      "TypeScript",
      "Tailwind CSS 4",
      "FastAPI",
      "Azure OpenAI Responses API",
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
