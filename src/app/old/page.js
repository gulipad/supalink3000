"use client";
import { useState, useRef, useEffect, useMemo } from "react";

// Helper function to convert an array of objects to CSV text.
function convertToCSV(data) {
  if (!data || !data.length) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((header) => row[header]));
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// Helper function to parse localized number strings.
function parseLocalizedNumber(str) {
  if (typeof str !== "string") return NaN;
  str = str.trim();
  if (!str) return NaN;
  const commaCount = (str.match(/,/g) || []).length;
  const dotCount = (str.match(/\./g) || []).length;
  if (commaCount > 0 && dotCount > 0) {
    if (str.lastIndexOf(".") > str.lastIndexOf(",")) {
      return parseFloat(str.replace(/,/g, ""));
    } else {
      return parseFloat(str.replace(/\./g, "").replace(/,/g, "."));
    }
  } else if (commaCount > 0) {
    return parseFloat(str.replace(/,/g, "."));
  } else {
    return parseFloat(str);
  }
}

// A custom numeric input that holds its own local state.
function NumericInput({ value, onBlur, ...props }) {
  const [inputValue, setInputValue] = useState(
    value !== undefined && value !== null ? String(value) : ""
  );
  useEffect(() => {
    setInputValue(value !== undefined && value !== null ? String(value) : "");
  }, [value]);
  return (
    <input
      {...props}
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={(e) => onBlur(e.target.value)}
    />
  );
}

// Helper to add months to a date string (YYYY-MM-DD).
function addMonths(dateString, months) {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Generate CSV rows from schedule items and fee configuration.
function generateCSVRows(scheduleItems, vendorFee, buyerFee) {
  const rows = [];
  scheduleItems.forEach((item, idx) => {
    const vendorLineId = `Vendor_Draw_${idx + 1}`;
    const buyerLineId = `Line_${idx + 1}`;
    // Compute vendor row:
    const vendorAmount = Math.round(item.serviceAmount * (1 - vendorFee / 100));
    const vendorFinancingFee = Math.round(vendorFee * 100000);
    const vendorRow = {
      lineId: vendorLineId,
      parentLineId: "",
      vendorLineId: vendorLineId,
      itemType: "vendor",
      itemName: item.serviceTitle,
      itemDescription: item.serviceDescription,
      itemFinancingFee: vendorFinancingFee,
      itemCreditCardFee: "",
      amount: vendorAmount,
      dueDate: item.firstChargeDate,
    };
    rows.push(vendorRow);

    // Buyer rows: one per installment.
    const n = item.numberOfPayments;
    if (n && n > 0) {
      const totalBuyerAmount = Math.round(
        item.serviceAmount * (1 + buyerFee / 100)
      );
      const base = Math.floor(totalBuyerAmount / n);
      const remainder = totalBuyerAmount % n;
      const buyerFinancingFee = Math.round(buyerFee * 100000);
      // Determine period multiplier: 3 for quarterly, 1 for monthly (or one-time)
      const periodMultiplier = item.paymentTerms === "quarterly" ? 3 : 1;
      for (let j = 0; j < n; j++) {
        const installmentAmount = base + (j < remainder ? 1 : 0);
        const dueDate = addMonths(item.firstChargeDate, j * periodMultiplier);
        const buyerRow = {
          lineId: buyerLineId,
          parentLineId: "",
          vendorLineId: vendorLineId,
          itemType: "buyer",
          itemName: item.serviceTitle,
          itemDescription: item.serviceDescription,
          itemFinancingFee: buyerFinancingFee,
          itemCreditCardFee: "",
          amount: installmentAmount,
          dueDate: dueDate,
        };
        rows.push(buyerRow);
      }
    }
  });
  return rows;
}

// ScheduleEditor: displays an editable form for each schedule item and allows deletion.
function ScheduleEditor({ data, onChange }) {
  function handleItemChange(index, field, newValue) {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: newValue };
    onChange(newData);
  }

  function handleDelete(index) {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  }

  const totalAmount = data.reduce(
    (sum, item) => sum + (item.serviceAmount || 0),
    0
  );

  return (
    <div className="scheduleEditor">
      {data.map((item, index) => (
        <div key={index} className="scheduleItem">
          <div className="headerRow">
            <div className="row">
              <div className="form-group half">
                <label>Title</label>
                <input
                  type="text"
                  value={item.serviceTitle || ""}
                  onChange={(e) =>
                    handleItemChange(index, "serviceTitle", e.target.value)
                  }
                />
              </div>
              <div className="form-group half">
                <label>Amount ($)</label>
                <NumericInput
                  value={
                    item.serviceAmount != null
                      ? (item.serviceAmount / 100).toString()
                      : ""
                  }
                  onBlur={(val) => {
                    const parsed = parseLocalizedNumber(val);
                    if (!isNaN(parsed)) {
                      handleItemChange(
                        index,
                        "serviceAmount",
                        Math.round(parsed * 100)
                      );
                    } else {
                      handleItemChange(index, "serviceAmount", null);
                    }
                  }}
                />
              </div>
            </div>
            <button
              className="deleteButton"
              onClick={() => handleDelete(index)}
            >
              Delete
            </button>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={item.serviceDescription || ""}
              onChange={(e) =>
                handleItemChange(index, "serviceDescription", e.target.value)
              }
            />
          </div>
          <div className="row">
            <div className="form-group third">
              <label>Payment Terms</label>
              <select
                value={item.paymentTerms || ""}
                onChange={(e) =>
                  handleItemChange(index, "paymentTerms", e.target.value)
                }
              >
                <option value="">Select terms</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
            <div className="form-group third">
              <label>Installments</label>
              <input
                type="number"
                value={item.numberOfPayments || ""}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "numberOfPayments",
                    e.target.value ? parseInt(e.target.value, 10) : 0
                  )
                }
              />
            </div>
            <div className="form-group third">
              <label>First Charge Date</label>
              <input
                type="date"
                value={item.firstChargeDate || ""}
                onChange={(e) =>
                  handleItemChange(index, "firstChargeDate", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      ))}
      {data.length > 0 && (
        <div className="totalRow">
          <div className="form-group half">
            <label>Total Amount ($)</label>
            <input
              type="text"
              value={(totalAmount / 100).toFixed(2)}
              readOnly
            />
          </div>
        </div>
      )}
      <style jsx>{`
        .scheduleEditor {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        .scheduleItem {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #f7f7f7;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .headerRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .deleteButton {
          background-color: #ff4d4f;
          border: none;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .deleteButton:hover {
          background-color: #d9363e;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          font-size: 0.75rem;
          margin-bottom: 2px;
        }
        .form-group input,
        .form-group select {
          padding: 4px;
          font-size: 0.9rem;
        }
        .row {
          display: flex;
          gap: 8px;
        }
        .half {
          flex: 1;
        }
        .third {
          flex: 1;
        }
        .totalRow {
          padding: 8px;
          border-top: 2px solid #0070f3;
          background: #e0f7fa;
        }
      `}</style>
    </div>
  );
}

// CodeBlock: displays CSV output.
function CodeBlock({ code, onCopy, copied }) {
  return (
    <div className="codeBlockContainer">
      <button className="copyButton" onClick={onCopy}>
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre>
        <code>{code}</code>
      </pre>
      <style jsx>{`
        .codeBlockContainer {
          position: relative;
          background-color: #f6f8fa;
          border: 1px solid #d1d5da;
          border-radius: 6px;
          padding: 42px 16px 16px 16px;
          font-family: Menlo, Monaco, "Courier New", monospace;
          font-size: 0.9rem;
          width: 100%;
          max-width: 600px;
          overflow: hidden;
        }
        pre {
          margin: 0;
          max-height: 300px;
          overflow-y: auto;
        }
        .copyButton {
          position: absolute;
          top: 8px;
          right: 8px;
          background-color: #eaeaea;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          cursor: pointer;
          font-size: 0.8rem;
          transition: background-color 0.2s;
        }
        .copyButton:hover {
          background-color: #d4d4d4;
        }
      `}</style>
    </div>
  );
}

export default function Old() {
  // Full conversation history.
  const [chatHistory, setChatHistory] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [scheduleItems, setScheduleItems] = useState(null);
  // For system (assistant/model) responses.
  const [messages, setMessages] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Config state.
  const [totalFee, setTotalFee] = useState(10);
  const [vendorFee, setVendorFee] = useState(10);
  const [buyerFee, setBuyerFee] = useState(0);
  useEffect(() => {
    setBuyerFee(totalFee - vendorFee);
  }, [totalFee, vendorFee]);

  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Helper: upload file to Gemini.
  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/uploadFile", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      throw new Error("File upload failed");
    }
    const fileData = await res.json();
    return fileData;
  }

  // Handle file selection: upload and add file context if not already present.
  async function handleFileChange(e) {
    setLoading(true);
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileData = await uploadFile(file);
      setUploadedFile(fileData);
      if (
        !chatHistory.some(
          (msg) => msg.parts && msg.parts.some((part) => part.fileData)
        )
      ) {
        const fileMessage = {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: fileData.mimeType,
                fileUri: fileData.uri,
              },
            },
          ],
        };
        setChatHistory((prev) => [...prev, fileMessage]);
      }
      console.log("Uploaded file data:", fileData);
    } catch (err) {
      console.error("File upload error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle user prompt submission.
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setScheduleItems(null);
    const userMessage = {
      role: "user",
      parts: [{ text: prompt }],
    };
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, history: updatedHistory }),
      });
      const data = await res.json();
      console.log("Response from API:", data);
      if (data.csv || data.json) {
        setScheduleItems(data.csv || data.json);
      } else if (data.message) {
        const systemMessage = {
          role: "model",
          parts: [{ text: data.message }],
        };
        setMessages((prev) => [...prev, data.message]);
        setChatHistory((prev) => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  // Clear all state.
  function handleClear() {
    setPrompt("");
    setUploadedFile(null);
    setScheduleItems(null);
    setMessages([]);
    setChatHistory([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  }

  async function handleCopySchedule() {
    if (scheduleItems) {
      const csvRows = generateCSVRows(scheduleItems, vendorFee, buyerFee);
      const csvText = convertToCSV(csvRows);
      try {
        await navigator.clipboard.writeText(csvText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  }

  // Helper to generate CSV rows.
  function generateCSVRows(scheduleItems, vendorFee, buyerFee) {
    const rows = [];
    scheduleItems.forEach((item, idx) => {
      const vendorLineId = `Vendor_Draw_${idx + 1}`;
      const buyerLineId = `Line_${idx + 1}`;
      const vendorAmount = Math.round(
        item.serviceAmount * (1 - vendorFee / 100)
      );
      const vendorFinancingFee = Math.round(vendorFee * 100000);
      const vendorRow = {
        lineId: vendorLineId,
        parentLineId: "",
        vendorLineId: vendorLineId,
        itemType: "vendor",
        itemName: item.serviceTitle,
        itemDescription: item.serviceDescription,
        itemFinancingFee: vendorFinancingFee,
        itemCreditCardFee: "",
        amount: vendorAmount,
        dueDate: item.firstChargeDate,
      };
      rows.push(vendorRow);

      // Determine the period multiplier for due dates.
      const periodMultiplier = item.paymentTerms === "quarterly" ? 3 : 1; // Default is monthly; quarterly multiplies by 3.

      const n = item.numberOfPayments;
      if (n && n > 0) {
        const totalBuyerAmount = Math.round(
          item.serviceAmount * (1 + buyerFee / 100)
        );
        const base = Math.floor(totalBuyerAmount / n);
        const remainder = totalBuyerAmount % n;
        const buyerFinancingFee = Math.round(buyerFee * 100000);
        for (let j = 0; j < n; j++) {
          const installmentAmount = base + (j < remainder ? 1 : 0);
          const dueDate = addMonths(item.firstChargeDate, j * periodMultiplier);
          const buyerRow = {
            lineId: buyerLineId,
            parentLineId: "",
            vendorLineId: vendorLineId,
            itemType: "buyer",
            itemName: item.serviceTitle,
            itemDescription: item.serviceDescription,
            itemFinancingFee: buyerFinancingFee,
            itemCreditCardFee: "",
            amount: installmentAmount,
            dueDate: dueDate,
          };
          rows.push(buyerRow);
        }
      }
    });
    return rows;
  }

  return (
    <div className="wrapper">
      <div className="container">
        {/* Left Panel – Config, Inputs, and File Upload */}
        <div className="leftPanel">
          <div className="configSection">
            <h2>Config</h2>
            <div className="configRow">
              <div className="configItem">
                <label>Total Fee (%)</label>
                <NumericInput
                  value={totalFee}
                  onBlur={(val) =>
                    setTotalFee(
                      Math.min(Math.max(parseLocalizedNumber(val) || 0, 0), 100)
                    )
                  }
                />
              </div>
              <div className="configItem">
                <label>Vendor Fee (%)</label>
                <NumericInput
                  value={vendorFee}
                  onBlur={(val) =>
                    setVendorFee(
                      Math.min(Math.max(parseLocalizedNumber(val) || 0, 0), 100)
                    )
                  }
                />
              </div>
              <div className="configItem">
                <label>Buyer Fee (%)</label>
                <NumericInput
                  value={buyerFee}
                  onBlur={(val) =>
                    setBuyerFee(
                      Math.min(Math.max(parseLocalizedNumber(val) || 0, 0), 100)
                    )
                  }
                />
              </div>
            </div>
          </div>
          <h1>Upload a PDF or Enter a Prompt</h1>
          <form onSubmit={handleSubmit} className="form">
            <textarea
              className="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your text prompt"
              rows={6}
            />
            <input
              className="file-input"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <div className="buttonRow">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Loading..." : "Submit"}
              </button>
              <button
                type="button"
                className="clear-btn"
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Divider */}
        <div className="divider"></div>

        {/* Right Panel – Results */}
        <div className="rightPanel">
          <div className="resultContainer">
            {scheduleItems ? (
              <>
                <ScheduleEditor
                  data={scheduleItems}
                  onChange={setScheduleItems}
                />
                <div className="csvContainer">
                  <h2>CSV Output</h2>
                  <CodeBlock
                    code={convertToCSV(
                      generateCSVRows(scheduleItems, vendorFee, buyerFee)
                    )}
                    onCopy={handleCopySchedule}
                    copied={copied}
                  />
                </div>
              </>
            ) : chatHistory.length > 0 || messages.length > 0 ? (
              // Display only model (system) messages.
              <div className="messagesContainer" ref={messagesContainerRef}>
                {chatHistory
                  .filter((msg) => msg.role === "model")
                  .map((msg, index) => (
                    <div className="messageBox" key={index}>
                      {msg.parts.map((part, idx) => (
                        <p key={idx}>{part.text || ""}</p>
                      ))}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="emptyState">
                <p>
                  No conversation yet. Please upload a file or enter a prompt.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .wrapper {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafa;
          padding: 20px;
          box-sizing: border-box;
        }
        .container {
          display: flex;
          flex-direction: row;
          width: 90vw;
          max-width: 1200px;
          height: 100%;
          background: #fff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .leftPanel,
        .rightPanel {
          flex: 1;
          padding: 40px;
          box-sizing: border-box;
          overflow-y: auto;
        }
        .divider {
          width: 2px;
          background: #ddd;
        }
        h1,
        h2 {
          text-align: center;
          margin-bottom: 20px;
        }
        .form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .prompt-input {
          width: 100%;
          padding: 12px;
          font-size: 1rem;
          border: 2px solid #ddd;
          border-radius: 6px;
          transition: border-color 0.3s;
          resize: vertical;
        }
        .prompt-input:focus {
          border-color: #0070f3;
          outline: none;
        }
        .file-input {
          padding: 8px;
          font-size: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          background-color: #fefefe;
        }
        .buttonRow {
          display: flex;
          gap: 16px;
        }
        .submit-btn,
        .clear-btn {
          background-color: #0070f3;
          color: #fff;
          border: none;
          padding: 12px 24px;
          font-size: 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .submit-btn:disabled,
        .clear-btn:disabled {
          background-color: #aac9f7;
          cursor: not-allowed;
        }
        .submit-btn:hover:not(:disabled) {
          background-color: #005bb5;
        }
        .clear-btn:hover:not(:disabled) {
          background-color: #005bb5;
        }
        .configSection {
          width: 100%;
          margin: 20px 0;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 16px;
          background: #f9f9f9;
        }
        .configSection h2 {
          margin-top: 0;
          text-align: center;
          font-size: 1.1rem;
        }
        .configRow {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .configItem {
          display: flex;
          flex-direction: column;
          max-width: 120px;
        }
        .configItem label {
          font-size: 0.8rem;
          margin-bottom: 4px;
        }
        .configItem input {
          padding: 4px;
          font-size: 0.9rem;
        }
        .resultContainer {
          text-align: center;
        }
        .emptyState {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          border: 2px dashed #ccc;
          border-radius: 6px;
          padding: 20px;
          color: #777;
        }
        .csvContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }
        .messagesContainer {
          display: flex;
          flex-direction: column;
          gap: 16px;
          height: 100%;
          overflow-y: auto;
          padding: 16px;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .messageBox {
          background-color: #f7f7f7;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 16px;
          text-align: left;
        }
        .messageBox p {
          margin: 0;
          font-size: 1rem;
          color: #555;
        }
        .copyButton {
          background-color: #0070f3;
          color: #fff;
          border: none;
          padding: 8px 16px;
          font-size: 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .copyButton:hover {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  );
}
