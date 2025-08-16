import { constructMetadata } from "@/lib/seo";
import { Section } from "@/components/marketing/section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import Link from "next/link";

export const metadata = constructMetadata({
  title: "Blog",
  description: "Latest updates, technical insights, and stories from the Maidly.ai team building the future of AI-powered home services.",
});

// In a real app, this would come from a CMS or file system
const blogPosts = [
  {
    slug: "introducing-maidly-ai",
    title: "Introducing Maidly.ai: The Future of Home Cleaning",
    description: "We're building an AI-powered cleaning service that remembers your preferences and gets better with every visit.",
    date: "2024-01-15",
    author: "Maidly Team",
    tags: ["announcement", "ai", "cleaning"],
    readTime: "3 min read",
    featured: true,
  },
  {
    slug: "building-ai-memory-system",
    title: "Building an AI Memory System for Home Services",
    description: "A deep dive into how we built our RAG-powered preference learning system that gets smarter with every cleaning.",
    date: "2024-01-22",
    author: "Engineering Team",
    tags: ["engineering", "ai", "rag", "technical"],
    readTime: "8 min read",
    featured: false,
  },
];

const tagColors = {
  announcement: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  ai: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  cleaning: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  engineering: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  rag: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  technical: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export default function BlogPage() {
  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);

  return (
    <>
      {/* Hero Section */}
      <Section className="pt-24 pb-16 bg-gradient-to-b from-background to-muted/20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-display-xl font-bold text-foreground mb-6 font-display">
            Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Latest updates, technical insights, and stories from our team building the future of AI-powered home services.
          </p>
        </div>
      </Section>

      {/* Featured Post */}
      {featuredPost && (
        <Section className="py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Featured Post</h2>
          </div>
          
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredPost.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={tagColors[tag as keyof typeof tagColors] || ""}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-4 hover:text-primary transition-colors">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {featuredPost.description}
                  </p>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredPost.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium group"
                  >
                    Read full post
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
                
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6 h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🚀</div>
                      <div className="text-sm text-muted-foreground">Featured Story</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Section>
      )}

      {/* Regular Posts */}
      <Section className="py-12 bg-muted/20">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">All Posts</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {regularPosts.map((post) => (
            <Card key={post.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="hover:text-primary transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {post.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-primary hover:text-primary/80 text-sm font-medium group"
                  >
                    Read more
                    <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1 inline" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Newsletter Signup */}
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-display-sm font-bold text-foreground mb-4 font-display">
            Stay Updated
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Get the latest updates on our AI development, new features, and insights from our team.
          </p>
          
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              No spam, unsubscribe at any time. We respect your privacy.
            </p>
          </Card>
        </div>
      </Section>
    </>
  );
}
