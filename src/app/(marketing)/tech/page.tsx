import { constructMetadata } from "@/lib/seo";
import { Section } from "@/components/marketing/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Code, 
  Database, 
  Brain, 
  Zap, 
  Shield, 
  Layers,
  GitBranch,
  CheckCircle,
  ArrowRight,
  ExternalLink
} from "lucide-react";

export const metadata = constructMetadata({
  title: "Tech Stack",
  description: "Learn about Maidly.ai's technology stack, AI architecture, and how we build reliable, scalable home services software.",
});

const techStack = [
  {
    category: "Frontend",
    icon: Code,
    technologies: [
      { name: "Next.js 14", description: "App Router, Server Components" },
      { name: "TypeScript", description: "Type-safe development" },
      { name: "Tailwind CSS", description: "Utility-first styling" },
      { name: "Framer Motion", description: "Smooth animations" },
      { name: "shadcn/ui", description: "Accessible component library" },
    ],
  },
  {
    category: "Backend",
    icon: Database,
    technologies: [
      { name: "Node.js", description: "Runtime environment" },
      { name: "PostgreSQL", description: "Primary database" },
      { name: "Prisma", description: "Type-safe ORM" },
      { name: "Redis", description: "Caching and sessions" },
      { name: "Stripe", description: "Payment processing" },
    ],
  },
  {
    category: "AI/ML",
    icon: Brain,
    technologies: [
      { name: "OpenAI GPT-4", description: "Language understanding" },
      { name: "LangChain", description: "AI application framework" },
      { name: "Pinecone", description: "Vector database for RAG" },
      { name: "Python", description: "ML model development" },
      { name: "Hugging Face", description: "Model hosting and fine-tuning" },
    ],
  },
  {
    category: "Infrastructure",
    icon: Layers,
    technologies: [
      { name: "Vercel", description: "Frontend deployment" },
      { name: "Railway", description: "Backend hosting" },
      { name: "AWS S3", description: "File storage" },
      { name: "Cloudflare", description: "CDN and security" },
      { name: "GitHub Actions", description: "CI/CD pipeline" },
    ],
  },
];

const aiArchitecture = [
  {
    component: "Preference Extractor",
    description: "Analyzes customer feedback and extracts structured preferences using NLP",
    tech: ["OpenAI GPT-4", "Custom prompts", "Validation rules"],
  },
  {
    component: "Memory Store",
    description: "Vector database storing customer preferences with semantic search",
    tech: ["Pinecone", "OpenAI Embeddings", "Metadata filtering"],
  },
  {
    component: "Briefing Generator",
    description: "Creates personalized crew instructions from stored preferences",
    tech: ["LangChain", "Template engine", "Context optimization"],
  },
  {
    component: "Feedback Loop",
    description: "Continuously improves preferences based on service outcomes",
    tech: ["Reinforcement learning", "Satisfaction scoring", "Auto-updates"],
  },
];

const codeStyle = [
  {
    principle: "Type Safety First",
    description: "Strict TypeScript with no 'any' types in production code",
    example: "All API responses, database schemas, and component props are fully typed",
  },
  {
    principle: "Component Composition",
    description: "Small, reusable components with clear interfaces",
    example: "Each UI component has a single responsibility and accepts typed props",
  },
  {
    principle: "Server-First Architecture",
    description: "Leverage Next.js Server Components for better performance",
    example: "Data fetching happens on the server, client components only for interactivity",
  },
  {
    principle: "Error Boundaries",
    description: "Graceful error handling at every level",
    example: "API errors, validation failures, and UI errors are all handled gracefully",
  },
];

const contributionGuide = [
  {
    step: "1. Setup",
    items: [
      "Fork the repository on GitHub",
      "Clone your fork locally",
      "Install dependencies with npm install",
      "Copy .env.example to .env.local",
    ],
  },
  {
    step: "2. Development",
    items: [
      "Create a feature branch from main",
      "Run npm run dev for local development",
      "Follow our TypeScript and ESLint rules",
      "Write tests for new functionality",
    ],
  },
  {
    step: "3. Testing",
    items: [
      "Run npm run test for unit tests",
      "Test manually in multiple browsers",
      "Ensure accessibility with screen readers",
      "Check mobile responsiveness",
    ],
  },
  {
    step: "4. Submission",
    items: [
      "Push your branch to your fork",
      "Open a pull request to main",
      "Fill out the PR template completely",
      "Respond to code review feedback",
    ],
  },
];

export default function TechPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            <Code className="w-4 h-4 mr-2" />
            Open Source Friendly
          </Badge>
          <h1 className="text-display-xl font-bold text-foreground mb-6 font-display">
            Tech Stack
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Built with modern tools and practices. Designed for scale, performance, and developer happiness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
              <GitBranch className="mr-2 h-5 w-5" />
              View on GitHub
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Contribution Guide
            </Button>
          </div>
        </div>
      </Section>

      {/* Tech Stack */}
      <Section>
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
            Technology Stack
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We use proven technologies that scale and modern tools that make development enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {techStack.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.category} className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icon className="w-5 h-5 mr-2 text-primary" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.technologies.map((tech) => (
                      <div key={tech.name} className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-foreground">{tech.name}</div>
                          <div className="text-sm text-muted-foreground">{tech.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* AI Architecture */}
      <Section className="bg-muted/20">
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
            AI Architecture
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How our AI memory system learns, stores, and applies customer preferences.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="mb-12">
          <Card className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold mb-2">RAG-Powered Memory Pipeline</h3>
              <p className="text-muted-foreground">Customer feedback → Structured preferences → Crew briefings</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
              {["Customer Feedback", "AI Processing", "Vector Storage", "Crew Briefing"].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className="bg-primary/10 rounded-lg p-4 text-center min-w-[120px]">
                    <div className="text-sm font-medium">{step}</div>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Architecture Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiArchitecture.map((component) => (
            <Card key={component.component}>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">{component.component}</h3>
                <p className="text-sm text-muted-foreground mb-4">{component.description}</p>
                <div className="flex flex-wrap gap-2">
                  {component.tech.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Code Style & Standards */}
      <Section>
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
            Code Style & Standards
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our development principles ensure maintainable, scalable, and reliable code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {codeStyle.map((principle) => (
            <Card key={principle.principle}>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 text-primary mr-2" />
                  {principle.principle}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{principle.description}</p>
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Example:</strong> {principle.example}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Contribution Guide */}
      <Section className="bg-muted/20">
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
            Contribution Guide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to contribute? Here's how to get started with our development workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contributionGuide.map((step) => (
            <Card key={step.step}>
              <CardHeader>
                <CardTitle className="text-lg">{step.step}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {step.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-start">
                      <CheckCircle className="w-3 h-3 text-primary mr-2 mt-1 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">PR Checklist</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Before submitting a pull request, ensure your code passes all checks:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 text-primary mr-1" />
                  TypeScript compiles
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 text-primary mr-1" />
                  ESLint passes
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 text-primary mr-1" />
                  Tests pass
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 text-primary mr-1" />
                  Accessibility tested
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Performance & Security */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
              Performance & Security
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for speed, reliability, and security from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-primary" />
                  Performance Targets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Core Web Vitals</span>
                    <Badge variant="secondary">Excellent</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">LCP &lt; 2.5s, CLS &lt; 0.1, FID &lt; 100ms</div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Bundle Size</span>
                    <Badge variant="secondary">&lt; 100KB</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Gzipped JavaScript for home page</div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Lighthouse Score</span>
                    <Badge variant="secondary">95+</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Performance, Accessibility, Best Practices, SEO</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Security Measures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Data Encryption</span>
                    <Badge variant="secondary">AES-256</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">End-to-end encryption for sensitive data</div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">API Security</span>
                    <Badge variant="secondary">OAuth 2.0</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Rate limiting, CORS, input validation</div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Privacy</span>
                    <Badge variant="secondary">GDPR Ready</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">Data minimization, user consent, right to deletion</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
            Ready to contribute?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our open-source community and help build the future of AI-powered home services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
              <GitBranch className="mr-2 h-5 w-5" />
              Fork on GitHub
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/careers">
                Join the Team
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
