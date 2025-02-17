"use client";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function Dropzone({ onFileUploaded }) {
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  // Simulate progress updates until the API call is complete.
  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        // Increment in 20 steps to reach 90 in 2 seconds
        return Math.min(prev + 90 / 20, 90);
      });
    }, 100); // Update every 100ms
  };

  // Helper function to convert a file into a base64 encoded string.
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Updated function to handle both file upload and prompt submission.
  const handleUploadOrPrompt = async (file, promptText) => {
    setLoading(true);
    simulateProgress(); // Start simulating progress

    try {
      let body = {};
      if (file) {
        // Convert the file to a base64 encoded string.
        const fileUrl = URL.createObjectURL(file);
        const base64EncodedPDF = await fileToBase64(file).then(
          (data) => data.split(",")[1]
        );
        body.base64 = base64EncodedPDF;
      }
      if (promptText) {
        body.prompt = promptText;
      }

      // Send the data to your /brain endpoint.
      const res = await fetch("/api/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const brainResponse = await res.json();
      if (!res.ok) {
        throw new Error(brainResponse.error || "Brain API call failed");
      }
      console.log("Brain response", brainResponse);
      setProgress(100);

      // Optionally wait a bit for UI smoothness.
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Pass the response (and optionally the base64 data) to the parent component.
      await onFileUploaded({
        brainResponse,
        fileUrl: file ? URL.createObjectURL(file) : null,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
      setLoading(false);
      setProgress(0); // Reset progress
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await handleUploadOrPrompt(file, prompt);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleUploadOrPrompt(file, prompt);
    }
  };

  const handlePromptSubmit = async () => {
    if (prompt.trim()) {
      console.log("Prompt submitted:", prompt);
      await handleUploadOrPrompt(null, prompt);
      setPrompt("");
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Base Background Layer: Dot grid with inverse radial gradient */}
      <motion.div
        className="absolute inset-0 transition-all duration-300"
        initial={{
          backgroundSize: "100% 100%, 25px 25px",
          backgroundImage: `
            radial-gradient(circle at center, white 10%, transparent 60%),
            radial-gradient(circle, #d1d5db 1px, transparent 1px)
          `,
        }}
        animate={{
          backgroundImage: isDragging
            ? `
              radial-gradient(circle at center, white 0%, transparent 40%),
              radial-gradient(circle, #d1d5db 1.5px, transparent 1px)
            `
            : loading
            ? [
                `
              radial-gradient(circle at center, white 10%, transparent 60%),
              radial-gradient(circle, #d1d5db 1px, transparent 1px)
              `,
                `
              radial-gradient(circle at center, white 5%, transparent 50%),
              radial-gradient(circle, #d1d5db 1.5px, transparent 1px)
              `,
              ]
            : `
              radial-gradient(circle at center, white 10%, transparent 60%),
              radial-gradient(circle, #d1d5db 1px, transparent 1px)
            `,
          backgroundSize: loading
            ? ["100% 100%, 20px 20px"]
            : "100% 100%, 25px 25px",
        }}
        transition={{
          duration: loading ? 0.5 : 0.3,
          repeat: loading ? Infinity : 0,
          repeatType: loading ? "reverse" : undefined,
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10 text-center">
        {loading ? (
          <div className="flex flex-col items-center">
            <Progress
              value={progress}
              className="w-64 h-2 transition-opacity duration-500"
            />
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-4">
              Drop a doc to get started
            </h1>
            <p className="text-lg mb-2">
              You can upload a PDF file with an invoice, pro-forma or order
              form.
            </p>
            <p className="text-sm text-gray-500">
              Click{" "}
              <span
                className="underline cursor-pointer"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                here
              </span>{" "}
              to upload.
            </p>
            <h2 className="text-4xl font-bold mb-4">or</h2>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <div className="mt-6">
              <textarea
                className="w-full h-32 p-2 border rounded"
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handlePromptSubmit();
                  }
                }}
              />
              <Button className="mt-2" onClick={handlePromptSubmit}>
                Submit Prompt
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
