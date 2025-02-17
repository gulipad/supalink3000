import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const instructionsPath = path.join(
  process.cwd(),
  "src/app/config/experimentalInstructions.md"
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
  const requestData = await req.json();

  try {
    let result;
    if (requestData.base64) {
      result = await model.generateContent([
        {
          inlineData: {
            data: requestData.base64,
            mimeType: "application/pdf",
          },
        },
        "Follow system instructions",
      ]);
    } else if (requestData.prompt) {
      result = await model.generateContent(requestData.prompt);
    } else {
      return NextResponse.json(
        { error: "No valid input provided" },
        { status: 400 }
      );
    }

    const responseText = result.response.text();

    const codeBlockRegex = /^```json\s*([\s\S]*?)\s*```$/;
    const match = responseText.match(codeBlockRegex);
    const structuredOutput = match ? JSON.parse(match[1]) : null;

    // Ensure structured output is present
    if (!structuredOutput) {
      return NextResponse.json(
        { error: "No structured output" },
        { status: 400 }
      );
    }

    // Return the assistant's reply.
    return NextResponse.json(structuredOutput, { status: 200 });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: "Error calling Gemini API" },
      { status: 500 }
    );
  }
}
