"use client";

import React, { useState, useMemo } from "react";
import { Search, FilterX } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center p-32 text-slate-400 italic bg-slate-900/50 rounded-3xl border-2 border-dashed border-white/5 glass">
        <FilterX size={48} className="mb-4 opacity-20" />
        <p className="text-xl font-medium">No records match your criteria.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
      {Object.keys(columnFilters).length > 0 && (
        <div className="flex justify-end shrink-0">
          <button 
            onClick={clearFilters}
            className="text-accent hover:text-accent/80 font-black flex items-center gap-3 text-xl transition-colors bg-white/5 px-8 py-3 rounded-2xl border border-white/5"
          >
            <FilterX size={28} />
            Clear all filters
          </button>
        </div>
      )}
      
      <div className="flex-1 w-full overflow-auto rounded-[2.5rem] border-2 border-white/5 glass relative shadow-[0_30px_60px_rgba(0,0,0,0.5)] custom-scrollbar min-h-[500px]">
        <table className="w-full border-collapse text-xl min-w-[1800px]">
          <thead className="sticky top-0 z-20">
            {/* Row 1: Header Titles */}
            <tr className="bg-slate-900 shadow-xl">
              {headers.map((header) => (
                <th
                  key={`title-${header}`}
                  className="text-left px-10 py-8 text-accent font-black tracking-tighter uppercase text-lg border-b border-white/5 align-bottom h-32"
                >
                  <div className="line-clamp-2" title={header}>
                    {header}
                  </div>
                </th>
              ))}
            </tr>
            {/* Row 2: Filter Inputs */}
            <tr className="bg-slate-900">
              {headers.map((header) => (
                <th
                  key={`filter-${header}`}
                  className="px-8 py-5 border-b-2 border-white/10"
                >
                  <div className="relative">
                    <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder={`Search...`}
                      className="w-full bg-slate-950/50 border-2 border-white/5 rounded-xl py-4 pl-12 pr-6 text-lg outline-none focus:border-accent focus:bg-slate-950 transition-all text-white font-bold placeholder:text-slate-700"
                      value={columnFilters[header] || ""}
                      onChange={(e) => handleFilterChange(header, e.target.value)}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-slate-950/20">
            {displayData.map((row, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group">
                {headers.map((header) => (
                  <td
                    key={`${i}-${header}`}
                    className="px-10 py-7 text-slate-200 group-hover:text-white transition-colors"
                  >
                    <div className="max-w-[500px] truncate font-bold" title={String(row[header] || "")}>
                      {row[header] || <span className="text-slate-800 italic text-base">null</span>}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
            
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="p-40 text-center text-slate-600 italic text-3xl font-light">
                  No matching records found for these filters.
                </td>
              </tr>
            )}

            {filteredData.length > limit && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="p-16 text-center text-accent font-black bg-white/5 text-3xl tracking-tighter shadow-inner"
                >
                  ... and {filteredData.length - limit} more matching records (Export All Results to see all) ...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
