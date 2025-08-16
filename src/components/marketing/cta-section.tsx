"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Code } from "lucide-react";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-display-md font-bold text-foreground mb-6 font-display"
          >
            Ready to experience the future of home cleaning?
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Join our beta program or help us build the next generation of AI-powered home services.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto"
          >
            {/* Customer CTA */}
            <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/20 transition-colors duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                For Customers
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Get early access to AI-powered cleaning in the Dallas area
              </p>
              <Button
                asChild
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group"
              >
                <Link href="#waitlist">
                  Get Early Access
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            {/* Builder CTA */}
            <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/20 transition-colors duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4 mx-auto">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                For Builders
              </h3>
              <p className="text-muted-foreground mb-6 text-sm">
                Join our team and build the future of AI-powered home services
              </p>
              <Button
                asChild
                variant="outline"
                className="w-full group"
              >
                <Link href="/careers">
                  Join the Team
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
