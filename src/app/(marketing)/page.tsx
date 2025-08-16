import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MemoryRibbon } from "@/components/ai/memory-ribbon";
import { KpiCard } from "@/components/charts/kpi-card";
import { Testimonials } from "@/components/marketing/testimonials";
import { CtaSection } from "@/components/marketing/cta-section";
import { Section } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";
import { constructMetadata } from "@/lib/seo";

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
      <Section className="bg-muted/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-display-sm font-bold text-foreground mb-6 font-display">
            Your data, your control
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">What we remember</h3>
              <ul className="text-muted-foreground space-y-2 text-left">
                <li>• Cleaning product preferences</li>
                <li>• Access instructions</li>
                <li>• Pet and family notes</li>
                <li>• Special care items</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Your privacy rights</h3>
              <ul className="text-muted-foreground space-y-2 text-left">
                <li>• Pause memory anytime</li>
                <li>• Export your data</li>
                <li>• Delete preferences</li>
                <li>• Never sold to third parties</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <CtaSection />
    </>
  );
}
