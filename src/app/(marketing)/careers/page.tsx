import { constructMetadata } from "@/lib/seo";
import { Section } from "@/components/marketing/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Palette, 
  Brain, 
  BarChart3, 
  Rocket, 
  Users, 
  MapPin, 
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react";

export const metadata = constructMetadata({
  title: "Careers - Join the Build Team",
  description: "Join Maidly.ai and build the future of AI-powered home services. Open internship tracks in AI/Agents, Full-stack, Design, and Data.",
});

const tracks = [
  {
    icon: Brain,
    title: "AI/Agents",
    description: "Build intelligent systems that learn and remember customer preferences",
    skills: ["Python", "LangChain", "RAG", "Vector DBs", "OpenAI API"],
    projects: [
      "Preference extraction from natural language",
      "Crew briefing generation system",
      "Feedback analysis pipeline",
      "Memory consolidation algorithms",
    ],
    level: "Intermediate to Advanced",
  },
  {
    icon: Code,
    title: "Full-stack",
    description: "Create seamless experiences from booking to post-service feedback",
    skills: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Stripe"],
    projects: [
      "Customer dashboard with preference management",
      "Crew mobile app for briefings",
      "Real-time scheduling system",
      "Payment and billing automation",
    ],
    level: "Beginner to Intermediate",
  },
  {
    icon: Palette,
    title: "Design/Brand",
    description: "Shape the visual identity and user experience of AI-powered home services",
    skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Brand Strategy"],
    projects: [
      "Customer onboarding flow redesign",
      "Crew mobile app UX",
      "Brand identity evolution",
      "Marketing website optimization",
    ],
    level: "Beginner to Intermediate",
  },
  {
    icon: BarChart3,
    title: "Data/Insights",
    description: "Turn cleaning data into actionable insights for customers and operations",
    skills: ["SQL", "Python", "Tableau", "Statistics", "A/B Testing"],
    projects: [
      "Customer satisfaction prediction model",
      "Crew performance analytics dashboard",
      "Pricing optimization analysis",
      "Market expansion data modeling",
    ],
    level: "Intermediate",
  },
];

const dayOneStarters = [
  {
    title: "Improve the Memory Ribbon UX",
    description: "Make preference chips editable in-place with smooth animations",
    track: "Full-stack",
    difficulty: "Medium",
    impact: "High",
  },
  {
    title: "Build a Preference Extractor",
    description: "Create regex + rules engine to turn feedback into structured preferences",
    track: "AI/Agents",
    difficulty: "Medium",
    impact: "High",
  },
  {
    title: "Design New KPI Visualizations",
    description: "Add area charts for 'Preferences Learned' with micro-interactions",
    track: "Design/Brand",
    difficulty: "Easy",
    impact: "Medium",
  },
  {
    title: "Write Build Log #1",
    description: "Document our AI memory system architecture for the engineering blog",
    track: "Any",
    difficulty: "Easy",
    impact: "Medium",
  },
];

const whyMaidly = [
  {
    icon: Users,
    title: "Real Users, Real Impact",
    description: "Your code serves actual families in Dallas. See immediate feedback and usage.",
  },
  {
    icon: Zap,
    title: "Ship Energy",
    description: "We deploy daily. Your features go live fast, and you own the entire lifecycle.",
  },
  {
    icon: Rocket,
    title: "Ownership Culture",
    description: "Lead projects from day one. No busy work—just meaningful contributions to our mission.",
  },
  {
    icon: Sparkles,
    title: "AI-First Mindset",
    description: "Work with cutting-edge AI tools and build systems that get smarter over time.",
  },
];

const perks = [
  "Competitive internship stipend",
  "Flexible remote + Dallas office",
  "Latest MacBook Pro + setup budget",
  "Mentorship from senior engineers",
  "Full-time offer potential",
  "Stock options for exceptional performers",
];

export default function CareersPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            <Rocket className="w-4 h-4 mr-2" />
            Now Hiring - Internships
          </Badge>
          <h1 className="text-display-xl font-bold text-foreground mb-6 font-display">
            Join the Build Team
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Build agents with real users. Ship memory, RAG, and ops automation to thousands of homes. Internship tracks open now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
              Apply Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              View Open Roles
            </Button>
          </div>
        </div>
      </Section>

      {/* Tracks */}
      <Section>
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
            Internship Tracks
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose your path and start building the future of AI-powered home services.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tracks.map((track) => {
            const Icon = track.icon;
            return (
              <Card key={track.title} className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{track.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {track.level}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">{track.description}</p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Tech Stack:</h4>
                    <div className="flex flex-wrap gap-2">
                      {track.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Sample Projects:</h4>
                    <ul className="space-y-1">
                      {track.projects.map((project) => (
                        <li key={project} className="text-sm text-muted-foreground flex items-start">
                          <CheckCircle className="w-3 h-3 text-primary mr-2 mt-1 flex-shrink-0" />
                          {project}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Day-1 Starter Tasks */}
      <Section className="bg-muted/20">
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
            Day-1 Starter Tasks
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hit the ground running with these real projects that ship to production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dayOneStarters.map((task) => (
            <Card key={task.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    {task.track}
                  </Badge>
                  <div className="flex gap-2">
                    <Badge 
                      variant={task.difficulty === "Easy" ? "secondary" : task.difficulty === "Medium" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {task.difficulty}
                    </Badge>
                    <Badge 
                      variant={task.impact === "High" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {task.impact} Impact
                    </Badge>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{task.title}</h3>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Why Maidly */}
      <Section>
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
            Why Maidly?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're not just another startup. We're building something that matters, with a team that ships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyMaidly.map((reason) => {
            const Icon = reason.icon;
            return (
              <Card key={reason.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{reason.title}</h3>
                  <p className="text-sm text-muted-foreground">{reason.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Ship Energy Timeline */}
      <Section className="bg-muted/20">
        <div className="text-center mb-16">
          <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
            Ship Energy Timeline
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how fast we move from idea to production.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary/20 rounded-full" />
            
            <div className="space-y-8">
              {[
                { day: "Week 1", title: "Memory Ribbon v1", description: "Interactive preference chips with add/remove" },
                { day: "Week 2", title: "Crew Briefing System", description: "AI-generated cleaning instructions from preferences" },
                { day: "Week 3", title: "Feedback Loop", description: "Customer feedback automatically updates preferences" },
                { day: "Week 4", title: "Analytics Dashboard", description: "Real-time KPIs and satisfaction tracking" },
              ].map((milestone, index) => (
                <div key={milestone.day} className="relative flex items-center">
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 order-2'}`}>
                    <Card>
                      <CardContent className="pt-4">
                        <Badge variant="outline" className="mb-2">
                          {milestone.day}
                        </Badge>
                        <h3 className="font-semibold">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Perks & Benefits */}
      <Section>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-md font-bold text-foreground mb-4 font-display">
              Perks & Benefits
            </h2>
            <p className="text-lg text-muted-foreground">
              We invest in our team because great people build great products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Location & Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {perks.slice(0, 3).map((perk) => (
                    <li key={perk} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-primary" />
                  Growth & Future
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {perks.slice(3).map((perk) => (
                    <li key={perk} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
            Ready to build the future?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join our team and help create AI-powered home services that millions of families will love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
              Apply for Internship
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              Join Our Discord
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Applications reviewed weekly • Start dates flexible • Remote-friendly
          </p>
        </div>
      </Section>
    </>
  );
}
