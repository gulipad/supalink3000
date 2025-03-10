"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DocumentViewer from "@/components/DocumentViewer";
import BuyerInput from "@/components/BuyerInput";
import { mockData } from "@/lib/mockData";
import { motion } from "framer-motion";
import { computePaymentData } from "@/lib/computePaymentData";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Helper to format dates consistently in UTC
function formatDateUTC(date) {
  if (!date) return "N/A";
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Helper to convert cents to dollars
function convert(amountInCents) {
  return amountInCents / 100;
}

export default function PaymentLinkPage() {
  const [paymentTerm, setPaymentTerm] = useState("monthly");
  const [isCardExpanded, setIsCardExpanded] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Compute the payment data based on the invoice data and payment term
  const { summary, details } = computePaymentData(
    mockData.invoiceData,
    paymentTerm
  );

  const toggleCardExpansion = () => setIsCardExpanded(!isCardExpanded);
  const openDetailsDialog = () => setIsDialogOpen(true);

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 bg-white z-10 border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl">Your Company</span>
          </div>
          <div>
            <Button variant="ghost">Contact support</Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <BuyerInput
          buyerData={mockData.buyerData}
          paymentTerm={paymentTerm}
          setPaymentTerm={setPaymentTerm}
          totalAmount={convert(
            mockData.invoiceData.reduce(
              (sum, invoice) => sum + invoice.serviceAmount,
              0
            )
          )}
        />

        {/* PDF Preview and Floating Summary */}
        <div className="hidden md:block md:w-1/2 relative">
          <div className="h-full w-full">
            <DocumentViewer base64={mockData.base64} />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 15,
              mass: 0.3,
            }}
            className="absolute bottom-4 mx-4 w-[calc(100%-2rem)]"
          >
            {/* Summary Card */}
            <Card className="bg-white border shadow-2xl">
              <div
                className="px-6 py-4 cursor-pointer"
                onClick={toggleCardExpansion}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Payment summary</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailsDialog();
                      }}
                    >
                      View full details
                    </Button>
                    <motion.div
                      animate={{ rotate: isCardExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    </motion.div>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{
                  height: isCardExpanded ? "auto" : 0,
                  opacity: isCardExpanded ? 1 : 0,
                }}
                initial={false}
                transition={{
                  height: { duration: 0.3, ease: "easeInOut" },
                  opacity: { duration: 0.2, ease: "easeInOut" },
                }}
                style={{ overflow: "hidden" }}
              >
                <CardContent className="space-y-4 pt-0">
                  {/* Subscription Payments Summary */}
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Subscription Payments
                    </p>
                    <div className="flex justify-between items-center text-sm font-medium mt-1">
                      <span className="flex items-center gap-2">
                        From{" "}
                        {formatDateUTC(summary.subscription.overallStartDate)}{" "}
                        to {formatDateUTC(summary.subscription.overallEndDate)}
                        <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                          {summary.subscription.totalInstallments} installments
                        </span>
                      </span>
                      {summary.subscription.minInstallmentAmount !==
                      summary.subscription.maxInstallmentAmount ? (
                        <span className="font-bold text-xl">
                          $
                          {convert(
                            summary.subscription.minInstallmentAmount
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          <span className="text-s font-normal"> to </span>$
                          {convert(
                            summary.subscription.maxInstallmentAmount
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          /{paymentTerm === "monthly" ? "month" : "quarter"}
                        </span>
                      ) : (
                        <span className="font-bold text-xl">
                          $
                          {convert(
                            summary.subscription.minInstallmentAmount
                          ).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          /{paymentTerm === "monthly" ? "month" : "quarter"}
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* One‑off Payments Summary */}
                  {summary.oneOff.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        One‑off Payments
                      </p>
                      <ul className="space-y-1 mt-1">
                        {summary.oneOff.map((fee) => (
                          <li
                            key={fee.id}
                            className="flex justify-between items-center text-sm font-medium"
                          >
                            <span className="flex items-center gap-2">
                              {fee.serviceTitle}
                              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                Due {formatDateUTC(fee.dueDate)}
                              </span>
                            </span>
                            <span className="font-bold text-xl">
                              $
                              {convert(fee.amount).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-4">
            {/* Subscription Invoices */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Subscription Invoices
              </h3>
              <ul className="space-y-2">
                {details.subscriptionDetails.map((item) => (
                  <li key={item.id} className="border p-2 rounded">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{item.serviceTitle}</span>
                      <span>
                        $
                        {convert(item.totalAmount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateUTC(item.startDate)} -{" "}
                      {formatDateUTC(item.endDate)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* One‑off Fee Details */}
            {details.oneOffDetails.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">One‑off Payments</h3>
                <ul className="space-y-2">
                  {details.oneOffDetails.map((fee) => (
                    <li
                      key={fee.id}
                      className="flex justify-between text-sm font-medium border p-2 rounded"
                    >
                      <span>{fee.serviceTitle}</span>
                      <span>
                        $
                        {convert(fee.amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Payment Schedule */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Payment Schedule</h3>
              <ul className="space-y-2">
                {summary.subscription.schedule.map((payment, index) => (
                  <li
                    key={index}
                    className="flex justify-between text-sm font-medium border p-2 rounded"
                  >
                    <span>{formatDateUTC(payment.date)}</span>
                    <span>
                      $
                      {convert(payment.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
