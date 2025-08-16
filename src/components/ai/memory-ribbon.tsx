"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MemoryChip {
  id: string;
  label: string;
  category: "cleaning" | "products" | "access" | "pets" | "special";
  removable?: boolean;
}

const defaultChips: MemoryChip[] = [
  { id: "1", label: "No bleach", category: "products" },
  { id: "2", label: "Unscented", category: "products" },
  { id: "3", label: "Lock side gate", category: "access" },
  { id: "4", label: "Cat is friendly", category: "pets" },
  { id: "5", label: "Extra gentle on antiques", category: "special" },
];

const categoryColors = {
  cleaning: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  products: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  access: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  pets: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  special: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
};

interface MemoryRibbonProps {
  interactive?: boolean;
  className?: string;
}

export function MemoryRibbon({ interactive = false, className }: MemoryRibbonProps) {
  const [chips, setChips] = useState<MemoryChip[]>(defaultChips);
  const [isAdding, setIsAdding] = useState(false);

  const removeChip = (id: string) => {
    setChips(chips.filter(chip => chip.id !== id));
  };

  const addChip = () => {
    const newChip: MemoryChip = {
      id: Date.now().toString(),
      label: "New preference",
      category: "cleaning",
      removable: true,
    };
    setChips([...chips, newChip]);
    setIsAdding(false);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary animate-shimmer" />
          <h3 className="font-semibold text-foreground">Known Preferences</h3>
        </div>
        {interactive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      {/* Chips container */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {chips.map((chip, index) => (
            <motion.div
              key={chip.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                duration: 0.2,
                delay: interactive ? 0 : index * 0.1 
              }}
            >
              <Badge
                variant="secondary"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium border transition-all duration-200",
                  categoryColors[chip.category],
                  interactive && "hover:shadow-sm cursor-pointer",
                  !interactive && "animate-shimmer"
                )}
              >
                <span>{chip.label}</span>
                {interactive && chip.removable && (
                  <button
                    onClick={() => removeChip(chip.id)}
                    className="ml-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${chip.label} preference`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            </motion.div>
          ))}
          
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={addChip}
                className="h-8 px-3 text-sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add preference
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Helper text */}
      {!interactive && (
        <p className="text-xs text-muted-foreground">
          Your AI assistant learns and remembers these preferences for every visit
        </p>
      )}
    </div>
  );
}
