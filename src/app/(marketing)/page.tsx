import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MemoryRibbon } from "@/components/ai/memory-ribbon";
import { KpiCard } from "@/components/charts/kpi-card";
import { Testimonials } from "@/components/marketing/testimonials";
import { CtaSection } from "@/components/marketing/cta-section";
import { Section } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { constructMetadata } from "@/lib/seo";
import { 
  Shield, 
  Brain, 
  Sparkles, 
  Key, 
  Heart, 
  Star, 
  Pause, 
  Download, 
  Trash2, 
  Lock 
} from "lucide-react";

export const metadata = constructMetadata({
  title: "Maidly.ai - Your home, remembered",
  description: "Premium home cleaning service with an AI assistant that remembers exactly how you like things. Beta in Dallas Suburbs.",
});

export default function HomePage() {
  const kpiData = {
    satisfaction: {
      title: "Satisfaction",
      value: "4.8",
      delta: {
        value: 12,
        label: "vs last month",
        trend: "up" as const,
      },
      chart: {
        type: "area" as const,
        data: [
          { value: 4.2 },
          { value: 4.3 },
          { value: 4.1 },
          { value: 4.5 },
          { value: 4.6 },
          { value: 4.7 },
          { value: 4.8 },
        ],
      },
    },
    reworkRate: {
      title: "Rework Rate",
      value: "2.1%",
      delta: {
        value: -45,
        label: "vs last month",
        trend: "down" as const,
      },
      chart: {
        type: "line" as const,
        data: [
          { value: 3.8 },
          { value: 3.2 },
          { value: 2.9 },
          { value: 2.7 },
          { value: 2.4 },
          { value: 2.3 },
          { value: 2.1 },
        ],
      },
    },
    preferencesLearned: {
      title: "Preferences Learned",
      value: "127",
      delta: {
        value: 23,
        label: "this month",
        trend: "up" as const,
      },
      chart: {
        type: "area" as const,
        data: [
          { value: 89 },
          { value: 95 },
          { value: 102 },
          { value: 108 },
          { value: 115 },
          { value: 121 },
          { value: 127 },
        ],
      },
    },
  };
  return (
    <>
      <Hero />
      
      {/* Social Proof Strip */}
      <Section className="py-8 bg-muted/10">
        <div className="text-center">
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
            <Badge variant="outline" className="px-4 py-2">
              Trusted by 100+ Dallas families
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              4.8/5 satisfaction rating
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              Hotel-grade standards
            </Badge>
          </div>
        </div>
      </Section>

      <HowItWorks />

      {/* Memory Ribbon Demo */}
      <Section className="bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
              Your preferences, remembered
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI assistant learns and stores your cleaning preferences, creating a personalized profile that gets better with every visit.
            </p>
          </div>
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
            <MemoryRibbon />
          </div>
        </div>
      </Section>

      {/* KPI Cards */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
            Results that speak for themselves
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how AI-powered memory improves satisfaction and reduces rework over time.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <KpiCard 
            title={kpiData.satisfaction.title}
            value={kpiData.satisfaction.value}
            delta={kpiData.satisfaction.delta}
            chart={kpiData.satisfaction.chart}
          />
          <KpiCard 
            title={kpiData.reworkRate.title}
            value={kpiData.reworkRate.value}
            delta={kpiData.reworkRate.delta}
            chart={kpiData.reworkRate.chart}
          />
          <KpiCard 
            title={kpiData.preferencesLearned.title}
            value={kpiData.preferencesLearned.value}
            delta={kpiData.preferencesLearned.delta}
            chart={kpiData.preferencesLearned.chart}
          />
        </div>
      </Section>

      <Testimonials />

      {/* Privacy & Control */}
      <Section className="bg-gradient-to-br from-primary/5 via-background to-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Privacy First
            </Badge>
            <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
              Your data, your control
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe your personal information should stay personal. Here's exactly what we remember and how you stay in control.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* What we remember */}
            <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">What we remember</CardTitle>
                <p className="text-muted-foreground">
                  Smart details that make each visit perfect
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Cleaning product preferences</h4>
                    <p className="text-sm text-muted-foreground">Your favorite brands and scents</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Key className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Access instructions</h4>
                    <p className="text-sm text-muted-foreground">How to enter your home safely</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Heart className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Pet and family notes</h4>
                    <p className="text-sm text-muted-foreground">Special considerations for loved ones</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Star className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Special care items</h4>
                    <p className="text-sm text-muted-foreground">Delicate surfaces and valuable belongings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your privacy rights */}
            <Card className="border-0 shadow-lg bg-background/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Your privacy rights</CardTitle>
                <p className="text-muted-foreground">
                  Complete control over your information
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Pause className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Pause memory anytime</h4>
                    <p className="text-sm text-muted-foreground">Stop data collection with one click</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Download className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Export your data</h4>
                    <p className="text-sm text-muted-foreground">Download everything we know about you</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Trash2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Delete preferences</h4>
                    <p className="text-sm text-muted-foreground">Remove any or all stored information</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <Lock className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Never sold to third parties</h4>
                    <p className="text-sm text-muted-foreground">Your data stays private, always</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Questions about privacy? Read our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> or <a href="mailto:privacy@maidly.ai" className="text-primary hover:underline">contact us</a>.
            </p>
          </div>
        </div>
      </Section>

      <CtaSection />
    </>
  );
}
