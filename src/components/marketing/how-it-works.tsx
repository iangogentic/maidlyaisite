"use client";

import { motion } from "framer-motion";
import { Calendar, Sparkles, RotateCcw, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Calendar,
    title: "Book",
    description: "Instant quotes, vetted crews, photo checklists.",
    details: [
      "Schedule in 60 seconds",
      "Transparent pricing",
      "Vetted professionals",
      "Photo documentation",
    ],
  },
  {
    icon: Sparkles,
    title: "Clean",
    description: "Pros with hotel-grade standards.",
    details: [
      "Hotel-grade cleaning",
      "Eco-friendly products",
      "Insured & bonded",
      "Quality guarantee",
    ],
  },
  {
    icon: RotateCcw,
    title: "Remember",
    description: "Your preferences become a living profile the team sees before every visit.",
    details: [
      "AI learns preferences",
      "Crew briefings",
      "Continuous improvement",
      "Personalized service",
    ],
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-display-md font-bold text-foreground mb-4 font-display"
          >
            How the AI Maid works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Three simple steps to a perfectly personalized cleaning experience
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="relative h-full border-2 hover:border-primary/20 transition-colors duration-300 group">
                  <CardContent className="p-8">
                    {/* Step number */}
                    <div className="absolute -top-4 left-8">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className="mb-6 mt-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Details */}
                    <ul className="space-y-2">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>


      </div>
    </section>
  );
}
