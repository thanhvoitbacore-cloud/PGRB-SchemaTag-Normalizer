"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Wand2 } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import ResultsDashboard from "@/components/ResultsDashboard";
import { process1 } from "@/lib/normalization/process1";
import { process2 } from "@/lib/normalization/process2";
import { cn } from "@/lib/utils";

export default function Home() {
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState<{ p1: any[]; p2: any[] }>({ p1: [], p2: [] });

  const handleFileSelect = async (file: File) => {
    setStatus("processing");
    setProgress(10);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      setProgress(40);

      // Process 1
      const p1Results = process1(workbook);
      setProgress(70);

      // Process 2
      const p2Results = process2(workbook);
      setProgress(85);

      // --- ENRICHMENT LOGIC ---
      // Create a lookup map from p2 results using Extracted Tag ID
      const tagMap = new Map();
      p2Results.forEach(tag => {
        if (tag["Extracted Tag ID"]) {
          tagMap.set(tag["Extracted Tag ID"], tag);
        }
      });

      // Enrich p1Results with information from p2Results
      const enrichedP1 = p1Results.map(row => {
        const tagInfo = tagMap.get(row.Stagid);
        if (tagInfo) {
          return {
            ...row,
            "Tag Definition": tagInfo.Definition || "",
            "Input Type": tagInfo["Input Type"] || "",
            "Does schema show on site?": "",
            "SKU Type": ""
          };
        }
        return row;
      });

      setData({ p1: enrichedP1, p2: p2Results });
      setStatus("success");
      setProgress(100);
    } catch (error) {
      console.error("Processing failed:", error);
      alert("An error occurred while processing the file.");
      setStatus("error");
    }
  };

  const reset = () => {
    setStatus("idle");
    setData({ p1: [], p2: [] });
    setProgress(0);
  };

  return (
    <main className="max-w-full mx-auto px-4 py-2 flex flex-col h-[100dvh] overflow-hidden bg-slate-50">
      <header className="flex justify-between items-center gap-4 mb-2 shrink-0 h-12">
        <div className="flex items-center gap-3">
          <Wand2 size={24} className="text-indigo-600 shrink-0" />
          <h1 className="text-xl font-black tracking-tighter text-slate-900">
            PGRB <span className="text-indigo-600">SchemaTags</span> <span className="text-slate-400 font-medium italic text-sm">Normalizer</span>
          </h1>
        </div>
        <div className={cn(
          "px-4 py-1 rounded-full text-[10px] font-black border-2 uppercase tracking-widest",
          status === "idle" && "border-slate-200 text-slate-400 bg-white",
          status === "processing" && "border-indigo-200 text-indigo-600 bg-indigo-50 animate-pulse",
          status === "success" && "border-emerald-200 text-emerald-600 bg-emerald-50",
          status === "error" && "border-red-200 text-red-600 bg-red-50"
        )}>
          {status}
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col items-stretch min-h-0">
        {status === "idle" && (
          <div className="w-full max-w-xl py-20 flex-1 flex flex-col justify-center mx-auto">
            <FileUploader onFileSelect={handleFileSelect} isProcessing={false} />
          </div>
        )}

        {status === "processing" && (
          <div className="w-full max-w-md text-center py-20 flex-1 flex flex-col justify-center mx-auto">
            <div className="w-full bg-slate-200 rounded-full h-3 mb-6 overflow-hidden border border-slate-300/50">
              <div 
                className="h-full bg-primary-gradient transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-600 text-lg font-bold mb-1">Processing Data...</p>
            <p className="text-slate-400 text-sm uppercase tracking-widest font-black">{progress}% Complete</p>
          </div>
        )}

        {status === "success" && (
          <div className="w-full flex-1 min-h-0 overflow-hidden">
            <ResultsDashboard 
              p1Data={data.p1} 
              p2Data={data.p2} 
              onReset={reset} 
            />
          </div>
        )}
      </div>

      <footer className="mt-2 py-2 border-t border-slate-200 flex justify-between items-center gap-4 text-slate-400 shrink-0 h-8">
        <p className="text-[10px] font-bold">&copy; 2024 PGRB Tools Ecosystem</p>
        <p className="text-[8px] uppercase tracking-[0.2em] opacity-60 font-black">Precision • Accuracy • Performance</p>
      </footer>
    </main>
  );
}

