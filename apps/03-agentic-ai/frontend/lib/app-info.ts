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

export const appInfo: AppInfoConfig = {
  title: "Agentic AI Application",
  category: "Agentic AI",
  status: "In Progress",
  description:
    "An early-stage agentic AI application with its frontend and backend connection in place.",
  whatItDoes: [
    "Checks the FastAPI health endpoint and displays whether the backend is reachable.",
  ],
  howToUse: [
    "Open the app to run the connection check automatically.",
    "If the backend is unavailable, start the service and choose Retry.",
  ],
  technologies: [
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Tailwind CSS 4",
    "FastAPI",
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
};
