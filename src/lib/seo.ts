import { Metadata } from "next";
import { siteConfig } from "./site";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  url = siteConfig.url,
  noIndex = false,
}: SEOProps = {}): Metadata {
  return {
    title: title === siteConfig.name ? title : `${title} | ${siteConfig.name}`,
    description,
    openGraph: {
      title: title === siteConfig.name ? title : `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title === siteConfig.name ? title : `${title} | ${siteConfig.name}`,
      description,
      images: [image],
      creator: "@maidlyai",
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "32x32" }
      ],
      shortcut: "/favicon-16x16.svg",
      apple: [
        { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" }
      ],
    },
    metadataBase: new URL(url),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

// JSON-LD structured data helpers
export function generateOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logos/maidly-logo.png`,
    sameAs: [
      siteConfig.links.twitter,
      siteConfig.links.linkedin,
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      areaServed: "US",
      availableLanguage: "English",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.location.city,
      addressRegion: siteConfig.location.state,
      addressCountry: "US",
    },
  };
}

export function generateLocalBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}#localbusiness`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    telephone: "+1-555-MAIDLY",
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.location.city,
      addressRegion: siteConfig.location.state,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "32.7767",
      longitude: "-96.7970",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    priceRange: "$$$",
    servesCuisine: null,
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: "32.7767",
        longitude: "-96.7970",
      },
      geoRadius: "50000", // 50km radius
    },
  };
}

export function generateServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "AI-Powered Home Cleaning Service",
    description: "Premium home cleaning with AI memory system that learns your preferences",
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    serviceType: "Home Cleaning Service",
    areaServed: {
      "@type": "State",
      name: "Texas",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Cleaning Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Weekly Cleaning",
            description: "Regular weekly home cleaning with AI preference tracking",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Bi-weekly Cleaning",
            description: "Bi-weekly home cleaning with personalized service",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Monthly Cleaning",
            description: "Monthly deep cleaning service",
          },
        },
      ],
    },
  };
}
