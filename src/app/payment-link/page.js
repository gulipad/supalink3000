"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DocumentViewer from "@/components/DocumentViewer";
import BuyerInput from "@/components/BuyerInput";
import { mockData } from "@/lib/mockData";
import { motion } from "framer-motion";
import { computePaymentData } from "@/lib/computePaymentData";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

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
  const [data, setData] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [receivedExternalData, setReceivedExternalData] = useState(false);

  const handleMessage = (event) => {
    // You can specify allowed origins for security
    // if (event.origin !== "https://allowed-origin.com") return;

    try {
      const { id, data } = event.data;
      console.log("Received message:", event.data);
      if (id && data) {
        localStorage.setItem(id, JSON.stringify(data));

        const url = new URL(window.location);
        url.searchParams.set("id", id);
        window.history.pushState({}, "", url);

        setData({
          buyerData: data.buyerData,
          invoiceData: data.invoiceData,
          base64: data.base64,
        });
        setReceivedExternalData(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleMessage);

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (id) {
      // Get data from localStorage using the ID
      const storedData = localStorage.getItem(id);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData({
          buyerData: parsedData.buyerData,
          invoiceData: parsedData.invoiceData,
          base64: parsedData.base64,
        });
        setReceivedExternalData(true);
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      if (!receivedExternalData) {
        console.log(
          "No external data received after 10 seconds, using mockData"
        );
        setData(mockData);
      }
      setIsLoading(false);
    }, 10000);

    // Clean up event listener and timer
    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timer);
    };
  }, [receivedExternalData]);

  const toggleCardExpansion = () => setIsCardExpanded(!isCardExpanded);
  const openDetailsDialog = () => setIsDialogOpen(true);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-gray-500" />
      </div>
    );
  }

  const { summary, details } = computePaymentData(
    data.invoiceData,
    paymentTerm
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 bg-white z-10 border-b px-14">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-auto flex-shrink-0">
              <img src="/logo.svg" alt="Logo" className="h-full w-auto" />
            </div>
          </div>
          <div>
            <Button variant="ghost">Contact support</Button>
          </div>
        </div>
      </nav>

      {/* Main Content with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={35} minSize={30}>
            <div className="h-full overflow-y-auto p-4">
              <BuyerInput
                buyerData={data.buyerData}
                paymentTerm={paymentTerm}
                setPaymentTerm={setPaymentTerm}
                totalAmount={convert(
                  data.invoiceData.reduce(
                    (sum, invoice) => sum + invoice.serviceAmount,
                    0
                  )
                )}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={50} minSize={40}>
            <div className="h-full relative">
              <div className="h-full w-full">
                <DocumentViewer base64={data.base64} />
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
                <Card className="bg-gray-800/80 backdrop-blur-lg border border-gray-700 shadow-2xl max-w-3xl mx-auto">
                  <div
                    className="px-6 py-4 cursor-pointer"
                    onClick={toggleCardExpansion}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-semibold text-white">
                        Payment summary
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetailsDialog();
                          }}
                          className="text-white"
                        >
                          View full details
                        </Button>
                        <motion.div
                          animate={{ rotate: isCardExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <ChevronDown className="h-5 w-5 text-gray-300" />
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
                        <p className="text-sm font-medium text-gray-400">
                          Subscription Payments
                        </p>
                        <div className="flex justify-between items-center text-sm font-medium mt-1 text-white">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span>
                              {formatDateUTC(
                                summary.subscription.overallStartDate
                              )}{" "}
                              to{" "}
                              {formatDateUTC(
                                summary.subscription.overallEndDate
                              )}
                            </span>
                            <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs w-fit">
                              {summary.subscription.totalInstallments}{" "}
                              installments
                            </span>
                          </div>
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
                          <p className="text-sm font-medium text-gray-400">
                            One‑off Payments
                          </p>
                          <ul className="space-y-1 mt-1">
                            {summary.oneOff.map((fee) => (
                              <li
                                key={fee.id}
                                className="flex justify-between items-center text-sm font-medium text-white"
                              >
                                <span className="flex items-center gap-2">
                                  {fee.serviceTitle}
                                  <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">
                                    Due {formatDateUTC(fee.dueDate)}
                                  </span>
                                </span>
                                <span className="font-bold text-xl">
                                  $
                                  {convert(fee.amount).toLocaleString(
                                    undefined,
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
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
          </ResizablePanel>
        </ResizablePanelGroup>
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
