"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dropzone from "@/components/Dropzone";
import DocumentViewer from "@/components/DocumentViewer";
import SubscriptionEditor from "@/components/SubscriptionEditor";

export default function HomePage() {
  // Steps: "upload" → "view"
  const [step, setStep] = useState("upload");
  const [fileData, setFileData] = useState(null);

  // const info = {
  //   brainResponse: {
  //     buyerCompanyName: "Athos Group, LLC",
  //     buyerCompanyAddress:
  //       "600 Las Colinas Blvd E Ste 550\nIrving, TX 75039-5634\nUnited States",
  //     buyerCompanyContactName: "Stan Prokarym",
  //     buyerCompanyContactEmail: "sprokarym@rollkall.com",
  //     scheduleItems: [
  //       {
  //         serviceTitle: "Subscription Services",
  //         serviceDescription: "October 21, 2024 - October 20, 2025",
  //         isSpecialCharge: false,
  //         serviceAmount: 1150000,
  //         startDate: "2024-07-21",
  //         endDate: "2024-10-20",
  //       },
  //       {
  //         serviceTitle: "Subscription Services",
  //         serviceDescription: "October 21, 2025 - October 20, 2026",
  //         isSpecialCharge: false,
  //         serviceAmount: 12000000,
  //         startDate: "2024-10-21",
  //         endDate: "2025-10-20",
  //       },
  //       {
  //         serviceTitle: "Subscription Services",
  //         serviceDescription: "October 21, 2025 - October 20, 2026",
  //         isSpecialCharge: false,
  //         serviceAmount: 12000000,
  //         startDate: "2025-10-21",
  //         endDate: "2026-10-20",
  //       },
  //       {
  //         serviceTitle: "Subscription Services",
  //         serviceDescription: "October 21, 2026 - October 20, 2027",
  //         isSpecialCharge: false,
  //         serviceAmount: 12500000,
  //         startDate: "2026-10-21",
  //         endDate: "2027-10-20",
  //       },
  //       {
  //         serviceTitle: "Subscription Services Added",
  //         serviceDescription: "Extra services",
  //         isSpecialCharge: false,
  //         serviceAmount: 1200000,
  //         startDate: "2027-05-21",
  //         endDate: "2027-10-20",
  //       },
  //       {
  //         serviceTitle: "One time fee",
  //         serviceDescription: "Implementation",
  //         isSpecialCharge: true,
  //         serviceAmount: 1000000,
  //         startDate: null,
  //         endDate: null,
  //       },
  //     ],
  //   },
  //   fileUrl: "ok",
  // };
  // const [step, setStep] = useState("view");
  // const [fileData, setFileData] = useState(info);

  const handleFileUploaded = async (data) => {
    console.log("HERE: ", data);
    setFileData(data);
    setStep("view");
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {step === "upload" && <Dropzone onFileUploaded={handleFileUploaded} />}
        {step === "view" && (
          <motion.div
            className="grid grid-cols-4 h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="col-span-2">
              <DocumentViewer fileUrl={fileData.fileUrl} />
            </div>
            <div className="col-span-2 bg-white flex items-center justify-center shadow-lg shadow-gray-300">
              <SubscriptionEditor brainResponse={fileData.brainResponse} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
