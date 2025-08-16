import { notFound } from "next/navigation";
import { constructMetadata } from "@/lib/seo";
import { Section } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

// In a real app, this would come from a CMS or file system
const blogPosts = {
  "introducing-maidly-ai": {
    title: "Introducing Maidly.ai: The Future of Home Cleaning",
    description: "We're building an AI-powered cleaning service that remembers your preferences and gets better with every visit.",
    date: "2024-01-15",
    author: "Maidly Team",
    tags: ["announcement", "ai", "cleaning"],
    readTime: "3 min read",
    content: `
# Introducing Maidly.ai: The Future of Home Cleaning

Today, we're excited to announce Maidly.ai—a revolutionary approach to home cleaning that combines professional service with artificial intelligence to create a truly personalized experience.

## The Problem We're Solving

Traditional cleaning services face a fundamental challenge: they treat every home the same. Your cleaner might use products you're allergic to, miss areas that matter to you, or forget special instructions about your pets. Each visit feels like starting over.

We believe your home deserves better.

## Our Solution: AI-Powered Memory

Maidly.ai introduces an AI assistant that learns and remembers your preferences. Here's how it works:

### 1. Learning Phase
During your first few cleanings, our AI pays attention to your feedback:
- "Please use unscented products—I have allergies"
- "My cat is friendly, no need to contain him"
- "The antique dresser needs extra gentle care"

### 2. Memory Building
This feedback gets processed and stored as structured preferences in our AI memory system. We use advanced natural language processing to understand context and intent.

### 3. Crew Briefings
Before each visit, our AI generates a personalized briefing for your cleaning crew, ensuring they know exactly how you like things done.

## Early Results

In our Dallas beta program, we've seen remarkable improvements:
- **4.8/5** average satisfaction rating
- **65% reduction** in rework requests
- **47 preferences** learned per customer on average

## What's Next

We're expanding our beta program throughout the Dallas suburbs and building new features:
- **Smart scheduling** based on your lifestyle patterns
- **Product recommendations** tailored to your preferences
- **Predictive maintenance** alerts for your home

## Join the Beta

Ready to experience the future of home cleaning? We're accepting new beta customers in the Dallas area.

[Sign up for early access](/pricing) and be part of the AI cleaning revolution.

---

*Have questions about our AI system? Check out our [How It Works](/how-it-works) page or reach out to our team.*
    `,
  },
  "building-ai-memory-system": {
    title: "Building an AI Memory System for Home Services",
    description: "A deep dive into how we built our RAG-powered preference learning system that gets smarter with every cleaning.",
    date: "2024-01-22",
    author: "Engineering Team",
    tags: ["engineering", "ai", "rag", "technical"],
    readTime: "8 min read",
    content: `
# Building an AI Memory System for Home Services

One of the biggest challenges in home services is personalization at scale. How do you remember that Mrs. Johnson prefers lavender-scented products while Mr. Chen needs everything to be unscented? How do you ensure this knowledge transfers between different crew members?

At Maidly.ai, we solved this with a custom AI memory system built on Retrieval-Augmented Generation (RAG). Here's how we did it.

## The Architecture

Our memory system consists of four main components:

### 1. Preference Extractor
When customers provide feedback, our AI extracts structured preferences using GPT-4:

\`\`\`typescript
interface Preference {
  category: 'products' | 'access' | 'pets' | 'special';
  label: string;
  confidence: number;
  context: string;
}
\`\`\`

**Input:** "Please don't use any bleach products, they trigger my asthma"
**Output:** 
\`\`\`json
{
  "category": "products",
  "label": "No bleach products",
  "confidence": 0.95,
  "context": "Customer has asthma sensitivity"
}
\`\`\`

### 2. Vector Storage
We use Pinecone to store preferences as embeddings, enabling semantic search:

\`\`\`python
# Store preference with metadata
index.upsert([
    {
        "id": f"{customer_id}_{preference_id}",
        "values": embedding,
        "metadata": {
            "customer_id": customer_id,
            "category": preference.category,
            "label": preference.label,
            "active": True,
            "created_at": timestamp
        }
    }
])
\`\`\`

### 3. Briefing Generator
Before each cleaning, we query the vector database and generate crew briefings:

\`\`\`typescript
const briefing = await generateBriefing({
  customerPreferences: preferences,
  homeDetails: homeInfo,
  previousVisits: visitHistory
});
\`\`\`

### 4. Feedback Loop
After each visit, we analyze outcomes to improve our system:
- Did the crew follow the briefing correctly?
- Were there any new preferences mentioned?
- How satisfied was the customer?

## Technical Challenges

### Challenge 1: Preference Conflicts
What happens when a customer says "use eco-friendly products" but later requests "the strongest cleaner possible"?

**Solution:** We implemented a confidence scoring system and temporal weighting. Recent preferences get higher priority, and we flag conflicts for human review.

### Challenge 2: Context Understanding
"Don't wake the baby" means different things at different times of day.

**Solution:** We store contextual metadata and use LangChain to build dynamic prompts that consider time, day of week, and household patterns.

### Challenge 3: Privacy & Security
Customer preferences contain sensitive information about their homes and families.

**Solution:** 
- End-to-end encryption for all stored data
- Minimal data retention (preferences only, no personal details)
- Customer control over data deletion

## Results & Metrics

After 6 months of development and 3 months of beta testing:

- **95% accuracy** in preference extraction
- **2.1% rework rate** (down from 8.5% industry average)
- **4.8/5 satisfaction** rating from beta customers
- **47 preferences** learned per customer on average

## What's Next

We're working on several exciting improvements:

### Predictive Preferences
Using machine learning to predict preferences before customers explicitly state them:
"Based on your home and family profile, you might prefer..."

### Multi-Modal Learning
Incorporating photos from cleaning visits to learn visual preferences:
"Customer prefers books organized by height, not alphabetically"

### Crew Optimization
Matching customers with crews based on preference compatibility and past performance.

## Open Source Components

We believe in giving back to the community. We've open-sourced several components:

- **Preference Parser**: NLP library for extracting structured data from feedback
- **RAG Utils**: Helper functions for vector database operations
- **Briefing Templates**: Customizable templates for generating crew instructions

Check out our [GitHub repository](https://github.com/maidlyai) to contribute or learn more.

## Conclusion

Building an AI memory system for home services required solving unique challenges around privacy, context, and real-world reliability. The result is a system that truly learns and improves with every interaction.

We're just getting started. As we expand beyond Dallas, we're excited to see how our AI memory system performs across different markets and customer preferences.

---

*Want to dive deeper into our technical architecture? Join our engineering team! We're hiring across AI/ML, full-stack, and data roles. [View open positions](/careers).*
    `,
  },
};

const tagColors = {
  announcement: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  ai: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  cleaning: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  engineering: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  rag: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  technical: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug as keyof typeof blogPosts];
  
  if (!post) {
    return constructMetadata({
      title: "Post Not Found",
      description: "The blog post you're looking for doesn't exist.",
    });
  }

  return constructMetadata({
    title: post.title,
    description: post.description,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts[slug as keyof typeof blogPosts];
  
  if (!post) {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <Section className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-8 p-0" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className={tagColors[tag as keyof typeof tagColors] || ""}
              >
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-display-lg font-bold text-foreground mb-6 font-display">
            {post.title}
          </h1>
          
          <div className="flex items-center gap-6 text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {post.author}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </div>
          </div>
        </div>
      </Section>

      {/* Content */}
      <Section className="py-0">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            {/* This is a simplified version - in a real app, you'd use MDX compilation */}
            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }} />
          </div>
        </div>
      </Section>

      {/* Navigation */}
      <Section className="py-12 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="outline" asChild>
                <Link href="/blog">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  All Posts
                </Link>
              </Button>
            </div>
            <div>
              <Button asChild>
                <Link href="/careers">
                  Join Our Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
