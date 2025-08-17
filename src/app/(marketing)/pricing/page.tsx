import { constructMetadata } from "@/lib/seo";
import { Section } from "@/components/marketing/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Clock, Home, Sparkles, ArrowRight, Calculator } from "lucide-react";
import { PricingCalculator } from "@/components/pricing/pricing-calculator";

export const metadata = constructMetadata({
  title: "Pricing Calculator - Get Your Instant Quote",
  description: "Get real-time pricing for AI-powered home cleaning. Choose eco-friendly, regular, or bring-your-own supplies. Instant quotes in Dallas suburbs.",
});



const betaPerks = [
  {
    icon: Star,
    title: "Beta Pricing Lock",
    description: "Lock in these rates for your first 6 months, even after we exit beta",
  },
  {
    icon: Sparkles,
    title: "AI Training Bonus",
    description: "Help train our AI and get 20% off your first 3 cleanings",
  },
  {
    icon: Clock,
    title: "Priority Access",
    description: "First access to new features and premium time slots",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="pt-16 pb-6 bg-gradient-to-b from-background to-muted/20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-3">
            <Calculator className="w-4 h-4 mr-2" />
            Instant Quote Calculator - Dallas Suburbs
          </Badge>
          <h1 className="text-display-xl font-bold text-foreground mb-3 font-display">
            Get Your Real-Time Quote
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Personalized pricing in 60 seconds. Choose eco-friendly, regular, or bring-your-own supplies. Book instantly or call to discuss.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-sm text-primary font-medium">
              🎉 Beta Special: 20% off your first 3 cleanings + Price locked for 7 days
            </p>
          </div>
        </div>
      </Section>

      {/* Pricing Calculator */}
      <Section className="py-6">
        <PricingCalculator />
      </Section>

      {/* Beta Perks */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 font-display">
            Beta Program Perks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {betaPerks.map((perk) => {
              const Icon = perk.icon;
              return (
                <Card key={perk.title} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold mb-2">{perk.title}</h4>
                    <p className="text-sm text-muted-foreground">{perk.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </Section>

      {/* AI Benefits Section */}
      <Section className="bg-gradient-to-br from-primary/5 via-background to-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Intelligence
            </Badge>
            <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
              Why AI Makes All the Difference
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Traditional cleaning services forget. Our AI remembers everything, learns continuously, and gets better with every visit.
            </p>
          </div>

          {/* Before vs After Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Without AI */}
            <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl text-red-800 dark:text-red-200">Traditional Cleaning</CardTitle>
                <p className="text-red-600 dark:text-red-400">
                  Same routine, every time
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-red-700 dark:text-red-300">Repeat instructions every visit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-red-700 dark:text-red-300">Generic cleaning checklist</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-red-700 dark:text-red-300">Missed preferences and details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-red-700 dark:text-red-300">Inconsistent results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-red-700 dark:text-red-300">Higher rework rate (8-12%)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* With AI */}
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-600 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Maidly.ai
                </Badge>
              </div>
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl text-green-800 dark:text-green-200">AI-Powered Cleaning</CardTitle>
                <p className="text-green-600 dark:text-green-400">
                  Learns, remembers, improves
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300">Remembers every preference automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300">Personalized cleaning plan for your home</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300">Detailed crew briefings every visit</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300">Consistently improving results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-300">Ultra-low rework rate (2.1%)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Learning Timeline */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8 font-display">
              Your AI Learning Journey
            </h3>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary via-primary to-primary/30 hidden md:block"></div>
              
              <div className="space-y-8 md:space-y-12">
                {/* Visit 1-2 */}
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-1/2 md:text-right">
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3 md:justify-end">
                          <Badge variant="secondary">Visits 1-2</Badge>
                          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">1</span>
                          </div>
                        </div>
                        <h4 className="font-semibold mb-2">First Impressions</h4>
                        <p className="text-sm text-muted-foreground">
                          Our AI captures your basic preferences: favorite products, pet considerations, access instructions, and initial feedback.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="hidden md:block w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg z-10"></div>
                  <div className="md:w-1/2"></div>
                </div>

                {/* Visit 3-5 */}
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-1/2"></div>
                  <div className="hidden md:block w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg z-10"></div>
                  <div className="md:w-1/2">
                    <Card className="bg-primary/10 border-primary/30">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-primary/30 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">2</span>
                          </div>
                          <Badge variant="secondary">Visits 3-5</Badge>
                        </div>
                        <h4 className="font-semibold mb-2">Building Your Profile</h4>
                        <p className="text-sm text-muted-foreground">
                          AI learns your detailed preferences: specific room priorities, timing preferences, special care items, and cleaning style.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Visit 6+ */}
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="md:w-1/2 md:text-right">
                    <Card className="bg-gradient-to-r from-primary/10 to-primary/20 border-primary/40">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3 md:justify-end">
                          <Badge className="bg-primary text-primary-foreground">Visits 6+</Badge>
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Star className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                        <h4 className="font-semibold mb-2">Fully Personalized</h4>
                        <p className="text-sm text-muted-foreground">
                          Your AI profile is complete! Every crew gets a detailed briefing tailored specifically to your home and preferences.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="hidden md:block w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg z-10"></div>
                  <div className="md:w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center border-0 shadow-lg bg-background/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold mb-2">75% Faster Setup</h4>
                <p className="text-sm text-muted-foreground">
                  No more explaining your preferences every visit. AI briefs the crew before they arrive.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-background/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold mb-2">80% Fewer Callbacks</h4>
                <p className="text-sm text-muted-foreground">
                  AI ensures nothing is missed or forgotten, dramatically reducing the need for return visits.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-background/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold mb-2">4.8/5 Satisfaction</h4>
                <p className="text-sm text-muted-foreground">
                  Customers love the personalized experience that gets better with every single visit.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Customer Quote */}
          <div className="mt-16 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg italic text-foreground mb-4">
                  "It's like having a cleaner who's worked in my home for years, but it only took 3 visits for Maidly to learn everything perfectly. They remember that I want the throw pillows arranged just so, and that my cat needs the bedroom door left open. It's incredible."
                </blockquote>
                <cite className="text-sm text-muted-foreground">
                  — Sarah M., Plano, TX • Customer since Month 2 of Beta
                </cite>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-display-sm font-bold text-center mb-12 font-display">
            Pricing FAQ
          </h2>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">What's included in the base price?</h4>
                <p className="text-sm text-muted-foreground">
                  All standard cleaning tasks (bathrooms, kitchen, bedrooms, living areas), AI preference learning, crew briefings, eco-friendly products, and photo documentation.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Are there any hidden fees?</h4>
                <p className="text-sm text-muted-foreground">
                  No hidden fees. The only additional costs are optional add-on services (like oven cleaning) that you specifically request. All pricing is transparent and agreed upon before service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Can I change my plan frequency?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes! You can adjust your cleaning frequency at any time. Your AI preferences carry over, so there's no loss of personalization when you switch plans.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">What if I'm not satisfied?</h4>
                <p className="text-sm text-muted-foreground">
                  We offer a 100% satisfaction guarantee. If you're not happy with a cleaning, we'll return within 24 hours to make it right at no additional cost.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
            Ready to get started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our beta program and experience the future of home cleaning with personalized AI assistance.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <a href="#waitlist">
              Reserve Your Beta Spot
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No commitment required • Cancel anytime • 20% off first 3 cleanings
          </p>
        </div>
      </Section>
    </>
  );
}
