"use client";

import React, { useState, useMemo } from "react";
import { Search, FilterX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DataTableProps {
  data: any[];
  limit?: number;
}

export default function DataTable({ data, limit = 1000 }: DataTableProps) {
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const headers = useMemo(() => (data.length > 0 ? Object.keys(data[0]) : []), [data]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return Object.entries(columnFilters).every(([key, value]) => {
        if (!value) return true;
        const cellValue = String(row[key] || "").toLowerCase();
        return cellValue.includes(value.toLowerCase());
      });
    });
  }, [data, columnFilters]);

  const displayData = useMemo(() => filteredData.slice(0, limit), [filteredData, limit]);

  const handleFilterChange = (header: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [header]: value,
    }));
  };

  const clearFilters = () => setColumnFilters({});

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 italic bg-slate-900/50 rounded-3xl border-2 border-dashed border-white/5 glass">
        <FilterX size={48} className="mb-4 opacity-20" />
        <p className="text-xl font-medium">No records match your criteria.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
      <div className="flex-1 w-full overflow-y-scroll overflow-x-auto h-full max-h-full">
        <table className="w-full border-collapse text-[11px] min-w-[2000px] table-fixed">
          <thead className="sticky top-0 z-20">
            {/* Row 1: Header Titles */}
            <tr className="bg-slate-50 border-b border-slate-200 shadow-sm">
              {headers.map((header) => (
                <th
                  key={`title-${header}`}
                  className="text-left px-4 py-2 text-indigo-700 font-black tracking-tighter uppercase text-[10px] align-bottom h-12"
                >
                  <div className="line-clamp-2" title={header}>
                    {header}
                  </div>
                </th>
              ))}
            </tr>
            {/* Row 2: Filter Inputs */}
            <tr className="bg-white">
              {headers.map((header) => (
                <th
                  key={`filter-${header}`}
                  className="px-2 py-1.5 border-b border-slate-100"
                >
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="text"
                      placeholder={`Filter...`}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg py-1.5 pl-8 pr-2 text-[10px] outline-none focus:border-indigo-300 focus:bg-white transition-all text-slate-700 font-bold placeholder:text-slate-300"
                      value={columnFilters[header] || ""}
                      onChange={(e) => handleFilterChange(header, e.target.value)}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                {headers.map((header) => (
                  <td
                    key={`${i}-${header}`}
                    className="px-4 py-2 text-slate-600 group-hover:text-slate-900 transition-colors"
                  >
                    <div className="max-w-[400px] truncate font-bold text-xs" title={String(row[header] || "")}>
                      {row[header] || <span className="text-slate-300 italic text-[10px]">empty</span>}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="p-20 text-center text-slate-300 italic text-xl font-medium">
                  No matching records found.
                </td>
              </tr>
            )}

            {filteredData.length > limit && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="p-4 text-center text-indigo-600 font-black bg-indigo-50 text-sm tracking-tighter"
                >
                  ... Showing first {limit} of {filteredData.length} records ...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
