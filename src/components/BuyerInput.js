"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

/**
 * BuyerInput receives:
 *  - buyerData: object containing the buyer's default details
 *  - paymentTerm: current payment term ("monthly" or "quarterly")
 *  - setPaymentTerm: setter to update the paymentTerm
 *  - totalAmount: numeric total of all invoice items
 *  - onPaymentSubmit: callback function to be called when payment is submitted
 *  - isSubmitted: boolean indicating whether the payment has been submitted
 */
export default function BuyerInput({
  buyerData,
  paymentTerm,
  setPaymentTerm,
  totalAmount,
  onPaymentSubmit,
  isSubmitted
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [submitted, setSubmitted] = useState(isSubmitted || false);

  const handlePayment = () => {
    setIsLoading(true);
    localStorage.clear();
    setTimeout(() => {
      setIsLoading(false);
      setFadeOut(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setSubmitted(true);
        onPaymentSubmit?.();
      }, 500);
    }, 2000);
  };

  return (
    <ScrollArea className="w-full px-10 py-4">
      {submitted ? (
        <Card className="border-none p-0 shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="flex flex-col items-center space-y-4 text-2xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Payment Confirmed
              </motion.span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your payment has been processed successfully.
            </motion.p>

            {/* Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                variant="default"
              >
                Open Pay Portal
              </Button>
            </motion.div>

            {/* Powered by Capchase */}
            <motion.div 
              className="mt-8 flex items-center justify-center space-x-2 text-sm text-gray-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: 0.7,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
            >
              <span>Powered by</span>
              <motion.img
                src="/capchase.svg"
                alt="Capchase"
                width={85}
                height={16}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.8,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
              />
            </motion.div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`${
            fadeOut
              ? "opacity-0 transition-opacity duration-500"
              : "opacity-100"
          }`}
        >
          {/* Step 1: Add company details */}
          <Card className="border-none p-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">1. Add company details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Company Name"
                  defaultValue={buyerData.buyerCompanyName}
                />
              </div>
              <div>
                <Label htmlFor="companyAddress">Address</Label>
                <Input
                  id="companyAddress"
                  placeholder="Address"
                  defaultValue={buyerData.buyerCompanyAddress}
                />
              </div>
              <div>
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  placeholder="Contact Name"
                  defaultValue={buyerData.buyerCompanyContactName}
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="Contact Email"
                  defaultValue={buyerData.buyerCompanyContactEmail}
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Choose how to pay */}
          <Card className="border-none p-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">2. Choose how to pay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentTerm} onValueChange={setPaymentTerm}>
                <div className="grid grid-cols-1 gap-4">
                  <Card
                    className={`p-4 cursor-pointer shadow-none ${
                      paymentTerm === "monthly" ? "border-primary" : ""
                    }`}
                    onClick={() => setPaymentTerm("monthly")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly</Label>
                    </div>
                  </Card>
                  <Card
                    className={`p-4 cursor-pointer shadow-none ${
                      paymentTerm === "quarterly" ? "border-primary" : ""
                    }`}
                    onClick={() => setPaymentTerm("quarterly")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quarterly" id="quarterly" />
                      <Label htmlFor="quarterly">Quarterly</Label>
                    </div>
                  </Card>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Step 3: Sign */}
          <Card className="border-none p-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">3. Sign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Name" defaultValue={buyerData?.name} />
              <Input
                placeholder="Signatory Email"
                defaultValue={buyerData?.email}
              />
              <Input
                placeholder="Signatory Position"
                defaultValue={buyerData?.position}
              />
              <Input
                placeholder="Your Signature"
                defaultValue={buyerData?.signature}
              />
              <div className="space-y-2">
                <div className="flex items-top space-x-2">
                  <Checkbox id="agreement-checkbox" />
                  <Label htmlFor="agreement-checkbox" className="text-sm">
                    I have reviewed and agree to the Capchase Pay Agreement
                  </Label>
                </div>
                <div className="flex items-top space-x-2">
                  <Checkbox id="business-use-checkbox" />
                  <Label htmlFor="business-use-checkbox" className="text-sm">
                    By checking this box, I acknowledge that this financing is
                    being obtained solely for commercial use. I affirm that I am
                    utilizing the funds solely for business-related activities.
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Pay */}
          <Card className="border-none p-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">4. Pay</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="direct-debit">
                <TabsList>
                  <TabsTrigger value="direct-debit">Direct Debit</TabsTrigger>
                  <TabsTrigger value="credit-card">Credit Card</TabsTrigger>
                </TabsList>

                <TabsContent value="direct-debit" className="space-y-4 mt-4">
                  <Input placeholder="Account Holder Name" />
                  <Input placeholder="IBAN" />
                  <Input placeholder="Swift" />
                  <Input placeholder="Account Holder Address" />
                </TabsContent>

                <TabsContent value="credit-card" className="space-y-4 mt-4">
                  <Input placeholder="Card Number" />
                  <div className="flex space-x-4">
                    <Input placeholder="MM/YY" className="w-1/2" />
                    <Input placeholder="CVC" className="w-1/2" />
                  </div>
                  <Input placeholder="Country" defaultValue="United States" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="px-6">
            <Button
              onClick={handlePayment}
              className="w-full"
              variant="default"
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
              ) : (
                "Confirm and Pay"
              )}
            </Button>
            
            {/* Powered by Capchase */}
            <div className="mt-8 mb-8 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>Powered by</span>
              <img
                src="/capchase.svg"
                alt="Capchase"
                width={85}
                height={16}
              />
            </div>
          </div>
        </div>
      )}
    </ScrollArea>
  );
}
