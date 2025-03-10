"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function DocumentViewer({ fileUrl, base64 }) {
  // Create data URL from base64 if provided
  const documentUrl = base64
    ? `data:application/pdf;base64,${base64}`
    : fileUrl;

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 flex items-center justify-center">
      {documentUrl ? (
        <iframe
          src={documentUrl}
          className="w-full h-full"
          title="Document Viewer"
        />
      ) : (
        <Card className="text-center p-6">
          <CardHeader>
            <CardTitle>Prompt-generated schedule</CardTitle>
            <CardDescription>No invoice was provided.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
