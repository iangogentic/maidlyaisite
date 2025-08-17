import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Book Beta Cleaning Service - Join Our Exclusive Program | Maidly.ai",
  description: "Join Maidly.ai's exclusive beta program in Dallas. Experience AI-powered home cleaning that learns your preferences. Limited spots available.",
});

export default function BookBetaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
