"use client";

import React, { useCallback, useState } from "react";
import { CloudUpload, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export default function FileUploader({ onFileSelect, isProcessing }: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  }, []);

  const validateAndSelect = (file: File) => {
    if (!file.name.toLowerCase().includes("product attributes")) {
      alert('Invalid file name! The file must contain "Product Attributes".');
      return;
    }
    onFileSelect(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass rounded-[2rem] p-16 text-center transition-all duration-300",
        isDragOver ? "border-accent bg-slate-800/90 scale-[1.02]" : "hover:border-white/20"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".xlsx, .xls, .csv"
        onChange={handleFileChange}
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center">
        <motion.div
          animate={isProcessing ? { scale: [1, 1.1, 1], opacity: [1, 0.5, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 mb-8 text-accent flex items-center justify-center bg-primary-gradient rounded-full p-6 shadow-xl shadow-indigo-500/20"
        >
          <CloudUpload size={48} className="text-white" />
        </motion.div>

        <h2 className="text-3xl font-bold mb-3">Upload Product Attributes</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Drag and drop your Excel file here or click the button below to browse your devices
        </p>

        <label
          htmlFor="file-upload"
          className="btn-primary cursor-pointer inline-flex items-center gap-2"
        >
          <CloudUpload size={20} />
          Select File
        </label>

        <div className="mt-10 flex items-center gap-2 text-slate-500 text-sm justify-center">
          <Info size={16} />
          <span>File name must contain <strong>"Product Attributes"</strong></span>
        </div>
      </div>
    </motion.div>
  );
}
