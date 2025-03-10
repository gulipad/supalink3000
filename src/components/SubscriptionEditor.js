"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaEdit, FaCheck, FaTrash } from "react-icons/fa";
import { Loader2 } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { computePaymentData } from "@/lib/computePaymentData";

// Helper to convert cents to dollars
function convert(amountInCents) {
  return amountInCents / 100;
}

// Helper function to format dates (from Date objects)
const formatDateUTC = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

// Main component
export default function SubscriptionEditor({ brainResponse, base64 }) {
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

  const [viewFinancing, setViewFinancing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

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

  // When the user clicks Continue, process the data and show the financing view.
  const processFinancingPeriods = () => {
    setViewFinancing(true);
  };

  // Create payment link handler
  const createPaymentLink = () => {
    setIsLoading(true);

    // Generate random 6 character id
    const id = Math.random().toString(36).substring(2, 8);

    // Store data in localStorage
    localStorage.setItem(
      id,
      JSON.stringify({
        buyerData,
        invoiceData: invoiceItems,
        base64,
      })
    );

    // Create URL with id parameter
    const url = `${window.location.origin}${window.location.pathname}payment-link?id=${id}`;

    // Copy to clipboard
    navigator.clipboard.writeText(url);

    setTimeout(() => {
      setIsLoading(false);
      setIsLinkCopied(true);
    }, 2000);
  };

  // Compute payment data (using a default "monthly" term)
  const { summary, details } = computePaymentData(invoiceItems, "monthly");

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
        // Confirmation / Financing View
        <div className="h-screen overflow-hidden flex flex-col w-full">
          <div className="bg-white p-8 overflow-auto flex-grow space-y-6">
            {/* Payment Summary */}
            <h2 className="text-2xl font-semibold mb-4">Payment Summary</h2>
            <div className="max-w-3xl mx-auto">
              {/* Subscription Payments Summary */}
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Subscription Payments
                </p>
                <div className="flex justify-between items-center text-sm font-medium mt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span>
                      {formatDateUTC(summary.subscription.overallStartDate)} to{" "}
                      {formatDateUTC(summary.subscription.overallEndDate)}
                    </span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                      {summary.subscription.totalInstallments} installments
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
                      })}{" "}
                      to $
                      {convert(
                        summary.subscription.maxInstallmentAmount
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      /month
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
                      /month
                    </span>
                  )}
                </div>
              </div>
              {summary.oneOff.length > 0 && (
                <>
                  <Separator className="my-4" />
                  {/* One‑off Payments Summary */}
                  <div>
                    <p className="text-sm font-medium text-gray-600">
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
                </>
              )}
            </div>
            {/* Detailed Payment Data */}
            <div className="space-y-6">
              {/* Subscription Invoices */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Full Details</h2>
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
                  <h3 className="text-lg font-semibold mb-2">
                    One‑off Payments
                  </h3>
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
          </div>

          {/* Create Payment Link Button */}
          <div className="p-4 bg-white border-t border-light-gray">
            <Button
              className="w-full py-3 text-white bg-black rounded font-bold"
              onClick={createPaymentLink}
              disabled={isLinkCopied}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Just a second...
                </>
              ) : isLinkCopied ? (
                "Link copied to clipboard ✅"
              ) : (
                "Create Payment Link"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
