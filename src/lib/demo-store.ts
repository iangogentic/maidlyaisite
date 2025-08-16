import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export interface Preference {
  id: string;
  label: string;
  category: "cleaning" | "products" | "access" | "pets" | "special";
  active: boolean;
  addedAt: Date;
}

export interface DemoState {
  // Chat state
  messages: ChatMessage[];
  isTyping: boolean;
  
  // Preferences state
  preferences: Preference[];
  
  // Demo metrics
  satisfactionScore: number;
  preferencesLearned: number;
  reworkRate: number;
  
  // Actions
  addMessage: (content: string, sender: "user" | "ai") => void;
  setTyping: (typing: boolean) => void;
  addPreference: (label: string, category: Preference["category"]) => void;
  removePreference: (id: string) => void;
  togglePreference: (id: string) => void;
  clearChat: () => void;
  resetDemo: () => void;
  updateMetrics: () => void;
}

// Default preferences for demo
const defaultPreferences: Preference[] = [
  {
    id: "1",
    label: "No bleach products",
    category: "products",
    active: true,
    addedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    label: "Unscented cleaners only",
    category: "products",
    active: true,
    addedAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    label: "Lock side gate after entry",
    category: "access",
    active: true,
    addedAt: new Date("2024-02-01"),
  },
  {
    id: "4",
    label: "Cat is friendly, no need to contain",
    category: "pets",
    active: true,
    addedAt: new Date("2024-02-10"),
  },
];

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [
        {
          id: "welcome",
          content: "Hi! I'm your AI Maid assistant. I help remember your cleaning preferences and create personalized briefs for our crew. How can I help you today?",
          sender: "ai",
          timestamp: new Date(),
        },
      ],
      isTyping: false,
      preferences: defaultPreferences,
      satisfactionScore: 4.8,
      preferencesLearned: defaultPreferences.length,
      reworkRate: 2.1,

      // Actions
      addMessage: (content, sender) => {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          content,
          sender,
          timestamp: new Date(),
        };
        
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));

        // Auto-respond if user message
        if (sender === "user") {
          setTimeout(() => {
            const response = generateAIResponse(content, get().preferences);
            get().addMessage(response.message, "ai");
            
            // Add preference if suggested
            if (response.newPreference) {
              get().addPreference(response.newPreference.label, response.newPreference.category);
            }
            
            get().setTyping(false);
          }, 1000 + Math.random() * 1000);
          
          set({ isTyping: true });
        }
      },

      setTyping: (typing) => set({ isTyping: typing }),

      addPreference: (label, category) => {
        const newPreference: Preference = {
          id: Date.now().toString(),
          label,
          category,
          active: true,
          addedAt: new Date(),
        };
        
        set((state) => ({
          preferences: [...state.preferences, newPreference],
          preferencesLearned: state.preferencesLearned + 1,
        }));
        
        get().updateMetrics();
      },

      removePreference: (id) => {
        set((state) => ({
          preferences: state.preferences.filter((p) => p.id !== id),
          preferencesLearned: Math.max(0, state.preferencesLearned - 1),
        }));
        
        get().updateMetrics();
      },

      togglePreference: (id) => {
        set((state) => ({
          preferences: state.preferences.map((p) =>
            p.id === id ? { ...p, active: !p.active } : p
          ),
        }));
      },

      clearChat: () => {
        set({
          messages: [
            {
              id: "welcome",
              content: "Hi! I'm your AI Maid assistant. I help remember your cleaning preferences and create personalized briefs for our crew. How can I help you today?",
              sender: "ai",
              timestamp: new Date(),
            },
          ],
          isTyping: false,
        });
      },

      resetDemo: () => {
        set({
          messages: [
            {
              id: "welcome",
              content: "Hi! I'm your AI Maid assistant. I help remember your cleaning preferences and create personalized briefs for our crew. How can I help you today?",
              sender: "ai",
              timestamp: new Date(),
            },
          ],
          isTyping: false,
          preferences: defaultPreferences,
          satisfactionScore: 4.8,
          preferencesLearned: defaultPreferences.length,
          reworkRate: 2.1,
        });
      },

      updateMetrics: () => {
        const { preferences } = get();
        const activePrefs = preferences.filter((p) => p.active).length;
        
        set({
          satisfactionScore: Math.min(5.0, 4.2 + (activePrefs * 0.15)),
          reworkRate: Math.max(0.5, 5.0 - (activePrefs * 0.3)),
        });
      },
    }),
    {
      name: "maidly-demo-store",
      partialize: (state) => ({
        preferences: state.preferences,
        satisfactionScore: state.satisfactionScore,
        preferencesLearned: state.preferencesLearned,
        reworkRate: state.reworkRate,
      }),
    }
  )
);

// Simple AI response generator for demo
function generateAIResponse(
  userMessage: string,
  preferences: Preference[]
): { message: string; newPreference?: { label: string; category: Preference["category"] } } {
  const message = userMessage.toLowerCase();
  
  // Pattern matching for common requests
  if (message.includes("allergic") || message.includes("allergy")) {
    return {
      message: "I understand you have allergies. I'll make sure to note that in your preferences. What specific products or ingredients should we avoid?",
      newPreference: {
        label: "Has allergies - check products",
        category: "products",
      },
    };
  }
  
  if (message.includes("pet") || message.includes("dog") || message.includes("cat")) {
    return {
      message: "Got it! I'll add a note about your pet. This helps our crew know what to expect and how to interact safely with your furry friend.",
      newPreference: {
        label: `Pet in home - ${message.includes("dog") ? "dog" : message.includes("cat") ? "cat" : "pet"}`,
        category: "pets",
      },
    };
  }
  
  if (message.includes("key") || message.includes("lock") || message.includes("door")) {
    return {
      message: "I'll note your access preferences. Clear instructions about keys and entry help our crew provide seamless service.",
      newPreference: {
        label: "Special access instructions",
        category: "access",
      },
    };
  }
  
  if (message.includes("fragrance") || message.includes("scent") || message.includes("smell")) {
    return {
      message: "Noted! I'll make sure we use unscented or lightly scented products based on your preference.",
      newPreference: {
        label: "Fragrance sensitivity",
        category: "products",
      },
    };
  }
  
  if (message.includes("delicate") || message.includes("careful") || message.includes("gentle")) {
    return {
      message: "I understand you have items that need special care. I'll add this to your cleaning profile so our crew knows to be extra gentle.",
      newPreference: {
        label: "Handle delicate items with care",
        category: "special",
      },
    };
  }
  
  // Generic responses
  const responses = [
    "Thanks for that information! I've updated your preferences. Is there anything else you'd like me to remember for your next cleaning?",
    "Perfect! I'll make sure our crew knows about this preference. Your personalized cleaning profile is getting more detailed with each visit.",
    "Got it! This preference will be included in the brief I create for your cleaning crew. What else can I help you with?",
    "Excellent! I've noted that preference. The more I know about your home and preferences, the better service we can provide.",
    "Thank you for sharing that! I'll include this in your cleaning profile. Our crew will see this information before they arrive.",
  ];
  
  return {
    message: responses[Math.floor(Math.random() * responses.length)],
  };
}
