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
    <main className="max-w-[94vw] mx-auto px-4 py-4 md:py-6 flex flex-col h-[100dvh] overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <Wand2 size={40} className="text-accent shrink-0" />
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
            PGRB <span className="text-indigo-400">SchemaTags</span> <span className="text-slate-500 font-extralight italic text-2xl">Normalizer</span>
          </h1>
        </div>
        <div className={cn(
          "px-6 py-2 rounded-xl text-sm font-black border-2 uppercase tracking-[0.2em] glass",
          status === "idle" && "border-white/5 text-slate-500",
          status === "processing" && "border-accent text-accent animate-pulse",
          status === "success" && "border-success text-success shadow-[0_0_30px_rgba(16,185,129,0.3)]",
          status === "error" && "border-error text-error"
        )}>
          {status}
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col items-stretch">
        {status === "idle" && (
          <div className="w-full max-w-2xl py-20 flex-1 flex flex-col justify-center mx-auto">
            <FileUploader onFileSelect={handleFileSelect} isProcessing={false} />
          </div>
        )}

        {status === "processing" && (
          <div className="w-full max-w-xl text-center py-40 flex-1 flex flex-col justify-center mx-auto">
            <div className="w-full bg-white/5 rounded-full h-4 mb-8 overflow-hidden border border-white/5">
              <div 
                className="h-full bg-primary-gradient shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-300 text-2xl font-semibold mb-3">Processing Data...</p>
            <p className="text-slate-500 text-xl uppercase tracking-widest font-bold">{progress}% Complete</p>
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

      <footer className="mt-4 py-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 shrink-0">
        <p className="text-base font-bold">&copy; 2024 PGRB Tools Ecosystem</p>
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40 font-black">Precision • Accuracy • Performance</p>
      </footer>
    </main>
  );
}

