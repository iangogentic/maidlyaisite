import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Founding Partner Program - Step Into Leadership | Maidly.ai",
  description: "Skip years of ladder-climbing. Join Maidly.ai's Founding Partner Program: COO, CMO, CTO/AI, and CFO tracks with equity and direct founder access.",
});

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
