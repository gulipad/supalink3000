"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function DocumentViewer({ fileUrl }) {
  console.log(fileUrl);
  return (
    <div className="w-full h-full overflow-auto bg-gray-50 flex items-center justify-center">
      {fileUrl ? (
        <iframe
          src={fileUrl} // Use the URI of the uploaded file
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
