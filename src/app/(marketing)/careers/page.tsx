import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/marketing/section";
import { constructMetadata } from "@/lib/seo";
import { ArrowRight, Users, TrendingUp, Code, DollarSign, Zap, Target, Calendar } from "lucide-react";

export const metadata = constructMetadata({
  title: "C-Suite Internships - Step Into Leadership | Maidly.ai",
  description: "Skip years of ladder-climbing. Join Maidly.ai's C-Suite internships: COO, CMO, CTO/AI, and CFO tracks with equity and direct founder access.",
});

export default function CareersPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6">
            🚀 C-Suite Internships
          </Badge>
          <h1 className="text-display-lg font-bold text-foreground mb-6 font-display">
            Step Into the C-Suite
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Maidly.ai is offering internships where you don&apos;t just assist — you act like a Chief Officer. COO, CMO, CTO, CFO interns will lead functions, ship fast, and earn equity alongside the founder.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group">
              Apply & Book Intro Call
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg">
              Explore Roles
            </Button>
          </div>
        </div>
      </Section>

      {/* The Roles */}
      <Section className="bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
              The Roles
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose your C-level track and lead your own vertical with executive responsibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COO Intern */}
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>COO Intern (Chief of Ops)</CardTitle>
                <p className="text-sm text-primary font-medium">Be the engine that keeps Maidly running.</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Run customer ops and service systems. Design routing, crew dashboards, and process automation.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Service routing optimization</li>
                  <li>• Crew dashboard design</li>
                  <li>• Process automation systems</li>
                  <li>• Customer success workflows</li>
                </ul>
              </CardContent>
            </Card>

            {/* CMO Intern */}
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>CMO Intern (Chief of Marketing)</CardTitle>
                <p className="text-sm text-primary font-medium">Turn Maidly into a household name.</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Own growth: ads, content, and brand. Craft campaigns that attract both customers and talent.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Digital ad campaigns</li>
                  <li>• Content creation & social media</li>
                  <li>• Brand positioning & messaging</li>
                  <li>• Customer acquisition funnels</li>
                </ul>
              </CardContent>
            </Card>

            {/* CTO/AI Intern */}
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>CTO/AI Intern (Chief of Technology)</CardTitle>
                <p className="text-sm text-primary font-medium">Build the brain of Maidly.ai.</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Build the &quot;AI Maid&quot; memory system. RAG, chat, preference extraction, and demo platform.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• RAG system implementation</li>
                  <li>• AI chat interfaces</li>
                  <li>• Preference extraction algorithms</li>
                  <li>• Demo platform development</li>
                </ul>
              </CardContent>
            </Card>

            {/* CFO Intern */}
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>CFO Intern (Chief of Finance)</CardTitle>
                <p className="text-sm text-primary font-medium">Shape Maidly&apos;s financial future.</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create pricing models, financial forecasts, and investor decks. Show how AI gives valuation upside.
                </p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Pricing model optimization</li>
                  <li>• Financial forecasting</li>
                  <li>• Investor deck creation</li>
                  <li>• Unit economics analysis</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* What Makes This Different */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
              What Makes This Different
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">C-level simulation</h3>
              <p className="text-muted-foreground text-sm">
                Lead your own vertical with executive responsibility.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Direct founder access</h3>
              <p className="text-muted-foreground text-sm">
                Weekly strategy calls, daily async feedback.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Equity awards</h3>
              <p className="text-muted-foreground text-sm">
                Earn ownership for hitting milestones.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Real customers</h3>
              <p className="text-muted-foreground text-sm">
                Your work powers our Dallas beta.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Week 1 Preview */}
      <Section className="bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
              Week 1 Preview
            </h2>
            <p className="text-lg text-muted-foreground">
              Hit the ground running from day one.
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground font-semibold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Run the repo & demo locally</h3>
                <p className="text-muted-foreground">
                  Get the full Maidly.ai stack running on your machine and understand how the AI memory system works.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground font-semibold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Pick your milestone</h3>
                <p className="text-muted-foreground">
                  Choose your first deliverable: ops flow, ad test, AI feature, or pricing model.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground font-semibold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Ship your first deliverable</h3>
                <p className="text-muted-foreground">
                  Build, test, and deploy something real that impacts customers or the business.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground font-semibold text-sm">
                4
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Demo it to the founder Friday</h3>
                <p className="text-muted-foreground">
                  Present your work, get feedback, and plan your next milestone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Apply Section */}
      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-display-sm font-bold text-foreground mb-6 font-display">
            Apply Section
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Ready to start your career in the C-suite? Fill out our 1-minute form and book your intro call.
          </p>
          
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">1-Minute Application Form</h3>
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <div className="h-10 bg-muted/50 rounded border border-border"></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <div className="h-10 bg-muted/50 rounded border border-border"></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Role Interest</label>
                <div className="h-10 bg-muted/50 rounded border border-border flex items-center px-3 text-muted-foreground text-sm">
                  COO / CMO / CTO/AI / CFO
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Portfolio Link</label>
                <div className="h-10 bg-muted/50 rounded border border-border"></div>
              </div>
            </div>
          </div>

          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">📅 Book Your 15-Minute Intro Call</h3>
            <p className="text-muted-foreground mb-4">
              Schedule directly with the founder via Calendly
            </p>
            <div className="h-32 bg-muted/50 rounded border border-border flex items-center justify-center text-muted-foreground">
              [Calendly Embed Here]
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Start your career in the C-suite. Apply today.
            </h3>
            <Button size="lg" className="group">
              Submit Application
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}