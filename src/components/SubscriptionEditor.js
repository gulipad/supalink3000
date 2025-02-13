"use client";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FaEdit, FaCheck, FaTrash } from "react-icons/fa";

function EditableField({ id, label, defaultValue, onChange, type = "text" }) {
  const [isEditing, setIsEditing] = useState(!defaultValue);
  const [value, setValue] = useState(defaultValue || "");

  const handleSave = () => {
    setIsEditing(false);
    if (onChange) onChange(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
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
            autoFocus
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

function EditableCurrencyField({ id, label, defaultValue, onChange }) {
  // Convert default value (in cents) to dollars as a string with two decimals.
  const initialDollars =
    defaultValue != null ? (defaultValue / 100).toFixed(2) : "";
  // "isEditing" determines whether we show the raw, unformatted value.
  const [isEditing, setIsEditing] = useState(!defaultValue);
  const [rawValue, setRawValue] = useState(initialDollars);

  // Format for display mode.
  const formatForDisplay = (val) => {
    const number = parseFloat(val);
    if (isNaN(number)) return "";
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    const normalized = rawValue.replace(/,/g, ".");
    const number = parseFloat(normalized);
    if (!isNaN(number)) {
      onChange && onChange(Math.round(number * 100));
      setRawValue(number.toFixed(2));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  const handleChange = (e) => {
    // Let the user type freely; we do minimal sanitization.
    setRawValue(e.target.value);
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
            onChange={handleChange}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-grow"
            autoFocus
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

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { day: "2-digit", month: "short", year: "2-digit" };
  return date.toLocaleDateString("en-US", options);
}

export default function SubscriptionEditor({ brainResponse }) {
  // Destructure the fields from the brain response.
  const {
    buyerCompanyName,
    buyerCompanyAddress,
    buyerCompanyContactName,
    buyerCompanyContactEmail,
    scheduleItems,
  } = brainResponse;

  // Local state for buyer data.
  const [buyerData, setBuyerData] = useState({
    buyerCompanyName,
    buyerCompanyAddress,
    buyerCompanyContactName,
    buyerCompanyContactEmail,
  });

  // Local state for invoice items (scheduleItems).
  const [invoiceItems, setInvoiceItems] = useState(scheduleItems || []);

  const handleBuyerChange = (field, newValue) => {
    setBuyerData((prev) => ({ ...prev, [field]: newValue }));
  };

  const handleDeleteInvoice = (index) => {
    setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col w-full">
      <div className="bg-white p-8 overflow-auto flex-grow space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Buyer Data</h2>
        <EditableField
          id="buyerCompanyName"
          label="Company Name"
          defaultValue={buyerData.buyerCompanyName}
          onChange={(val) => handleBuyerChange("buyerCompanyName", val)}
        />
        <EditableField
          id="buyerCompanyAddress"
          label="Company Address"
          defaultValue={buyerData.buyerCompanyAddress}
          onChange={(val) => handleBuyerChange("buyerCompanyAddress", val)}
        />
        <div className="flex space-x-4">
          <EditableField
            id="buyerCompanyContactName"
            label="Contact Name"
            defaultValue={buyerData.buyerCompanyContactName}
            onChange={(val) =>
              handleBuyerChange("buyerCompanyContactName", val)
            }
          />
          <EditableField
            id="buyerCompanyContactEmail"
            label="Contact Email"
            defaultValue={buyerData.buyerCompanyContactEmail}
            onChange={(val) =>
              handleBuyerChange("buyerCompanyContactEmail", val)
            }
          />
        </div>

        <h3 className="text-2xl font-semibold mt-8">Invoice Data</h3>
        {invoiceItems.map((item, index) => (
          <div key={index} className="border rounded p-6 mb-6 space-y-4">
            <div className="flex justify-between">
              <EditableField
                id={`serviceTitle-${index}`}
                label="Service Title"
                defaultValue={item.serviceTitle}
              />
              <div className="flex items-center h-full">
                <button
                  onClick={() => handleDeleteInvoice(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
            <EditableField
              id={`serviceDescription-${index}`}
              label="Service Description"
              defaultValue={item.serviceDescription}
            />
            <div className="flex items-center space-x-4">
              <EditableCurrencyField
                id={`serviceAmount-${index}`}
                label="Amount"
                defaultValue={item.serviceAmount}
                onChange={(val) => {
                  const newItems = [...invoiceItems];
                  newItems[index].serviceAmount = val;
                  setInvoiceItems(newItems);
                }}
              />
              <EditableField
                id={`startDate-${index}`}
                label="Start Date"
                defaultValue={formatDate(item.startDate)}
                type="date"
              />
              <EditableField
                id={`endDate-${index}`}
                label="End Date"
                defaultValue={formatDate(item.endDate)}
                type="date"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
