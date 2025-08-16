import { constructMetadata } from "@/lib/seo";
import { Section } from "@/components/marketing/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Clock, Home, Sparkles, ArrowRight } from "lucide-react";

export const metadata = constructMetadata({
  title: "Pricing",
  description: "Transparent pricing for AI-powered home cleaning. Weekly, bi-weekly, and monthly plans available in Dallas suburbs.",
});

const plans = [
  {
    name: "Bi-weekly",
    description: "Perfect for busy families",
    price: "$120",
    period: "per visit",
    popular: false,
    features: [
      "Every 2 weeks cleaning",
      "AI preference learning",
      "Crew briefings",
      "Eco-friendly products",
      "Photo documentation",
      "Quality guarantee",
      "Flexible rescheduling",
    ],
    addOns: [
      { name: "Inside oven", price: "$25" },
      { name: "Inside refrigerator", price: "$20" },
      { name: "Garage organization", price: "$40" },
    ],
  },
  {
    name: "Weekly",
    description: "Maximum convenience & learning",
    price: "$95",
    period: "per visit",
    popular: true,
    features: [
      "Weekly cleaning service",
      "Fastest AI learning curve",
      "Priority crew briefings",
      "Premium product options",
      "Same-day photo reports",
      "Quality guarantee",
      "Priority rescheduling",
      "Dedicated crew assignment",
    ],
    addOns: [
      { name: "Inside oven", price: "$20" },
      { name: "Inside refrigerator", price: "$15" },
      { name: "Garage organization", price: "$35" },
    ],
  },
  {
    name: "Monthly",
    description: "Budget-friendly option",
    price: "$150",
    period: "per visit",
    popular: false,
    features: [
      "Monthly deep cleaning",
      "AI preference tracking",
      "Basic crew briefings",
      "Standard products",
      "Photo documentation",
      "Quality guarantee",
    ],
    addOns: [
      { name: "Inside oven", price: "$30" },
      { name: "Inside refrigerator", price: "$25" },
      { name: "Garage organization", price: "$50" },
    ],
  },
];

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
      <Section className="pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            <Home className="w-4 h-4 mr-2" />
            Beta Pricing - Dallas Suburbs
          </Badge>
          <h1 className="text-display-xl font-bold text-foreground mb-6 font-display">
            Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the cleaning frequency that works for your lifestyle. All plans include our AI memory system and quality guarantee.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-primary font-medium">
              🎉 Beta Special: 20% off your first 3 cleanings
            </p>
          </div>
        </div>
      </Section>

      {/* Pricing Cards */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-2 border-primary shadow-lg scale-105"
                  : "border hover:border-primary/20"
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <p className="text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                  {plan.popular && (
                    <div className="text-sm text-primary font-medium mt-2">
                      Save $25 per visit vs monthly
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Features */}
                <div>
                  <h4 className="font-semibold mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Add-ons */}
                <div>
                  <h4 className="font-semibold mb-3">Popular add-ons:</h4>
                  <ul className="space-y-1">
                    {plan.addOns.map((addOn) => (
                      <li key={addOn.name} className="flex justify-between text-sm text-muted-foreground">
                        <span>{addOn.name}</span>
                        <span>{addOn.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : ""
                  } group`}
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <a href="#waitlist">
                    Reserve Your Slot
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Beta Perks */}
        <div className="mt-16 max-w-4xl mx-auto">
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

      {/* Pricing Details */}
      <Section className="bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-display-sm font-bold text-center mb-12 font-display">
            Pricing Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="w-5 h-5 mr-2 text-primary" />
                  Service Area & Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Current Service Area:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Plano, TX</li>
                    <li>• Frisco, TX</li>
                    <li>• Allen, TX</li>
                    <li>• McKinney, TX (select areas)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Pricing Notes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Prices based on 2-3 bedroom homes</li>
                    <li>• Larger homes: +$20-40 per visit</li>
                    <li>• First-time deep clean: +$50</li>
                    <li>• No contracts or cancellation fees</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  AI Memory Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">How AI Improves Value:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Reduces rework and callbacks</li>
                    <li>• Faster, more efficient cleaning</li>
                    <li>• Personalized service every visit</li>
                    <li>• Crew preparation saves time</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Learning Timeline:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Visit 1-2: Basic preferences captured</li>
                    <li>• Visit 3-5: Detailed profile built</li>
                    <li>• Visit 6+: Fully personalized service</li>
                  </ul>
                </div>
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
