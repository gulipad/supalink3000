"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaEdit, FaCheck, FaTrash } from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bar, BarChart, XAxis, ResponsiveContainer, Cell } from "recharts";
import { ChartTooltip } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-US", options).replace(",", "");
};

// EditableField for text/date inputs
function EditableField({ id, label, defaultValue, onChange, type = "text" }) {
  const [isEditing, setIsEditing] = useState(defaultValue == null);
  const [value, setValue] = useState(defaultValue || "");

  const handleSave = () => {
    if (value.trim() === "") return;
    setIsEditing(false);
    if (onChange) onChange(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div className="flex flex-col">
      <Label htmlFor={id} className="font-bold flex items-center">
        {label}
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className="ml-2 mb-1 text-gray-500 hover:text-gray-700"
        >
          {isEditing ? <FaCheck size={14} /> : <FaEdit size={14} />}
        </button>
      </Label>
      <div className="flex items-center">
        {isEditing ? (
          <Input
            id={id}
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="mt-2 flex-grow"
          />
        ) : (
          <div className="flex-grow">
            <span className="mt-2 text-muted-foreground">{value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// EditableCurrencyField specialized for currency inputs
function EditableCurrencyField({ id, label, defaultValue, onChange }) {
  const initialDollars =
    defaultValue != null ? (defaultValue / 100).toFixed(2) : "";
  const [isEditing, setIsEditing] = useState(defaultValue == null);
  const [rawValue, setRawValue] = useState(initialDollars);

  const formatForDisplay = (val) => {
    const number = parseFloat(val);
    if (isNaN(number)) return "";
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleSave = () => {
    const normalized = rawValue.replace(/,/g, ".");
    const number = parseFloat(normalized);
    if (!isNaN(number)) {
      onChange && onChange(Math.round(number * 100));
      setRawValue(number.toFixed(2));
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <div className="flex flex-col">
      <Label htmlFor={id} className="font-bold flex items-center">
        {label}
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className="ml-2 mb-1 text-gray-500 hover:text-gray-700"
        >
          {isEditing ? <FaCheck size={14} /> : <FaEdit size={14} />}
        </button>
      </Label>
      <div className="flex items-center">
        {isEditing ? (
          <Input
            id={id}
            type="text"
            value={rawValue}
            onChange={(e) => setRawValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-grow"
          />
        ) : (
          <div className="flex-grow">
            <span className="text-muted-foreground">
              ${formatForDisplay(rawValue)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom tooltip component for the payment bar chart using a Card for styling
function PaymentTooltipContent({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const paymentDate = new Date(data.date);
    return (
      <Card className="bg-white shadow-md">
        <CardContent className="p-2">
          <div className="text-sm font-bold">
            {paymentDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="text-xs text-gray-500">Period: {data.period}</div>
          <div className="text-sm">
            Amount: $
            {data.amount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </CardContent>
      </Card>
    );
  }
  return null;
}

// Main component
export default function SubscriptionEditor({ brainResponse }) {
  const {
    buyerCompanyName,
    buyerCompanyAddress,
    buyerCompanyContactName,
    buyerCompanyContactEmail,
    scheduleItems,
  } = brainResponse;

  const [buyerData, setBuyerData] = useState({
    buyerCompanyName,
    buyerCompanyAddress,
    buyerCompanyContactName,
    buyerCompanyContactEmail,
  });

  // Map invoice items to include a unique id if not provided.
  const [invoiceItems, setInvoiceItems] = useState(
    (scheduleItems || []).map((item, index) => ({
      ...item,
      id: item.id || `invoice-${index}`,
    }))
  );

  // State for processed financing periods.
  const [financingPeriods, setFinancingPeriods] = useState([]);
  const [viewFinancing, setViewFinancing] = useState(false);
  const [paymentFrequency, setPaymentFrequency] = useState("monthly");
  const [payments, setPayments] = useState([]);

  // Recompute payments whenever financing periods, payment frequency, or viewFinancing changes.
  useEffect(() => {
    if (viewFinancing) {
      setPayments(calculatePayments());
    }
  }, [financingPeriods, paymentFrequency, viewFinancing]);

  // Validate required fields.
  const isFormValid = () => {
    const {
      buyerCompanyName,
      buyerCompanyAddress,
      buyerCompanyContactName,
      buyerCompanyContactEmail,
    } = buyerData;
    const hasEmptyBuyerFields =
      !buyerCompanyName ||
      !buyerCompanyAddress ||
      !buyerCompanyContactName ||
      !buyerCompanyContactEmail;
    const hasInvalidInvoice = invoiceItems.some((item) => {
      if (!item.serviceTitle || !item.serviceDescription) return true;
      if (!item.isSpecialCharge && (!item.startDate || !item.endDate))
        return true;
      return false;
    });
    return !hasEmptyBuyerFields && !hasInvalidInvoice;
  };

  const getTooltipMessage = () => {
    const messages = [];
    const {
      buyerCompanyName,
      buyerCompanyAddress,
      buyerCompanyContactName,
      buyerCompanyContactEmail,
    } = buyerData;
    if (!buyerCompanyName) messages.push("Company Name");
    if (!buyerCompanyAddress) messages.push("Company Address");
    if (!buyerCompanyContactName) messages.push("Contact Name");
    if (!buyerCompanyContactEmail) messages.push("Contact Email");
    invoiceItems.forEach((item, index) => {
      if (!item.serviceTitle)
        messages.push(`Invoice ${index + 1}: Service Title required`);
      if (!item.serviceDescription)
        messages.push(`Invoice ${index + 1}: Service Description required`);
      if (!item.isSpecialCharge && (!item.startDate || !item.endDate))
        messages.push(`Invoice ${index + 1}: Dates required`);
    });
    return messages.length > 0 ? `Missing fields: ${messages.join(", ")}` : "";
  };

  // Process invoice items into financing periods.
  const processFinancingPeriods = () => {
    const periods = groupByFinancingPeriods(invoiceItems);
    console.log("Items to be grouped:", invoiceItems);
    setFinancingPeriods(periods);
    setViewFinancing(true);
  };

  // Calculate payments for each financing period with dates, period info, and dynamic colors.
  const calculatePayments = () => {
    const payments = [];
    // Define colors for different periods.
    const periodColors = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#FF5733",
      "#0088FE",
    ];

    financingPeriods.forEach((period, periodIndex) => {
      const periodColor = periodColors[periodIndex % periodColors.length];
      const periodStartDate = new Date(period.startDate);
      const periodEndDate = new Date(period.endDate);
      let numInstallments;
      if (paymentFrequency === "monthly") {
        numInstallments =
          (periodEndDate.getFullYear() - periodStartDate.getFullYear()) * 12 +
          (periodEndDate.getMonth() - periodStartDate.getMonth()) +
          1;
      } else if (paymentFrequency === "quarterly") {
        numInstallments = Math.ceil(
          ((periodEndDate.getFullYear() - periodStartDate.getFullYear()) * 12 +
            (periodEndDate.getMonth() - periodStartDate.getMonth()) +
            1) /
            3
        );
      }

      // Separate special charges from regular items.
      const specialItems = period.items.filter((item) => item.isSpecialCharge);
      const regularItems = period.items.filter((item) => !item.isSpecialCharge);
      const totalRegularCents = regularItems.reduce(
        (sum, item) => sum + item.serviceAmount,
        0
      );
      const totalSpecialCents = specialItems.reduce(
        (sum, item) => sum + item.serviceAmount,
        0
      );

      if (totalSpecialCents > 0) {
        // Special distribution: add special charges only to the first payment.
        const installmentRegularCents = Math.floor(
          totalRegularCents / numInstallments
        );
        const remainderRegularCents =
          totalRegularCents - installmentRegularCents * numInstallments;
        for (let i = 0; i < numInstallments; i++) {
          let paymentDate = new Date(periodStartDate);
          if (paymentFrequency === "monthly") {
            paymentDate.setMonth(paymentDate.getMonth() + i);
          } else if (paymentFrequency === "quarterly") {
            paymentDate.setMonth(paymentDate.getMonth() + i * 3);
          }
          let amountCents;
          if (i === 0) {
            amountCents =
              installmentRegularCents +
              remainderRegularCents +
              totalSpecialCents;
          } else {
            amountCents = installmentRegularCents;
          }
          payments.push({
            date: paymentDate.toISOString().split("T")[0],
            amount: amountCents / 100,
            period: periodIndex + 1,
            fill: periodColor,
          });
        }
      } else {
        // No special charges; distribute the total amount evenly.
        const totalCents = totalRegularCents;
        const installmentCents = Math.floor(totalCents / numInstallments);
        const remainderCents = totalCents - installmentCents * numInstallments;
        for (let i = 0; i < numInstallments; i++) {
          let paymentDate = new Date(periodStartDate);
          if (paymentFrequency === "monthly") {
            paymentDate.setMonth(paymentDate.getMonth() + i);
          } else if (paymentFrequency === "quarterly") {
            paymentDate.setMonth(paymentDate.getMonth() + i * 3);
          }
          const extra = i < remainderCents ? 1 : 0; // distribute extra cents
          payments.push({
            date: paymentDate.toISOString().split("T")[0],
            amount: (installmentCents + extra) / 100,
            period: periodIndex + 1,
            fill: periodColor,
          });
        }
      }
    });

    return payments;
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col w-full">
      {!viewFinancing ? (
        <>
          {/* Main Form */}
          <div className="bg-white p-8 overflow-auto flex-grow space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Buyer Data</h2>
            <EditableField
              id="buyerCompanyName"
              label="Company Name"
              defaultValue={buyerData.buyerCompanyName}
              onChange={(val) =>
                setBuyerData((prev) => ({ ...prev, buyerCompanyName: val }))
              }
            />
            <EditableField
              id="buyerCompanyAddress"
              label="Company Address"
              defaultValue={buyerData.buyerCompanyAddress}
              onChange={(val) =>
                setBuyerData((prev) => ({ ...prev, buyerCompanyAddress: val }))
              }
            />
            <div className="flex space-x-4">
              <EditableField
                id="buyerCompanyContactName"
                label="Contact Name"
                defaultValue={buyerData.buyerCompanyContactName}
                onChange={(val) =>
                  setBuyerData((prev) => ({
                    ...prev,
                    buyerCompanyContactName: val,
                  }))
                }
              />
              <EditableField
                id="buyerCompanyContactEmail"
                label="Contact Email"
                defaultValue={buyerData.buyerCompanyContactEmail}
                onChange={(val) =>
                  setBuyerData((prev) => ({
                    ...prev,
                    buyerCompanyContactEmail: val,
                  }))
                }
              />
            </div>

            <h3 className="text-2xl font-semibold mt-8">Invoice Data</h3>
            {invoiceItems.map((item, index) => (
              <div key={item.id} className="border rounded p-6 mb-6 space-y-4">
                <div className="flex justify-between">
                  <EditableField
                    id={`serviceTitle-${item.id}`}
                    label="Service Title"
                    defaultValue={item.serviceTitle}
                    onChange={(val) => {
                      const newItems = [...invoiceItems];
                      newItems[index].serviceTitle = val;
                      setInvoiceItems(newItems);
                    }}
                  />
                  <button
                    onClick={() =>
                      setInvoiceItems((prev) =>
                        prev.filter((inv) => inv.id !== item.id)
                      )
                    }
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
                <EditableField
                  id={`serviceDescription-${item.id}`}
                  label="Service Description"
                  defaultValue={item.serviceDescription}
                  onChange={(val) => {
                    const newItems = [...invoiceItems];
                    newItems[index].serviceDescription = val;
                    setInvoiceItems(newItems);
                  }}
                />
                <div className="flex items-center space-x-4">
                  <EditableCurrencyField
                    id={`serviceAmount-${item.id}`}
                    label="Amount"
                    defaultValue={item.serviceAmount}
                    onChange={(val) => {
                      const newItems = [...invoiceItems];
                      newItems[index].serviceAmount = val;
                      setInvoiceItems(newItems);
                    }}
                  />
                  {item.isSpecialCharge ? (
                    <div className="flex flex-col">
                      <Label className="font-bold">Special Charge</Label>
                      <span className="mt-2 text-muted-foreground">
                        One-time payment to be charged on first debit
                      </span>
                    </div>
                  ) : (
                    <>
                      <EditableField
                        id={`startDate-${item.id}`}
                        label="Start Date"
                        defaultValue={item.startDate || null}
                        type="date"
                        onChange={(val) => {
                          const newItems = [...invoiceItems];
                          newItems[index].startDate = val;
                          setInvoiceItems(newItems);
                        }}
                      />
                      <EditableField
                        id={`endDate-${item.id}`}
                        label="End Date"
                        defaultValue={item.endDate || null}
                        type="date"
                        onChange={(val) => {
                          const newItems = [...invoiceItems];
                          newItems[index].endDate = val;
                          setInvoiceItems(newItems);
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="p-4 bg-white border-t border-light-gray">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="w-full py-3 text-white bg-black rounded font-bold"
                    disabled={!isFormValid()}
                    style={!isFormValid() ? { cursor: "not-allowed" } : {}}
                    onClick={processFinancingPeriods}
                  >
                    Continue
                  </Button>
                </TooltipTrigger>
                {getTooltipMessage() && (
                  <TooltipContent>
                    <p>{getTooltipMessage()}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      ) : (
        <>
          {/* Payment Schedule */}
          <div className="p-6 mt-6 rounded-md flex-grow overflow-auto">
            <h3 className="text-2xl font-semibold mb-4">Payment Schedule</h3>
            <RadioGroup
              value={paymentFrequency}
              onValueChange={(value) => setPaymentFrequency(value)}
              className="mb-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label
                  htmlFor="monthly"
                  onClick={() => setPaymentFrequency("monthly")}
                >
                  Monthly
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarterly" id="quarterly" />
                <Label
                  htmlFor="quarterly"
                  onClick={() => setPaymentFrequency("quarterly")}
                >
                  Quarterly
                </Label>
              </div>
            </RadioGroup>
            <div className="w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={payments}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                      });
                    }}
                  />
                  <ChartTooltip content={<PaymentTooltipContent />} />
                  <Bar dataKey="amount">
                    {payments.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Display Financing Periods */}
            <h3 className="text-2xl font-semibold mb-4 mt-6">
              Credit breakdown
            </h3>
            {financingPeriods.map((period, index) => {
              const totalAmount = period.items.reduce(
                (sum, item) => sum + item.serviceAmount,
                0
              );
              return (
                <div key={index} className="mb-4">
                  <h4 className="text-l font-bold">Period {index + 1}</h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(period.startDate)} &#8594;{" "}
                    {formatDate(period.endDate)}
                  </p>
                  <ul className="mt-2">
                    {period.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span className="italic text-sm flex-grow">
                          {item.serviceTitle}
                        </span>
                        <span className="italic text-sm ml-2">
                          {`$${(item.serviceAmount / 100).toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <hr className="my-2" />
                  <div className="flex justify-end font-bold">
                    <span>{`$${(totalAmount / 100).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Back Button */}
          <div className="p-4 bg-white border-t border-light-gray">
            <Button
              variant="outline"
              className="w-full py-3 font-bold"
              onClick={() => setViewFinancing(false)}
            >
              Back
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// Group invoice items into financing periods.
function groupByFinancingPeriods(items) {
  const periods = [];
  const specialCharges = [];

  const sorted = [...items].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );

  sorted.forEach((item) => {
    const itemStart = item.startDate ? new Date(item.startDate) : null;
    const itemEnd = item.endDate ? new Date(item.endDate) : null;
    let merged = false;

    if (item.isSpecialCharge) {
      specialCharges.push(item);
    } else {
      for (let period of periods) {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);

        if (itemStart >= periodStart && itemEnd <= periodEnd) {
          period.items.push(item);
          merged = true;
          break;
        }
      }
    }

    if (!merged && !item.isSpecialCharge) {
      periods.push({
        startDate: item.startDate,
        endDate: item.endDate,
        items: [item],
      });
    }
  });

  if (specialCharges.length > 0) {
    if (periods.length > 0) {
      periods[0].items.push(...specialCharges);
    } else {
      periods.push({
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        items: specialCharges,
      });
    }
  }

  return periods.map(({ startDate, endDate, items }) => ({
    startDate,
    endDate,
    items,
  }));
}
