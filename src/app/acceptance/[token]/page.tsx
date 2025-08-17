"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  FileText, 
  User, 
  Mail, 
  Calendar,
  Sparkles,
  Award,
  Target,
  Users
} from "lucide-react";
import { motion } from "framer-motion";

interface Application {
  id: number;
  name: string;
  email: string;
  role_interest: string;
  created_at: string;
}

interface AcceptanceData {
  application: Application;
  documents: any[];
  hasSignedDocuments: boolean;
}

interface DocumentFormData {
  fullName: string;
  digitalSignature: string;
  startDate: string;
  emergencyContact: string;
  emergencyPhone: string;
  bankingInfo: string;
  taxId: string;
  agreementAccepted: boolean;
  equityAgreementAccepted: boolean;
  confidentialityAccepted: boolean;
}

export default function AcceptancePage() {
  const params = useParams();
  const token = params.token as string;
  
  const [data, setData] = useState<AcceptanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [formData, setFormData] = useState<DocumentFormData>({
    fullName: "",
    digitalSignature: "",
    startDate: "",
    emergencyContact: "",
    emergencyPhone: "",
    bankingInfo: "",
    taxId: "",
    agreementAccepted: false,
    equityAgreementAccepted: false,
    confidentialityAccepted: false,
  });

  useEffect(() => {
    fetchAcceptanceData();
  }, [token]);

  const fetchAcceptanceData = async () => {
    try {
      const response = await fetch(`/api/acceptance/${token}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setIsCompleted(result.data.hasSignedDocuments);
        // Pre-fill form with application data
        setFormData(prev => ({
          ...prev,
          fullName: result.data.application.name,
        }));
      } else {
        setError(result.message || "Failed to load acceptance page");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreementAccepted || !formData.equityAgreementAccepted || !formData.confidentialityAccepted) {
      setError("Please accept all agreements to continue.");
      return;
    }

    if (!formData.digitalSignature) {
      setError("Digital signature is required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`/api/acceptance/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: 'founding_partner_agreement',
          documentData: {
            ...formData,
            signedAt: new Date().toISOString(),
            ipAddress: 'client', // In a real app, you'd get this from the server
            userAgent: navigator.userAgent,
          },
          signed: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsCompleted(true);
      } else {
        setError(result.message || "Failed to submit documents");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      COO: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      CMO: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      "CTO/AI": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      CFO: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your acceptance page...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">Welcome to the Team! 🎉</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Congratulations, {data?.application.name}! You've successfully completed your founding partner onboarding.
            </p>
            
            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Check Your Email</h4>
                    <p className="text-sm text-muted-foreground">You'll receive access credentials and next steps within 24 hours.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Join Our Slack</h4>
                    <p className="text-sm text-muted-foreground">Connect with the founding team and start collaborating.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">First Milestone Meeting</h4>
                    <p className="text-sm text-muted-foreground">Schedule your first milestone planning session with the founder.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">🎉 Congratulations!</h1>
            <p className="text-xl text-muted-foreground">
              You've been accepted to the Maidly.ai Founding Partner Program
            </p>
          </div>

          {/* Application Info */}
          {data && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  Your Application
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{data.application.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{data.application.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(data.application.role_interest)}>
                      {data.application.role_interest} Partner
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Founding Partner Agreement Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                Founding Partner Agreement
              </CardTitle>
              <p className="text-muted-foreground">
                Please complete the following information to finalize your partnership.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Legal Name</label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Start Date</label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emergency Contact</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Name</label>
                      <Input
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Phone</label>
                      <Input
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Financial Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Financial Information</h3>
                  <p className="text-sm text-muted-foreground">
                    This information is required for equity distribution and tax purposes.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Banking Information</label>
                      <Textarea
                        placeholder="Bank name, routing number, account number (last 4 digits only)"
                        value={formData.bankingInfo}
                        onChange={(e) => setFormData(prev => ({ ...prev, bankingInfo: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Tax ID / SSN</label>
                      <Input
                        placeholder="XXX-XX-XXXX"
                        value={formData.taxId}
                        onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Digital Signature */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Digital Signature</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Type your full name to digitally sign this agreement
                    </label>
                    <Input
                      placeholder="Your full legal name"
                      value={formData.digitalSignature}
                      onChange={(e) => setFormData(prev => ({ ...prev, digitalSignature: e.target.value }))}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      By typing your name, you agree that this constitutes a legal signature.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Agreements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Agreements</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreementAccepted}
                        onChange={(e) => setFormData(prev => ({ ...prev, agreementAccepted: e.target.checked }))}
                        className="mt-1"
                        required
                      />
                      <div className="text-sm">
                        <span className="font-medium">Founding Partner Agreement:</span> I agree to the terms and conditions of the Maidly.ai Founding Partner Program, including milestone-based compensation and equity distribution.
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.equityAgreementAccepted}
                        onChange={(e) => setFormData(prev => ({ ...prev, equityAgreementAccepted: e.target.checked }))}
                        className="mt-1"
                        required
                      />
                      <div className="text-sm">
                        <span className="font-medium">Equity Agreement:</span> I understand that equity awards are tied to completed milestones and company performance, subject to vesting schedules and board approval.
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.confidentialityAccepted}
                        onChange={(e) => setFormData(prev => ({ ...prev, confidentialityAccepted: e.target.checked }))}
                        className="mt-1"
                        required
                      />
                      <div className="text-sm">
                        <span className="font-medium">Confidentiality Agreement:</span> I agree to maintain confidentiality of all proprietary information, trade secrets, and business strategies of Maidly.ai.
                      </div>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-800">{error}</span>
                    </div>
                  </div>
                )}

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting Documents...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete Partnership Agreement
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
