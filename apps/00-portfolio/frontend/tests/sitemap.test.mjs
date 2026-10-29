import test from "node:test";
import assert from "node:assert/strict";

import { getSitemapEntries, generateSitemapXml, SITEMAP_STATIC_PATHS } from "../lib/sitemap.ts";
import { getAppCatalog } from "../lib/catalog.ts";
import { GET } from "../app/sitemap.xml/route.ts";

test("getSitemapEntries includes all static paths and dynamic catalog app paths", () => {
  const entries = getSitemapEntries();
  const catalogApps = getAppCatalog();
  const expectedTotal = SITEMAP_STATIC_PATHS.length + catalogApps.length;

  assert.equal(entries.length, expectedTotal);

  const home = entries.find((e) => e.url === "https://normando.dev");
  assert.ok(home, "Home URL must exist");
  assert.equal(home.changefreq, "weekly");
  assert.equal(home.priority, 1.0);

  const experience = entries.find((e) => e.url === "https://normando.dev/experience");
  assert.ok(experience);
  assert.equal(experience.changefreq, "monthly");
  assert.equal(experience.priority, 0.8);

  const aiReview = entries.find((e) => e.url === "https://normando.dev/experience/ai-review-platform");
  assert.ok(aiReview);
  assert.equal(aiReview.changefreq, "yearly");
  assert.equal(aiReview.priority, 0.6);

  const apps = entries.find((e) => e.url === "https://normando.dev/apps");
  assert.ok(apps);
  assert.equal(apps.changefreq, "monthly");
  assert.equal(apps.priority, 0.8);

  const about = entries.find((e) => e.url === "https://normando.dev/about");
  assert.ok(about);
  assert.equal(about.changefreq, "monthly");
  assert.equal(about.priority, 0.8);

  const roadmap = entries.find((e) => e.url === "https://normando.dev/roadmap");
  assert.ok(roadmap);
  assert.equal(roadmap.changefreq, "yearly");
  assert.equal(roadmap.priority, 0.6);

  const datenschutz = entries.find((e) => e.url === "https://normando.dev/datenschutz");
  assert.ok(datenschutz);
  assert.equal(datenschutz.changefreq, "yearly");
  assert.equal(datenschutz.priority, 0.6);

  const impressum = entries.find((e) => e.url === "https://normando.dev/impressum");
  assert.ok(impressum);
  assert.equal(impressum.changefreq, "yearly");
  assert.equal(impressum.priority, 0.6);

  for (const app of catalogApps) {
    const appEntry = entries.find((e) => e.url === `https://normando.dev/apps/${app.slug}`);
    assert.ok(appEntry, `Entry for app /apps/${app.slug} must exist`);
    assert.equal(appEntry.changefreq, "yearly");
    assert.equal(appEntry.priority, 0.6);
  }
});

test("generateSitemapXml produces valid XML with sitemaps.org namespace and expected tags", () => {
  const xml = generateSitemapXml();

  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "Must begin with XML declaration");
  assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), "Must define standard sitemap namespace");
  assert.ok(xml.endsWith("</urlset>\n") || xml.endsWith("</urlset>"), "Must properly close urlset");

  assert.ok(xml.includes("<loc>https://normando.dev</loc>"));
  assert.ok(xml.includes("<changefreq>weekly</changefreq>"));
  assert.ok(xml.includes("<priority>1.0</priority>"));

  assert.ok(xml.includes("<loc>https://normando.dev/experience</loc>"));
  assert.ok(xml.includes("<priority>0.8</priority>"));

  assert.ok(xml.includes("<loc>https://normando.dev/roadmap</loc>"));
  assert.ok(xml.includes("<priority>0.6</priority>"));
});

test("sitemap.xml route GET handler returns XML response with Content-Type application/xml", async () => {
  const response = await GET();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "application/xml; charset=utf-8");

  const body = await response.text();
  assert.ok(body.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(body.includes("<urlset"));
  assert.ok(body.includes("<loc>https://normando.dev</loc>"));
});
