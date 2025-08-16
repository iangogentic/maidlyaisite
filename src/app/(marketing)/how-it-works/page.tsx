import { constructMetadata } from "@/lib/seo";
import { Section } from "@/components/marketing/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Brain, Clock, Users, Sparkles } from "lucide-react";

export const metadata = constructMetadata({
  title: "How It Works",
  description: "Learn how Maidly.ai's AI-powered cleaning service remembers your preferences and delivers personalized home cleaning.",
});

const steps = [
  {
    icon: Users,
    title: "Book Your Service",
    description: "Schedule your cleaning in under 60 seconds with transparent pricing and instant confirmation.",
    features: [
      "Instant online booking",
      "Transparent, upfront pricing",
      "Vetted and insured professionals",
      "Flexible scheduling options",
    ],
  },
  {
    icon: Sparkles,
    title: "Professional Cleaning",
    description: "Our trained crews arrive with hotel-grade standards and eco-friendly products.",
    features: [
      "Hotel-grade cleaning standards",
      "Eco-friendly product options",
      "Photo documentation",
      "Quality guarantee",
    ],
  },
  {
    icon: Brain,
    title: "AI Learning & Memory",
    description: "Our AI assistant learns from your feedback and creates a personalized cleaning profile.",
    features: [
      "Preference learning from feedback",
      "Crew briefings before each visit",
      "Continuous service improvement",
      "Personalized cleaning protocols",
    ],
  },
];

const whatWeStore = [
  {
    category: "Cleaning Preferences",
    items: [
      "Product sensitivities and allergies",
      "Preferred cleaning products",
      "Areas requiring special attention",
      "Cleaning frequency preferences",
    ],
  },
  {
    category: "Access & Safety",
    items: [
      "Entry instructions and key locations",
      "Security system details",
      "Parking instructions",
      "Emergency contact information",
    ],
  },
  {
    category: "Household Notes",
    items: [
      "Pet behavior and care instructions",
      "Valuable or delicate items",
      "Family schedules and preferences",
      "Special care requirements",
    ],
  },
];

const whatWeDont = [
  "Personal conversations or private information",
  "Financial or payment details beyond service",
  "Unrelated personal data",
  "Information from other service providers",
];

const faqs = [
  {
    question: "How does the AI learn my preferences?",
    answer: "Our AI analyzes feedback from your cleaning sessions, notes from our crew, and any specific requests you make. Over time, it builds a comprehensive profile of how you like your home cleaned, which products to use or avoid, and any special instructions for your space.",
  },
  {
    question: "Can I see what preferences have been stored?",
    answer: "Absolutely! You can view, edit, or delete any stored preferences through your customer dashboard. We believe in complete transparency about what information we have and how it's used to improve your service.",
  },
  {
    question: "What if I want to pause or delete the memory system?",
    answer: "You have full control over your data. You can pause the learning system at any time, delete specific preferences, or request complete data deletion. Your cleaning service will continue, but crews won't receive AI-generated briefings.",
  },
  {
    question: "How do you ensure my data privacy?",
    answer: "We use end-to-end encryption for all data storage and transmission. Your information is never sold to third parties, and we follow strict data minimization practices—we only store what's necessary to improve your cleaning service.",
  },
  {
    question: "Do cleaning crews see all my stored information?",
    answer: "Crews receive only relevant, service-related briefings. They see cleaning preferences, access instructions, and safety notes, but not personal details like family schedules or private conversations.",
  },
  {
    question: "Can I export my data?",
    answer: "Yes, you can request a complete export of your stored preferences and service history at any time. We provide this data in a standard, readable format within 48 hours of your request.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            <Brain className="w-4 h-4 mr-2" />
            AI-Powered Cleaning
          </Badge>
          <h1 className="text-display-xl font-bold text-foreground mb-6 font-display">
            How Maidly.ai Works
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how our AI assistant learns your preferences and transforms your cleaning experience over time.
          </p>
        </div>
      </Section>

      {/* Step-by-Step Process */}
      <Section>
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
            Three Steps to Personalized Cleaning
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our process is designed to get better with every visit, learning and adapting to your unique needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="relative border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-primary font-semibold">Step {index + 1}</div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{step.description}</p>
                  <ul className="space-y-2">
                    {step.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* What We Store vs What We Don't */}
      <Section className="bg-muted/20">
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
            Transparent Data Practices
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We believe in complete transparency about what information we collect and how it's used.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* What We Store */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-green-500" />
              <h3 className="text-xl font-semibold text-foreground">What We Store</h3>
            </div>
            <div className="space-y-6">
              {whatWeStore.map((category) => (
                <Card key={category.category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item) => (
                        <li key={item} className="flex items-start text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* What We Don't Store */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-semibold text-foreground">What We Don't Store</h3>
            </div>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {whatWeDont.map((item) => (
                    <li key={item} className="flex items-start text-sm text-muted-foreground">
                      <div className="w-4 h-4 border-2 border-red-500 rounded mr-2 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Privacy Promise:</strong> We never sell your data to third parties and use military-grade encryption to protect your information.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section>
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about our AI-powered cleaning service.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
            Ready to experience personalized cleaning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our beta program in the Dallas area and see how AI can transform your home cleaning experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
            >
              <Clock className="w-4 h-4 mr-2" />
              Get Early Access
            </a>
            <a
              href="/careers"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4"
            >
              Join Our Team
            </a>
          </div>
        </div>
      </Section>
    </>
  );
}
