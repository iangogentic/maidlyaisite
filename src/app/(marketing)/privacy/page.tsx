import { constructMetadata } from "@/lib/seo";
import { Section } from "@/components/marketing/section";

export const metadata = constructMetadata({
  title: "Privacy Policy",
  description: "Learn how Maidly.ai protects your privacy and handles your data with transparency and security.",
});

export default function PrivacyPage() {
  return (
    <Section className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1>Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">
          Last updated: January 15, 2024
        </p>

        <h2>Introduction</h2>
        <p>
          At Maidly.ai ("we," "our," or "us"), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered cleaning service.
        </p>

        <h2>Information We Collect</h2>
        
        <h3>Personal Information</h3>
        <p>We may collect personal information that you voluntarily provide to us when you:</p>
        <ul>
          <li>Register for our service</li>
          <li>Schedule a cleaning appointment</li>
          <li>Provide feedback or preferences</li>
          <li>Contact our customer support</li>
          <li>Subscribe to our newsletter</li>
        </ul>

        <p>This information may include:</p>
        <ul>
          <li>Name and contact information (email, phone, address)</li>
          <li>Payment information (processed securely through Stripe)</li>
          <li>Home access details (keys, codes, special instructions)</li>
          <li>Cleaning preferences and feedback</li>
          <li>Pet and family information relevant to cleaning services</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <p>When you visit our website or use our service, we may automatically collect:</p>
        <ul>
          <li>Device information (IP address, browser type, operating system)</li>
          <li>Usage data (pages visited, time spent, click patterns)</li>
          <li>Location data (for service area verification)</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li><strong>Provide Services:</strong> Schedule cleanings, coordinate with crews, process payments</li>
          <li><strong>AI Learning:</strong> Train our AI system to remember your preferences and improve service quality</li>
          <li><strong>Communication:</strong> Send service updates, confirmations, and support messages</li>
          <li><strong>Improvement:</strong> Analyze usage patterns to enhance our platform and services</li>
          <li><strong>Safety:</strong> Ensure the security of your home and our crew members</li>
          <li><strong>Legal Compliance:</strong> Meet legal obligations and protect our rights</li>
        </ul>

        <h2>AI Memory System</h2>
        <p>Our AI assistant learns from your feedback to personalize your cleaning experience:</p>
        
        <h3>What We Store</h3>
        <ul>
          <li>Cleaning product preferences and allergies</li>
          <li>Home access instructions</li>
          <li>Pet behavior and care notes</li>
          <li>Special attention areas and delicate items</li>
          <li>Scheduling preferences</li>
        </ul>

        <h3>How It Works</h3>
        <ul>
          <li>Your feedback is processed using natural language processing</li>
          <li>Preferences are stored as encrypted, structured data</li>
          <li>Our AI generates crew briefings based on your preferences</li>
          <li>The system continuously learns and improves from your feedback</li>
        </ul>

        <h3>Your Control</h3>
        <ul>
          <li>View all stored preferences in your customer dashboard</li>
          <li>Edit or delete any preference at any time</li>
          <li>Pause AI learning temporarily or permanently</li>
          <li>Export all your data in a readable format</li>
        </ul>

        <h2>Information Sharing and Disclosure</h2>
        
        <h3>Service Providers</h3>
        <p>We may share your information with trusted third parties who help us operate our business:</p>
        <ul>
          <li><strong>Cleaning Crews:</strong> Receive relevant preferences and access instructions</li>
          <li><strong>Payment Processors:</strong> Stripe for secure payment processing</li>
          <li><strong>Technology Partners:</strong> Cloud hosting, AI services, and analytics providers</li>
          <li><strong>Communication Services:</strong> Email and SMS providers for service notifications</li>
        </ul>

        <h3>Legal Requirements</h3>
        <p>We may disclose your information if required by law or to:</p>
        <ul>
          <li>Comply with legal processes or government requests</li>
          <li>Protect our rights, property, or safety</li>
          <li>Protect the rights, property, or safety of our users or others</li>
          <li>Investigate fraud or security issues</li>
        </ul>

        <h3>What We Don't Share</h3>
        <p>We never sell, rent, or trade your personal information to third parties for marketing purposes.</p>

        <h2>Data Security</h2>
        <p>We implement robust security measures to protect your information:</p>
        <ul>
          <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using AES-256</li>
          <li><strong>Access Controls:</strong> Strict employee access controls and regular security training</li>
          <li><strong>Infrastructure:</strong> Secure cloud hosting with regular security audits</li>
          <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response procedures</li>
        </ul>

        <h2>Data Retention</h2>
        <p>We retain your information for as long as necessary to provide our services and comply with legal obligations:</p>
        <ul>
          <li><strong>Active Customers:</strong> Data retained while you use our service</li>
          <li><strong>Inactive Accounts:</strong> Data deleted after 2 years of inactivity</li>
          <li><strong>Legal Requirements:</strong> Some data may be retained longer for legal compliance</li>
          <li><strong>User Deletion:</strong> You can request immediate deletion of your account and data</li>
        </ul>

        <h2>Your Privacy Rights</h2>
        <p>Depending on your location, you may have the following rights:</p>
        
        <h3>Access and Portability</h3>
        <ul>
          <li>Request a copy of all personal information we have about you</li>
          <li>Export your data in a machine-readable format</li>
        </ul>

        <h3>Correction and Updates</h3>
        <ul>
          <li>Update your personal information through your account dashboard</li>
          <li>Request correction of inaccurate information</li>
        </ul>

        <h3>Deletion</h3>
        <ul>
          <li>Delete your account and all associated data</li>
          <li>Request deletion of specific information or preferences</li>
        </ul>

        <h3>Opt-Out</h3>
        <ul>
          <li>Unsubscribe from marketing communications</li>
          <li>Disable AI learning and preference storage</li>
          <li>Opt out of non-essential cookies</li>
        </ul>

        <h2>Cookies and Tracking</h2>
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>Remember your preferences and settings</li>
          <li>Analyze website usage and performance</li>
          <li>Provide personalized content and recommendations</li>
          <li>Ensure security and prevent fraud</li>
        </ul>

        <p>You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.</p>

        <h2>Children's Privacy</h2>
        <p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.</p>

        <h2>International Data Transfers</h2>
        <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.</p>

        <h2>Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by:</p>
        <ul>
          <li>Posting the updated policy on our website</li>
          <li>Sending an email notification to registered users</li>
          <li>Providing notice through our service interface</li>
        </ul>

        <h2>Contact Us</h2>
        <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> privacy@maidly.ai</li>
          <li><strong>Address:</strong> Maidly.ai Privacy Team, Dallas, TX</li>
          <li><strong>Phone:</strong> 1-555-MAIDLY</li>
        </ul>

        <p>We will respond to your inquiry within 30 days.</p>

        <hr />
        
        <p className="text-sm text-muted-foreground">
          This Privacy Policy is effective as of January 15, 2024. We are committed to protecting your privacy and will continue to update our practices as we grow and evolve.
        </p>
      </div>
    </Section>
  );
}
