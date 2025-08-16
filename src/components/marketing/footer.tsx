import Link from "next/link";
import { Sparkles, Twitter, Linkedin, Github, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-xl text-foreground">
                maidly.ai
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Premium home cleaning with an AI assistant that remembers exactly how you like things.
            </p>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{siteConfig.location.region} (Beta)</span>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2">
              {siteConfig.footer.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-sm"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2">
              {siteConfig.footer.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-sm"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="flex space-x-4">
              <Link
                href={siteConfig.links.twitter}
                className="text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-sm p-1"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href={siteConfig.links.linkedin}
                className="text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-sm p-1"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href={siteConfig.links.github}
                className="text-muted-foreground hover:text-foreground transition-colors focus-ring rounded-sm p-1"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Building the future of home care with AI
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Maidly.ai. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ in Dallas, TX
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
