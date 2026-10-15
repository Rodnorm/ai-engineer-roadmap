import { SITE_URL } from "@/lib/i18n";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/personal-content";

export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Rodrigo Normando",
        jobTitle: "Senior Software Engineer",
        description: "Senior Software Engineer specialized in accessible frontend engineering and applied AI systems.",
        url: SITE_URL,
        sameAs: [LINKEDIN_URL, GITHUB_URL],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Essen",
          addressCountry: "DE",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Rodrigo Normando Portfolio",
        publisher: {
          "@id": `${SITE_URL}/#person`,
        },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profile`,
        url: SITE_URL,
        name: "Rodrigo Normando — Senior Software Engineer",
        about: {
          "@id": `${SITE_URL}/#person`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
