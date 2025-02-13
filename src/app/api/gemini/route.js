import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const instructionsPath = path.join(
  process.cwd(),
  "src/app/config/systemInstructions.md"
);
const systemInstructions = fs.readFileSync(instructionsPath, "utf-8");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: systemInstructions,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function POST(req) {
  const { prompt, history } = await req.json();

  try {
    // Start the chat session using the passed history.
    const chatSession = model.startChat({
      generationConfig,
      history: history || [],
    });

    console.log("Chat history:", JSON.stringify(history, null, 2));

    // Send the new user prompt.
    const result = await chatSession.sendMessage(prompt);
    const responseText = result.response.candidates[0].content.parts[0].text;

    const codeBlockRegex = /^```json\s*([\s\S]*?)\s*```$/;
    const match = responseText.match(codeBlockRegex);
    const structuredOutput = match ? JSON.parse(match[1]) : null;
    const response = structuredOutput
      ? { json: structuredOutput }
      : { message: responseText };

    // Return the assistant's reply.
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: "Error calling Gemini API" },
      { status: 500 }
    );
  }
}

// const data = {
//   csv: [
//     {
//       lineId: "Vendor_Draw_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "vendor",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "10000000",
//       itemCreditCardFee: "",
//       amount: "12000000",
//       dueDate: "2025-01-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-01-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-02-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-03-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-04-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-05-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-06-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-07-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-08-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-09-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-10-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-11-24",
//     },
//     {
//       lineId: "Line_1",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_1",
//       itemType: "buyer",
//       itemName: "Year 1",
//       itemDescription: "First credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "1000000",
//       dueDate: "2025-12-24",
//     },
//     {
//       lineId: "Vendor_Draw_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "vendor",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "10000000",
//       itemCreditCardFee: "",
//       amount: "24000000",
//       dueDate: "2026-01-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-01-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-02-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-03-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-04-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-05-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-06-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-07-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-08-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-09-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-10-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-11-24",
//     },
//     {
//       lineId: "Line_2",
//       parentLineId: "",
//       vendorLineId: "Vendor_Draw_2",
//       itemType: "buyer",
//       itemName: "Year 2",
//       itemDescription: "Second credit",
//       itemFinancingFee: "0",
//       itemCreditCardFee: "",
//       amount: "2000000",
//       dueDate: "2026-12-24",
//     },
//   ],
// };
