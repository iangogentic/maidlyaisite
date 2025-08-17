"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/marketing/section";
import { CareerApplicationForm } from "@/components/forms/career-application-form";
import { ArrowRight, Users, TrendingUp, Code, DollarSign, Zap, Target } from "lucide-react";

export default function CareersPage() {
  const scrollToForm = () => {
    const formSection = document.getElementById('application-form');
    if (formSection) {
      formSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return (
    <>
      {/* Hero Section */}
      <Section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6">
            🚀 Join the Maidly.ai Founding Partner Program
          </Badge>
          <h1 className="text-display-lg font-bold text-foreground mb-6 font-display">
            Join the Maidly.ai Founding Partner Program
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            This isn&apos;t a job — it&apos;s a chance to step into the C-suite early. We&apos;re looking for entrepreneurial builders who want to co-create Maidly.ai alongside our founder. You&apos;ll take ownership of a function (Ops, Marketing, Tech, Finance), ship real outcomes, and earn equity awards tied to milestones.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group" onClick={scrollToForm}>
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" onClick={scrollToForm}>
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
              Choose your founding partner track and take ownership of a core function.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* COO Intern */}
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>COO Partner (Operations Builder)</CardTitle>
                <p className="text-sm text-primary font-medium">Be the engine that makes Maidly.ai run smoothly.</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Lead customer operations, service workflows, and routing. Build systems that scale.
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
                <CardTitle>CMO Partner (Marketing Builder)</CardTitle>
                <p className="text-sm text-primary font-medium">Turn Maidly.ai into a household name.</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Own growth: ads, content, community, and brand. Drive adoption and awareness.
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
                <CardTitle>CTO/AI Partner (Tech Builder)</CardTitle>
                <p className="text-sm text-primary font-medium">Develop the brain of Maidly.ai.</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Build the AI Maid: memory system, RAG pipelines, feedback → preferences. Architect the core tech.
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
                <CardTitle>CFO Partner (Finance Builder)</CardTitle>
                <p className="text-sm text-primary font-medium">Design Maidly.ai&apos;s financial future.</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create pricing models, forecasts, and investor decks. Help shape how AI drives valuation.
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
              <h3 className="font-semibold text-foreground mb-2">C-Level Style Roles</h3>
              <p className="text-muted-foreground text-sm">
                Step directly into COO, CMO, CTO/AI, or CFO partner tracks.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Work With the Founder</h3>
              <p className="text-muted-foreground text-sm">
                Collaborate directly with Maidly.ai&apos;s tech founder on real strategy + execution.
              </p>
            </div>



            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Real customers</h3>
              <p className="text-muted-foreground text-sm">
                Your work powers our Dallas-area beta launch.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Future Leadership Potential</h3>
              <p className="text-muted-foreground text-sm">
                Early builders may transition into official leadership roles as Maidly.ai scales.
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
              What You&apos;ll Do in Week 1
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
                <h3 className="font-semibold text-foreground mb-2">Get the repo + demo running</h3>
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
                <h3 className="font-semibold text-foreground mb-2">Choose your first milestone</h3>
                <p className="text-muted-foreground">
                  Build a feature, launch a campaign, or model a strategy.
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
                <h3 className="font-semibold text-foreground mb-2">Demo your work to the founder at Friday&apos;s showcase</h3>
                <p className="text-muted-foreground">
                  Present your work, get feedback, and plan your next milestone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* What You'll Gain */}
      <Section>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
              What You&apos;ll Gain
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Ownership Mindset</h3>
              <p className="text-muted-foreground text-sm">
                Learn what it&apos;s like to lead a company function.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Equity Awards</h3>
              <p className="text-muted-foreground text-sm">
                Ownership tied to shipped milestones.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Portfolio Proof</h3>
              <p className="text-muted-foreground text-sm">
                Ship logs + demos published on our site.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Founder Mentorship</h3>
              <p className="text-muted-foreground text-sm">
                Hands-on collaboration with the CEO.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Apply Section */}
      <Section id="application-form">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold text-foreground mb-6 font-display">
              Apply Now
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Step 1: Complete a short form (Name, Email, Track, Portfolio).<br/>
              Step 2: Instantly access Calendly to book a 15-minute intro with the founder.<br/>
              Step 3: Leave your intro call with a starter milestone task.
            </p>
          </div>
          
          <CareerApplicationForm />
          
          <div className="mt-12 text-center">
            <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
              <h3 className="text-lg font-semibold text-foreground mb-4">📅 Next Steps</h3>
              <p className="text-muted-foreground mb-4">
                After submitting your application, we'll review it and reach out within 48 hours to schedule a 15-minute intro call with the founder.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">1</div>
                  <span>Submit Application</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">2</div>
                  <span>48-Hour Review</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">3</div>
                  <span>Founder Call</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Final CTA Banner */}
      <Section className="bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
            Step Into the C-Suite Early 🚀
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Don&apos;t wait years for a corner office. Join Maidly.ai as a founding partner and build something real from day one.
          </p>
          <Button size="lg" className="group" onClick={scrollToForm}>
            Apply Now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </Section>
    </>
  );
}