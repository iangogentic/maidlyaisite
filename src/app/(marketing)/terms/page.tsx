import { constructMetadata } from "@/lib/seo";
import { Section } from "@/components/marketing/section";

export const metadata = constructMetadata({
  title: "Terms of Service",
  description: "Read our terms of service for using Maidly.ai's AI-powered home cleaning services.",
});

export default function TermsPage() {
  return (
    <Section className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1>Terms of Service</h1>
        <p className="text-lg text-muted-foreground">
          Last updated: January 15, 2024
        </p>

        <h2>Agreement to Terms</h2>
        <p>
          By accessing or using Maidly.ai's services ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
        </p>

        <h2>Description of Service</h2>
        <p>
          Maidly.ai provides AI-powered home cleaning services that learn and remember your preferences to deliver personalized cleaning experiences. Our Service includes:
        </p>
        <ul>
          <li>Professional home cleaning services</li>
          <li>AI-powered preference learning and memory system</li>
          <li>Online booking and scheduling platform</li>
          <li>Customer dashboard and communication tools</li>
          <li>Quality assurance and satisfaction guarantee</li>
        </ul>

        <h2>Eligibility</h2>
        <p>To use our Service, you must:</p>
        <ul>
          <li>Be at least 18 years old</li>
          <li>Have legal authority to enter into this agreement</li>
          <li>Reside in our current service area (Dallas suburbs)</li>
          <li>Provide accurate and complete information during registration</li>
        </ul>

        <h2>Account Registration</h2>
        <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for:</p>
        <ul>
          <li>Safeguarding your account password</li>
          <li>All activities that occur under your account</li>
          <li>Immediately notifying us of any unauthorized use</li>
          <li>Keeping your contact information up to date</li>
        </ul>

        <h2>Service Booking and Scheduling</h2>
        
        <h3>Booking Process</h3>
        <ul>
          <li>All bookings must be made through our platform or authorized channels</li>
          <li>Bookings are subject to availability and crew scheduling</li>
          <li>We reserve the right to decline service for any reason</li>
          <li>Confirmation will be sent via email or SMS</li>
        </ul>

        <h3>Cancellation Policy</h3>
        <ul>
          <li><strong>24+ hours notice:</strong> Full refund or free rescheduling</li>
          <li><strong>12-24 hours notice:</strong> 50% cancellation fee</li>
          <li><strong>Less than 12 hours:</strong> Full service charge applies</li>
          <li><strong>No-show:</strong> Full service charge plus $50 fee</li>
        </ul>

        <h3>Rescheduling</h3>
        <ul>
          <li>Reschedule up to 24 hours before service at no charge</li>
          <li>Emergency rescheduling may be accommodated case-by-case</li>
          <li>Weather-related cancellations are handled without penalty</li>
        </ul>

        <h2>Payment Terms</h2>
        
        <h3>Pricing</h3>
        <ul>
          <li>All prices are listed in USD and include applicable taxes</li>
          <li>Pricing may vary based on home size, service frequency, and add-ons</li>
          <li>Beta pricing is subject to change with 30 days notice</li>
          <li>Additional services requested during cleaning may incur extra charges</li>
        </ul>

        <h3>Payment Processing</h3>
        <ul>
          <li>Payment is processed automatically after service completion</li>
          <li>We accept major credit cards and ACH transfers</li>
          <li>Payment processing is handled securely through Stripe</li>
          <li>Failed payments may result in service suspension</li>
        </ul>

        <h3>Refunds</h3>
        <ul>
          <li>Satisfaction guarantee: We'll re-clean at no charge if unsatisfied</li>
          <li>Refunds are processed within 5-7 business days</li>
          <li>Partial refunds may be issued for incomplete services</li>
          <li>Dispute resolution follows our customer service process</li>
        </ul>

        <h2>Home Access and Security</h2>
        
        <h3>Access Arrangements</h3>
        <p>You are responsible for providing safe and legal access to your home:</p>
        <ul>
          <li>Provide clear access instructions and any necessary keys or codes</li>
          <li>Ensure all access methods are legal and authorized</li>
          <li>Notify us immediately of any access changes</li>
          <li>Be available by phone during the service window</li>
        </ul>

        <h3>Security and Safety</h3>
        <ul>
          <li>Our crews are background-checked, insured, and bonded</li>
          <li>We maintain comprehensive liability insurance</li>
          <li>You should secure or remove valuable items before service</li>
          <li>Report any security concerns immediately</li>
        </ul>

        <h2>AI Memory System</h2>
        
        <h3>How It Works</h3>
        <p>Our AI system learns from your feedback to improve service quality:</p>
        <ul>
          <li>Feedback is processed to extract cleaning preferences</li>
          <li>Preferences are stored securely and used to brief crews</li>
          <li>The system continuously learns and adapts to your needs</li>
          <li>All data processing follows our Privacy Policy</li>
        </ul>

        <h3>Your Control</h3>
        <ul>
          <li>You can view, edit, or delete preferences at any time</li>
          <li>You can pause or disable AI learning</li>
          <li>You can request data export or deletion</li>
          <li>Crew briefings are generated from your stored preferences</li>
        </ul>

        <h2>Service Standards and Expectations</h2>
        
        <h3>Our Commitments</h3>
        <ul>
          <li>Professional, trained, and background-checked crew members</li>
          <li>Use of quality, eco-friendly cleaning products</li>
          <li>Respect for your home, property, and privacy</li>
          <li>Consistent service based on your preferences</li>
          <li>Responsive customer support</li>
        </ul>

        <h3>Your Responsibilities</h3>
        <ul>
          <li>Provide a safe working environment</li>
          <li>Clear communication about preferences and expectations</li>
          <li>Timely feedback to help our AI system learn</li>
          <li>Respect for our crew members</li>
          <li>Prompt payment for services rendered</li>
        </ul>

        <h2>Prohibited Uses</h2>
        <p>You may not use our Service:</p>
        <ul>
          <li>For any unlawful purpose or to solicit unlawful acts</li>
          <li>To violate any international, federal, provincial, or state regulations or laws</li>
          <li>To transmit or procure the sending of any advertising or promotional material</li>
          <li>To impersonate or attempt to impersonate the Company, employees, or other users</li>
          <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
          <li>To submit false or misleading information</li>
        </ul>

        <h2>Intellectual Property Rights</h2>
        <p>
          The Service and its original content, features, and functionality are and will remain the exclusive property of Maidly.ai and its licensors. The Service is protected by copyright, trademark, and other laws.
        </p>

        <h2>Privacy Policy</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
        </p>

        <h2>Disclaimers and Limitation of Liability</h2>
        
        <h3>Service Availability</h3>
        <ul>
          <li>Service availability is subject to crew scheduling and capacity</li>
          <li>We may suspend service for maintenance or improvements</li>
          <li>Weather or emergency conditions may affect service delivery</li>
          <li>We are not liable for delays beyond our reasonable control</li>
        </ul>

        <h3>Limitation of Liability</h3>
        <p>
          In no event shall Maidly.ai, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
        </p>

        <h3>Insurance and Damages</h3>
        <ul>
          <li>We maintain comprehensive liability and bonding insurance</li>
          <li>Damage claims must be reported within 24 hours of service</li>
          <li>We will investigate and resolve legitimate damage claims promptly</li>
          <li>Our liability is limited to the cost of repair or replacement</li>
        </ul>

        <h2>Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless Maidly.ai and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees).
        </p>

        <h2>Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be interpreted and governed by the laws of the State of Texas, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
        </p>

        <h2>Contact Information</h2>
        <p>If you have any questions about these Terms of Service, please contact us:</p>
        <ul>
          <li><strong>Email:</strong> legal@maidly.ai</li>
          <li><strong>Address:</strong> Maidly.ai Legal Team, Dallas, TX</li>
          <li><strong>Phone:</strong> 1-555-MAIDLY</li>
        </ul>

        <hr />
        
        <p className="text-sm text-muted-foreground">
          These Terms of Service are effective as of January 15, 2024. By using our Service, you acknowledge that you have read and understood these Terms and agree to be bound by them.
        </p>
      </div>
    </Section>
  );
}
