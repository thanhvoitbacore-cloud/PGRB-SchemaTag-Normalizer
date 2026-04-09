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
      setProgress(90);

      setData({ p1: p1Results, p2: p2Results });
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
    <main className="max-w-[92vw] mx-auto px-6 py-6 md:py-8 flex flex-col h-screen overflow-hidden">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8 md:mb-10 shrink-0">
        <div className="flex items-center gap-6">
          <Wand2 size={64} className="text-accent shrink-0" />
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
            PGRB <span className="text-indigo-400">SchemaTags</span> <span className="text-slate-500 font-extralight italic">Normalizer</span>
          </h1>
        </div>
        <div className={cn(
          "px-10 py-4 rounded-2xl text-lg font-black border-2 uppercase tracking-[0.2em] glass",
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

      <footer className="mt-8 py-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 shrink-0">
        <p className="text-lg font-bold">&copy; 2024 PGRB Tools Ecosystem</p>
        <p className="text-sm uppercase tracking-widest opacity-50 font-black">Precision • Accuracy • Performance</p>
      </footer>
    </main>
  );
}

