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
    const skus = new Set(p1Data.map(row => row["Wayfair Listing"]).filter(Boolean));
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
      className="flex flex-col gap-2 w-full flex-1 min-h-0 h-full overflow-hidden"
    >
      {/* Top Controls: Stats, Tabs, Search, Export */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        {/* Stats */}
        <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
          <div className="flex items-center gap-2">
            <Table size={16} className="text-indigo-600" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">SKUs</span>
            <span className="text-lg font-black text-slate-900">{skuCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tags size={16} className="text-emerald-600" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">Maps</span>
            <span className="text-lg font-black text-slate-900">{p1Data.length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("p1")}
            className={cn(
              "px-4 py-1.5 rounded-lg font-black text-xs uppercase tracking-tighter transition-all",
              activeTab === "p1" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Product Attributes
          </button>
          <button
            onClick={() => setActiveTab("p2")}
            className={cn(
              "px-4 py-1.5 rounded-lg font-black text-xs uppercase tracking-tighter transition-all",
              activeTab === "p2" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Schema Tags
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search everything..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-indigo-400 focus:bg-white transition-all text-sm font-bold placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-primary py-2 px-6 text-sm">
            <Download size={18} />
            Export Results
          </button>
          <button
            onClick={onReset}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-slate-400 hover:text-red-500 bg-white"
            title="Start Over"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {activeTab === "p1" ? (
          <DataTable data={filteredP1} />
        ) : (
          <DataTable data={filteredP2} />
        )}
      </div>
    </motion.div>
  );
}
