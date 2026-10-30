import test from "node:test";
import assert from "node:assert/strict";

import { buildStructuredData } from "../components/StructuredData.tsx";
import { SITE_URL } from "../lib/i18n/routing.ts";
import { GITHUB_URL, LINKEDIN_URL } from "../lib/personal-content.ts";

test("buildStructuredData defaults to ProfilePage with mainEntity and valid Person", () => {
  const data = buildStructuredData();
  const graph = data["@graph"];

  const person = graph.find((item) => item["@type"] === "Person");
  assert.ok(person, "Person entity should exist in @graph");
  assert.equal(person["@id"], `${SITE_URL}/#person`);
  assert.equal(person.name, "Rodrigo Normando");
  assert.equal(person.url, SITE_URL);
  assert.equal(person.image, `${SITE_URL}/profile.jpg`);
  assert.equal(person.jobTitle, "Senior Software Engineer");
  assert.deepEqual(person.sameAs, [LINKEDIN_URL, GITHUB_URL]);

  const profilePage = graph.find((item) => item["@type"] === "ProfilePage");
  assert.ok(profilePage, "ProfilePage entity should exist");
  assert.equal(profilePage["@id"], `${SITE_URL}/#profile`);
  assert.equal(profilePage.url, SITE_URL);
  assert.equal(profilePage.name, "Rodrigo Normando — Senior Software Engineer");
  assert.deepEqual(profilePage.mainEntity, { "@id": `${SITE_URL}/#person` });
  assert.deepEqual(profilePage.about, { "@id": `${SITE_URL}/#person` });
});

test("buildStructuredData creates WebPage when type is WebPage", () => {
  const pageUrl = `${SITE_URL}/impressum`;
  const pageName = "Legal Notice (Impressum) | Rodrigo Normando";
  const data = buildStructuredData({
    type: "WebPage",
    url: pageUrl,
    name: pageName,
  });
  const graph = data["@graph"];

  const profilePage = graph.find((item) => item["@type"] === "ProfilePage");
  assert.equal(profilePage, undefined, "ProfilePage should not be present");

  const webPage = graph.find((item) => item["@type"] === "WebPage");
  assert.ok(webPage, "WebPage entity should exist");
  assert.equal(webPage["@id"], `${pageUrl}/#webpage`);
  assert.equal(webPage.url, pageUrl);
  assert.equal(webPage.name, pageName);
  assert.deepEqual(webPage.about, { "@id": `${SITE_URL}/#person` });
});
