# 01 — Smart Inspector

A single-page Next.js app where the user uploads an image, clicks **Enviar**, the image is sent to an external analysis service, and the returned metadata (tags, caption, detected objects, OCR text) is shown next to the image.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- React 18

## Getting started

```bash
cd apps/01-smart-inspector
npm install
cp .env.example .env.local   # set ANALYZE_SERVICE_URL
npm run dev
```

Open http://localhost:3000.

## What you implement

The UI is ready. The only piece left is the actual call to your analysis service.

Open `lib/analyze-image.ts` and replace the `TODO` block with a `fetch` to `ANALYZE_SERVICE_URL`. The service is expected to accept `multipart/form-data` with an `image` field and return this JSON:

```ts
{
  tags: string[],      // e.g. ["indoor", "document", "blurry"]
  caption: string,     // one-line description
  objects: string[],   // detected objects, e.g. ["laptop", "coffee mug"]
  ocr: string          // extracted text (may contain line breaks)
}
```

The contract is already typed in `lib/analyze-image.ts` as `AnalysisResult`.
