"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [isLoading, setIsLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handlePayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Begin fade out animation
      setFadeOut(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      // After animation duration, hide form content completely
      setTimeout(() => {
        setSubmitted(true);
      }, 500); // duration matches the CSS transition duration
    }, 2000);
  };

  return (
    <ScrollArea className="w-full md:w-1/2 border-r px-10 py-4">
      {submitted ? (
        <Card className="border-none p-0 shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="flex flex-col items-center space-y-4 text-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Payment Confirmed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Your payment has been processed successfully.</p>
          </CardContent>
        </Card>
      ) : (
        <div
          className={`${fadeOut ? "opacity-0 transition-opacity duration-500" : "opacity-100"}`}
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
              <Input placeholder="Signatory Email" defaultValue={buyerData?.email} />
              <Input placeholder="Signatory Position" defaultValue={buyerData?.position} />
              <Input placeholder="Your Signature" defaultValue={buyerData?.signature} />
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
                    By checking this box, I acknowledge that this financing is being obtained solely for commercial use. I affirm that I am utilizing the funds solely for business-related activities.
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
            <div className="mt-6 mb-10 flex items-center justify-center space-x-2 text-sm text-gray-500">
              <span>Powered by</span>
              <svg width="85" height="16" viewBox="0 0 85 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.332031 4.03255C0.332031 4.51009 0.586794 4.95135 1.00035 5.19012L5.86659 7.99965V4.80427L11.4012 7.99965V5.57598C11.4012 5.09845 11.1464 4.65718 10.7328 4.41841L5.86659 1.60889V4.80427L0.332031 1.60889V4.03255Z" fill="#0F0F14"/>
                <path d="M11.4012 7.99974L5.86659 11.1951V7.99974L1.00036 10.8093C0.586795 11.048 0.332031 11.4893 0.332031 11.9668V14.3905L5.86659 11.1951V14.3905L10.7328 11.581C11.1464 11.3422 11.4012 10.9009 11.4012 10.4234V7.99974Z" fill="#0F0F14"/>
                <path d="M18.9859 11.7295C19.6282 12.0939 20.3573 12.2674 21.1559 12.2674C22.1627 12.2674 23.0133 11.9898 23.7251 11.4345C24.4368 10.8793 24.8882 10.1506 25.0791 9.2483H23.2217C23.0307 9.69943 22.7529 10.0291 22.4058 10.272C22.0586 10.5149 21.6419 10.6364 21.1732 10.6364C20.4788 10.6364 19.8886 10.3935 19.4373 9.90764C18.9859 9.42181 18.7603 8.79717 18.7603 8.03373C18.7603 7.27028 18.9859 6.64564 19.4373 6.15982C19.8886 5.67399 20.4788 5.43107 21.1732 5.43107C21.6593 5.43107 22.0759 5.55253 22.4231 5.79544C22.7703 6.03836 23.0481 6.38538 23.2217 6.8018H25.0791C24.8882 5.93425 24.4368 5.20551 23.7251 4.63292C23.0133 4.07769 22.1627 3.78272 21.1559 3.78272C20.3573 3.78272 19.6282 3.97358 18.9859 4.33795C18.3436 4.70233 17.8402 5.20551 17.4756 5.8475C17.1111 6.50684 16.9375 7.23558 16.9375 8.03373C16.9375 8.84923 17.1111 9.57797 17.4756 10.22C17.8402 10.8793 18.3436 11.3825 18.9859 11.7295Z" fill="#0F0F14"/>
                <path d="M31.6902 4.30325C31.0652 3.95623 30.3709 3.78272 29.607 3.78272C28.8085 3.78272 28.0968 3.97358 27.4718 4.33795C26.8295 4.71968 26.3261 5.22286 25.9615 5.86485C25.597 6.52419 25.4234 7.23558 25.4234 8.03373C25.4234 8.86658 25.597 9.59532 25.9442 10.2373C26.2914 10.8793 26.7601 11.3825 27.3503 11.7295C27.9405 12.0939 28.6002 12.2674 29.3293 12.2674C29.8674 12.2674 30.3709 12.1459 30.8569 11.903C31.3256 11.6601 31.7075 11.2957 32.0027 10.8446L32.1415 12.0939H33.756V8.03373C33.756 7.16618 33.565 6.42008 33.2005 5.77809C32.8186 5.1361 32.3151 4.65027 31.6902 4.30325ZM30.7528 10.3414C30.3882 10.5496 30.0063 10.6364 29.607 10.6364C28.9127 10.6364 28.3398 10.4108 27.9058 9.92499C27.4544 9.43916 27.2461 8.81453 27.2461 8.03373C27.2461 7.53055 27.3503 7.07942 27.5586 6.68035C27.7669 6.28127 28.0447 5.96895 28.4092 5.74339C28.7564 5.53518 29.1557 5.41372 29.607 5.41372C30.0237 5.41372 30.4056 5.51783 30.7701 5.72604C31.1173 5.93425 31.4124 6.24657 31.6207 6.64565C31.8291 7.04472 31.9506 7.5132 31.9506 8.03373C31.9506 8.57161 31.8291 9.04009 31.6207 9.43916C31.3951 9.83824 31.1 10.1332 30.7528 10.3414Z" fill="#0F0F14"/>
                <path d="M40.8769 4.33795C40.2519 3.97358 39.5402 3.78272 38.7764 3.78272C38.0125 3.78272 37.3355 3.95623 36.7106 4.30325C36.0856 4.65027 35.5822 5.15345 35.2003 5.79544C34.8184 6.45478 34.6448 7.20088 34.6448 8.06843V15.1216H36.4849V11.0181C36.7974 11.4172 37.1793 11.7295 37.6653 11.9377C38.1341 12.1633 38.6201 12.2674 39.1409 12.2674C39.8353 12.2674 40.4602 12.0939 41.0505 11.7295C41.6233 11.3825 42.0747 10.8793 42.4219 10.22C42.7517 9.57797 42.9253 8.84923 42.9253 8.01638C42.9253 7.21823 42.7343 6.50684 42.3698 5.86485C42.0052 5.22286 41.5018 4.71968 40.8769 4.33795ZM40.4602 9.90764C40.0262 10.3935 39.4881 10.6364 38.8284 10.6364C38.4118 10.6364 38.0299 10.5323 37.6653 10.3241C37.3008 10.1159 37.0057 9.82089 36.7974 9.42181C36.5717 9.04009 36.4675 8.57161 36.4675 8.01638C36.4675 7.49585 36.5717 7.02737 36.78 6.62829C36.9883 6.24657 37.2834 5.93425 37.6306 5.72604C37.9778 5.51783 38.3597 5.41372 38.7764 5.41372C39.436 5.41372 39.9742 5.65663 40.4255 6.14246C40.8769 6.62829 41.1025 7.25293 41.1025 8.01638C41.1025 8.79717 40.8769 9.42181 40.4602 9.90764Z" fill="#0F0F14"/>
                <path d="M45.6818 11.7295C46.3241 12.0939 47.0532 12.2674 47.8517 12.2674C48.8586 12.2674 49.7092 11.9898 50.4209 11.4345C51.1327 10.8793 51.584 10.1506 51.775 9.2483H49.9175C49.7266 9.69943 49.4488 10.0291 49.1016 10.272C48.7544 10.5149 48.3378 10.6364 47.8691 10.6364C47.1747 10.6364 46.5845 10.3935 46.1331 9.90764C45.6818 9.42181 45.4561 8.79717 45.4561 8.03373C45.4561 7.27028 45.6818 6.64564 46.1331 6.15982C46.5845 5.67399 47.1747 5.43107 47.8691 5.43107C48.3552 5.43107 48.7718 5.55253 49.119 5.79544C49.4662 6.03836 49.7439 6.38538 49.9175 6.8018H51.775C51.584 5.93425 51.1327 5.20551 50.4209 4.63292C49.7092 4.07769 48.8586 3.78272 47.8517 3.78272C47.0532 3.78272 46.3241 3.97358 45.6818 4.33795C45.0395 4.70233 44.5361 5.20551 44.1715 5.8475C43.807 6.50684 43.6334 7.23558 43.6334 8.03373C43.6334 8.84923 43.807 9.57797 44.1715 10.22C44.5361 10.8793 45.0395 11.3825 45.6818 11.7295Z" fill="#0F0F14"/>
                <path d="M58.3971 4.1818C57.9284 3.92153 57.4076 3.78272 56.8521 3.78272C56.3313 3.78272 55.8626 3.90418 55.4112 4.12974C54.9599 4.35531 54.5953 4.68498 54.3176 5.1361V0.87793H52.4948V12.0939H54.3176V7.73876C54.3176 7.28763 54.4044 6.88856 54.5953 6.54154C54.7863 6.19452 55.0293 5.9169 55.3418 5.72604C55.6543 5.53518 55.9668 5.43107 56.3139 5.43107C56.8 5.43107 57.2166 5.62193 57.5638 5.96895C57.911 6.33333 58.0846 6.87121 58.0846 7.59995V12.0939H59.9247V7.27028C59.9247 6.52419 59.7859 5.8822 59.5081 5.36167C59.2303 4.84114 58.8484 4.44206 58.3971 4.1818Z" fill="#0F0F14"/>
                <path d="M67.023 4.30325C66.398 3.95623 65.7036 3.78272 64.9398 3.78272C64.1413 3.78272 63.4295 3.97358 62.8046 4.33795C62.1623 4.71968 61.6589 5.22286 61.2943 5.86485C60.9298 6.52419 60.7562 7.23558 60.7562 8.03373C60.7562 8.86658 60.9298 9.59532 61.2769 10.2373C61.6241 10.8793 62.0928 11.3825 62.6831 11.7295C63.2733 12.0939 63.933 12.2674 64.6621 12.2674C65.2002 12.2674 65.7036 12.1459 66.1897 11.903C66.6584 11.6601 67.0403 11.2957 67.3354 10.8446L67.4743 12.0939H69.0887V8.03373C69.0887 7.16618 68.8978 6.42008 68.5332 5.77809C68.1513 5.1361 67.6479 4.65027 67.023 4.30325ZM66.0855 10.3414C65.721 10.5496 65.3391 10.6364 64.9398 10.6364C64.2454 10.6364 63.6726 10.4108 63.2386 9.92499C62.7872 9.43916 62.5789 8.81453 62.5789 8.03373C62.5789 7.53055 62.6831 7.07942 62.8914 6.68035C63.0997 6.28127 63.3774 5.96895 63.742 5.74339C64.0892 5.53518 64.4885 5.41372 64.9398 5.41372C65.3564 5.41372 65.7384 5.51783 66.1029 5.72604C66.4501 5.93425 66.7452 6.24657 66.9535 6.64565C67.1618 7.04472 67.2833 7.5132 67.2833 8.03373C67.2833 8.57161 67.1618 9.04009 66.9535 9.43916C66.7278 9.83824 66.4327 10.1332 66.0855 10.3414Z" fill="#0F0F14"/>
                <path d="M70.6372 11.5386C71.2274 12.0245 71.9913 12.2674 72.9113 12.2674C73.7446 12.2674 74.4563 12.0592 75.0465 11.6254C75.6194 11.1916 75.9145 10.619 75.9145 9.92499C75.9145 9.36976 75.7756 8.93598 75.5153 8.58896C75.2549 8.24194 74.9424 7.98167 74.5778 7.80816C74.2133 7.63465 73.7619 7.4785 73.2064 7.30498C72.6509 7.16618 72.2517 7.01002 71.9913 6.85386C71.7309 6.71505 71.6094 6.48948 71.6094 6.19452C71.6094 5.93425 71.7135 5.70869 71.9218 5.53518C72.1301 5.36167 72.3905 5.27491 72.7204 5.27491C73.0676 5.27491 73.3453 5.37902 73.5536 5.56988C73.7619 5.76074 73.9008 6.02101 73.9703 6.35068H75.7583C75.6715 5.55253 75.359 4.91054 74.8209 4.45941C74.2654 4.00829 73.571 3.78272 72.7204 3.78272C72.1301 3.78272 71.6094 3.90418 71.1754 4.12974C70.724 4.35531 70.3942 4.65027 70.1685 5.01465C69.9428 5.39637 69.8387 5.77809 69.8387 6.19452C69.8387 6.74975 69.9602 7.20088 70.2206 7.53055C70.4636 7.87757 70.7761 8.12048 71.1406 8.29399C71.4878 8.4675 71.9566 8.64101 72.5121 8.79717C73.0676 8.97068 73.4668 9.12684 73.7272 9.26565C73.9876 9.42181 74.1265 9.64738 74.1265 9.92499C74.1265 10.1679 74.0223 10.3761 73.814 10.5323C73.6057 10.7058 73.2932 10.7752 72.9113 10.7752C72.5294 10.7752 72.1996 10.6711 71.9218 10.4629C71.6441 10.2547 71.4878 9.97705 71.4531 9.59532H69.6651C69.6998 10.3935 70.0296 11.0528 70.6372 11.5386Z" fill="#0F0F14"/>
                <path d="M84.3373 8.69307C84.3373 8.51956 84.3547 8.31134 84.3547 8.03373C84.3547 7.23558 84.1811 6.52419 83.8339 5.86485C83.4867 5.22286 83.0007 4.71968 82.3931 4.33795C81.7855 3.97358 81.1258 3.78272 80.3967 3.78272C79.5982 3.78272 78.8864 3.97358 78.2615 4.33795C77.6366 4.70233 77.1331 5.20551 76.7859 5.8475C76.4388 6.48949 76.2652 7.21823 76.2652 8.03373C76.2652 8.86658 76.4388 9.59532 76.7859 10.2373C77.1331 10.8793 77.6366 11.3825 78.2615 11.7295C78.8864 12.0939 79.6155 12.2674 80.4141 12.2674C81.2821 12.2674 82.0632 12.0418 82.7576 11.5733C83.4346 11.1049 83.9034 10.4629 84.1464 9.64738H82.3584C82.0112 10.3414 81.3515 10.6711 80.3967 10.6711C79.8065 10.6711 79.3031 10.4976 78.8864 10.1506C78.4698 9.80354 78.1921 9.31771 78.0879 8.69307H84.3373ZM78.8864 5.89955C79.3031 5.55253 79.8065 5.37902 80.3967 5.37902C80.9522 5.37902 81.4383 5.56988 81.8549 5.9516C82.2542 6.33333 82.4799 6.78445 82.5493 7.30498H78.0879C78.2094 6.71505 78.4698 6.24657 78.8864 5.89955Z" fill="#0F0F14"/>
              </svg>
            </div>
          </div>
        </div>
      )}
    </ScrollArea>
  );
}
