import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "Smart Inspector",
  description: "Upload an image and inspect tags, caption, detected objects, and OCR text.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-bg text-text antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
