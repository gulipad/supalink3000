"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

/**
 * BuyerInput receives:
 *  - buyerData: object containing the buyer's default details
 *  - paymentTerm: current payment term ("monthly" or "quarterly")
 *  - setPaymentTerm: setter to update the paymentTerm
 *  - totalAmount: numeric total of all invoice items
 */
export default function BuyerInput({
  buyerData,
  paymentTerm,
  setPaymentTerm,
  totalAmount,
}) {
  return (
    <ScrollArea className="w-full md:w-1/2 border-r p-4">
      <div className="space-y-8">
        {/* Step 1: Add company details */}
        <Card>
          <CardHeader>
            <CardTitle>1. Add company details</CardTitle>
            <CardDescription>
              Please fill in your company details
            </CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle>2. Choose how to pay</CardTitle>
            <CardDescription>Select monthly or quarterly</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              onValueChange={(val) => setPaymentTerm(val)}
              defaultValue={paymentTerm}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarterly" id="quarterly" />
                <Label htmlFor="quarterly">Quarterly</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Step 3: Sign */}
        <Card>
          <CardHeader>
            <CardTitle>3. Sign</CardTitle>
            <CardDescription>Provide your signature below</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Signature</Label>
              <Input placeholder="Type your name as signature" />
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Pay */}
        <Card>
          <CardHeader>
            <CardTitle>4. Pay</CardTitle>
            <CardDescription>Enter your payment method details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <div className="flex items-center space-x-2">
                <Input id="paymentMethod" placeholder="Card number" />
                {/* Additional fields if needed (e.g., Expiry, CVV, etc.) */}
              </div>
            </div>
            <Button>Pay ${totalAmount.toLocaleString()}</Button>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
