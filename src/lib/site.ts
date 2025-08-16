export const siteConfig = {
  name: "Maidly.ai",
  description: "Premium home cleaning service with an AI assistant that remembers exactly how you like things.",
  url: "https://maidly.ai",
  ogImage: "/og/og-image.png",
  links: {
    twitter: "https://twitter.com/maidlyai",
    github: "https://github.com/maidlyai",
    linkedin: "https://linkedin.com/company/maidlyai",
  },
  location: {
    city: "Dallas",
    state: "TX",
    region: "Dallas Suburbs",
  },
  nav: [
    {
      title: "How it Works",
      href: "/how-it-works",
    },
    {
      title: "Pricing",
      href: "/pricing",
    },
    {
      title: "Careers",
      href: "/careers",
    },
    {
      title: "Tech",
      href: "/tech",
    },
    {
      title: "Blog",
      href: "/blog",
    },
  ],
  footer: {
    company: [
      {
        title: "About",
        href: "/how-it-works",
      },
      {
        title: "Careers",
        href: "/careers",
      },
      {
        title: "Tech Stack",
        href: "/tech",
      },
      {
        title: "Blog",
        href: "/blog",
      },
    ],
    legal: [
      {
        title: "Privacy Policy",
        href: "/privacy",
      },
      {
        title: "Terms of Service",
        href: "/terms",
      },
    ],
  },
  analytics: {
    enabled: false, // Toggle for analytics
    provider: "posthog", // or "umami"
  },
  brand: {
    colors: {
      primary: "hsl(198, 90%, 40%)",
      primaryForeground: "hsl(180, 10%, 98%)",
      ink: "hsl(220, 15%, 15%)",
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
