"use client";

export default function DocumentViewer({ fileUrl }) {
  console.log(fileUrl);
  return (
    <div className="w-full h-full overflow-auto bg-gray-50">
      <iframe
        src={fileUrl} // Use the URI of the uploaded file
        className="w-full h-full"
        title="Document Viewer"
      />
    </div>
  );
}
