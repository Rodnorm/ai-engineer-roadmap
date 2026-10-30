import { SITE_URL } from "@/lib/i18n";
import { GITHUB_URL, LINKEDIN_URL } from "@/lib/personal-content";

export type StructuredDataProps = {
  type?: "ProfilePage" | "WebPage";
  url?: string;
  name?: string;
};

export function buildStructuredData({
  type = "ProfilePage",
  url = SITE_URL,
  name = "Rodrigo Normando — Senior Software Engineer",
}: StructuredDataProps = {}) {
  const pageEntity =
    type === "ProfilePage"
      ? {
          "@type": "ProfilePage",
          "@id": `${url}/#profile`,
          url,
          name,
          mainEntity: {
            "@id": `${SITE_URL}/#person`,
          },
          about: {
            "@id": `${SITE_URL}/#person`,
          },
        }
      : {
          "@type": "WebPage",
          "@id": `${url}/#webpage`,
          url,
          name,
          about: {
            "@id": `${SITE_URL}/#person`,
          },
        };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Rodrigo Normando",
        url: SITE_URL,
        image: `${SITE_URL}/profile.jpg`,
        jobTitle: "Senior Software Engineer",
        description:
          "Senior Software Engineer specialized in accessible frontend engineering and applied AI systems.",
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
      pageEntity,
    ],
  };
}

export function StructuredData(props: StructuredDataProps) {
  const jsonLd = buildStructuredData(props);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
