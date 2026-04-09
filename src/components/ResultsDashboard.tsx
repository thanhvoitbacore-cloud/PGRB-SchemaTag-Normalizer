"use client";

import React, { useState, useMemo } from "react";
import { Download, RotateCcw, Search, Table, Tags } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DataTable from "./DataTable";
import { exportToExcel } from "@/lib/excel-utils";
import { cn } from "@/lib/utils";

interface ResultsDashboardProps {
  p1Data: any[];
  p2Data: any[];
  onReset: () => void;
}

export default function ResultsDashboard({ p1Data, p2Data, onReset }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"p1" | "p2">("p1");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredP1 = useMemo(() => {
    if (!searchTerm) return p1Data;
    const lowSearch = searchTerm.toLowerCase();
    return p1Data.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(lowSearch))
    );
  }, [p1Data, searchTerm]);

  const filteredP2 = useMemo(() => {
    if (!searchTerm) return p2Data;
    const lowSearch = searchTerm.toLowerCase();
    return p2Data.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(lowSearch))
    );
  }, [p2Data, searchTerm]);

  const skuCount = useMemo(() => {
    const skus = new Set(p1Data.map(row => row["PrSKU (Wayfair Listing)"]).filter(Boolean));
    return skus.size;
  }, [p1Data]);

  const handleExport = () => {
    exportToExcel({
      "Product Attributes": p1Data,
      "Schema Tags Reference": p2Data,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-6 w-full flex-1 min-h-0 overflow-hidden"
    >
      {/* Top Banner: Mini Result Stats */}
      <div className="flex flex-wrap gap-4 shrink-0">
        <div className="flex items-center gap-4 bg-indigo-500/10 border-2 border-indigo-500/20 px-6 py-4 rounded-[2rem] glass shadow-lg">
          <div className="bg-indigo-500/20 p-3 rounded-2xl">
            <Table size={24} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Total Unique SKUs</p>
            <p className="text-3xl font-black text-white leading-none tracking-tighter">{skuCount}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-emerald-500/10 border-2 border-emerald-500/20 px-6 py-4 rounded-[2rem] glass shadow-lg">
          <div className="bg-emerald-500/20 p-3 rounded-2xl">
            <Tags size={24} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black mb-1">Total Mappings</p>
            <p className="text-3xl font-black text-white leading-none tracking-tighter">{p1Data.length}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
        <div className="flex bg-slate-900/80 p-1.5 rounded-[1.5rem] glass w-full xl:w-auto shadow-2xl">
          <button
            onClick={() => setActiveTab("p1")}
            className={cn(
              "flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-[1.2rem] font-black transition-all text-sm uppercase tracking-tighter",
              activeTab === "p1" ? "bg-white/10 text-white shadow-lg ring-1 ring-white/10" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Table size={20} />
            <span>Product Attributes</span>
          </button>
          <button
            onClick={() => setActiveTab("p2")}
            className={cn(
              "flex-1 xl:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-[1.2rem] font-black transition-all text-sm uppercase tracking-tighter",
              activeTab === "p2" ? "bg-white/10 text-white shadow-lg ring-1 ring-white/10" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Tags size={20} />
            <span>Schema Tags</span>
          </button>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          <button onClick={handleExport} className="btn-primary flex-1 xl:flex-none py-3 px-10 text-lg tracking-tighter rounded-2xl">
            <Download size={24} />
            Export Complete Dataset
          </button>
          <button
            onClick={onReset}
            className="p-3 rounded-2xl border-2 border-white/5 hover:bg-white/5 transition-all text-slate-500 hover:text-white glass group shadow-xl"
            title="Start Over"
          >
            <RotateCcw size={24} className="group-hover:rotate-[-90deg] transition-transform duration-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center shrink-0">
        <div className="text-lg text-slate-400 font-bold tracking-tight flex items-center gap-3 bg-white/5 px-6 py-3 rounded-[1.5rem] border border-white/5 shadow-inner">
          <span className="w-3 h-3 rounded-full bg-accent animate-ping" />
          Viewing <span className="text-white font-black">{activeTab === "p1" ? filteredP1.length : filteredP2.length}</span> results
        </div>
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-colors" size={24} />
          <input
            type="text"
            placeholder="Global search..."
            className="w-full bg-slate-900/90 border-2 border-white/5 rounded-[1.5rem] py-3 pl-16 pr-6 outline-none focus:border-accent/40 focus:bg-slate-950 transition-all text-lg font-bold glass shadow-2xl placeholder:text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-slate-900/40 rounded-[2.5rem] border border-white/5 shadow-inner">
        {activeTab === "p1" ? (
          <DataTable data={filteredP1} />
        ) : (
          <DataTable data={filteredP2} />
        )}
      </div>
    </motion.div>
  );
}
