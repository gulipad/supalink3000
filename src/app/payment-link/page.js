"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DocumentViewer from "@/components/DocumentViewer";
import BuyerInput from "@/components/BuyerInput";
import { mockData } from "@/lib/mockData";

export default function PaymentLinkPage() {
  // Track the chosen payment term
  const [paymentTerm, setPaymentTerm] = useState("monthly");

  // Calculate the total from invoiceData
  const totalAmount = mockData.invoiceData.reduce(
    (sum, invoice) => sum + invoice.serviceAmount,
    0
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 bg-white z-10 border-b">
        <div className="px-16 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2 w-full">
            {/* Replace with company logo if desired */}
            <span className="font-bold text-xl">Domo</span>
          </div>
          <div>
            <Button variant="ghost">Contact support</Button>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left side: BuyerInput component */}
        <BuyerInput
          buyerData={mockData.buyerData}
          paymentTerm={paymentTerm}
          setPaymentTerm={setPaymentTerm}
          totalAmount={totalAmount}
        />

        {/* Right side: PDF preview + floating summary card */}
        <div className="hidden md:block md:w-1/2 relative">
          {/* PDF Preview using DocumentViewer component */}
          <div className="h-full w-full">
            <DocumentViewer base64={mockData.base64} />
          </div>

          {/* Floating summary card (stuck to the bottom-right) */}
          <Card className="bg-white border shadow-lg w-full md:w-2/3 lg:w-1/2 xl:w-1/3 absolute bottom-4 right-4">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>How your payment is set up</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Payment Term</span>
                <span className="font-semibold capitalize">{paymentTerm}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold">
                  ${totalAmount.toLocaleString()}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Confirm &amp; Pay</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
