import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const apiKey = process.env.GEMINI_API_KEY;
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads a file (from the given local path) to Gemini.
 */
async function uploadToGemini(filePath, mimeType) {
  const uploadResult = await fileManager.uploadFile(filePath, {
    mimeType,
    displayName: path.basename(filePath),
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

/**
 * Waits (via polling) until all files in the array have been processed and are ACTIVE.
 */
async function waitForFilesActive(files) {
  console.log("Waiting for file processing...");
  for (const fileObj of files) {
    let file = await fileManager.getFile(fileObj.name);
    // Poll every 10 seconds until the file state is no longer PROCESSING.
    while (file.state === "PROCESSING") {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      file = await fileManager.getFile(fileObj.name);
    }
    if (file.state !== "ACTIVE") {
      throw new Error(
        `File ${file.name} failed to process (state: ${file.state})`
      );
    }
  }
  console.log("\n...all files are active.");
}

/**
 * This API route accepts a POST request with FormData containing a file.
 * It saves the file temporarily (using /tmp), uploads it to Gemini, waits for processing to complete,
 * then returns the uploaded file's context.
 */
export async function POST(req) {
  try {
    // Retrieve the file from the FormData.
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Use the /tmp directory (the only writable location in Vercel's serverless functions)
    const tempDir = "/tmp";
    await fs.promises.mkdir(tempDir, { recursive: true });
    const tempFilePath = path.join(tempDir, file.name);

    // Write the file to disk.
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(tempFilePath, buffer);

    // Upload the file to Gemini.
    const uploadedFile = await uploadToGemini(tempFilePath, file.type);

    // Wait until the file is processed and ACTIVE.
    await waitForFilesActive([uploadedFile]);

    // Remove the temporary file.
    await fs.promises.unlink(tempFilePath);

    // Return the uploaded file's details.
    return NextResponse.json(uploadedFile, { status: 200 });
  } catch (error) {
    console.error("Error in file upload:", error);
    return NextResponse.json(
      { error: error.message || "Error uploading file to Gemini" },
      { status: 500 }
    );
  }
}
