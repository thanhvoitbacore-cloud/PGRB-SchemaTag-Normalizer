"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Search, FilterX, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DataTableProps {
  data: any[];
  limit?: number;
}

const ROW_HEIGHT = 36; // Estimated row height in pixels
const BUFFER = 15;    // Number of extra rows to render above/below viewport

export default function DataTable({ data }: DataTableProps) {
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [selectedCell, setSelectedCell] = useState<{ header: string; value: string } | null>(null);
  
  // Virtualization state
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Handle scroll event for virtualization
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Update container height on resize
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
      
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  // Calculate visible range
  // Note: The headers take some height (approx 84px), but the sticky header 
  // stays inside the container so the scrollTop remains 0-based for the content.
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const endIndex = Math.min(filteredData.length, Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER);

  const visibleRows = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);

  const paddingTop = startIndex * ROW_HEIGHT;
  const paddingBottom = Math.max(0, (filteredData.length - endIndex) * ROW_HEIGHT);

  const handleFilterChange = (header: string, value: string) => {
    setColumnFilters((prev) => ({
      ...prev,
      [header]: value,
    }));
    // Reset scroll to top when filtering
    if (containerRef.current) containerRef.current.scrollTop = 0;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400 italic bg-slate-900/50 rounded-3xl border-2 border-dashed border-white/5 glass">
        <FilterX size={48} className="mb-4 opacity-20" />
        <p className="text-xl font-medium">No records match your criteria.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
      <div 
        ref={containerRef}
        onScroll={onScroll}
        className="absolute inset-0 overflow-auto scroll-smooth"
      >
        <table className="w-full border-separate border-spacing-0 text-[11px] min-w-[2000px] table-fixed">
          <thead className="sticky top-0 z-20">
            {/* Row 1: Header Titles */}
            <tr className="bg-slate-50 shadow-sm">
              {headers.map((header) => (
                <th
                  key={`title-${header}`}
                  className="text-left px-4 py-2 text-indigo-700 font-black tracking-tighter uppercase text-[10px] align-bottom h-12 border-b border-slate-200 bg-slate-50"
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
                  className="px-2 py-1.5 border-b border-slate-200 bg-white"
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
          <tbody>
            {/* Top Spacer */}
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} colSpan={headers.length} />
              </tr>
            )}
            
            {/* Visible Rows */}
            {visibleRows.map((row, relativeIndex) => {
              const actualIndex = startIndex + relativeIndex;
              return (
                <tr 
                  key={actualIndex} 
                  className="hover:bg-slate-50/80 transition-colors group h-[36px]"
                >
                  {headers.map((header) => (
                    <td
                      key={`${actualIndex}-${header}`}
                      className="px-4 py-2 text-slate-600 group-hover:text-slate-900 transition-colors border-b border-slate-100"
                    >
                      <div 
                        className="w-full truncate font-bold text-xs cursor-pointer hover:text-indigo-600 hover:underline" 
                        title="Click to view full content"
                        onClick={() => setSelectedCell({ header, value: String(row[header] || "") })}
                      >
                        {row[header] || <span className="text-slate-300 italic text-[10px]">empty</span>}
                      </div>
                    </td>
                  ))}
                </tr>
              );
            })}

            {/* Bottom Spacer */}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} colSpan={headers.length} />
              </tr>
            )}
            
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="p-20 text-center text-slate-300 italic text-xl font-medium">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Full Content Modal */}
      <AnimatePresence>
        {selectedCell && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCell(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[70vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-indigo-700 font-black uppercase tracking-tighter text-sm">{selectedCell.header}</h3>
                <button 
                  onClick={() => setSelectedCell(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-8">
                <div className="text-slate-700 text-lg font-medium leading-relaxed whitespace-pre-wrap break-words">
                  {selectedCell.value || <span className="text-slate-300 italic font-normal">Empty cell</span>}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button 
                  onClick={() => setSelectedCell(null)}
                  className="px-6 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl font-black text-xs uppercase tracking-widest transition-all text-slate-600 shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
