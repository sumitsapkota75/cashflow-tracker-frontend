"use client";

import { AuthGuard } from "@/app/auth/authGuard";
import { useState, useMemo } from "react";

type Entry = {
  id: string;
  timestamp: string;
  machineIds: string[];
  cashAmount: number;
  safeDropped: number;
  reason: string;
  isShiftClose: boolean;
  payouts: string[];
  imageCount: number;
};

// Sample data - replace with actual API call
const sampleEntries: Entry[] = [
  {
    id: "1",
    timestamp: "2025-01-17T14:30:00",
    machineIds: ["M001", "M002"],
    cashAmount: 1250.50,
    safeDropped: 500.00,
    reason: "End of Shift",
    isShiftClose: true,
    payouts: ["1000", "previous winner", "250", "jackpot"],
    imageCount: 3
  },
  {
    id: "2",
    timestamp: "2025-01-17T10:15:00",
    machineIds: ["M003"],
    cashAmount: 750.00,
    safeDropped: 0,
    reason: "ATM Empty",
    isShiftClose: false,
    payouts: [],
    imageCount: 2
  },
  {
    id: "3",
    timestamp: "2025-01-16T22:45:00",
    machineIds: ["M001", "M002", "M003", "M004", "M005"],
    cashAmount: 3450.75,
    safeDropped: 1500.00,
    reason: "End of Shift",
    isShiftClose: true,
    payouts: ["500", "bonus payout"],
    imageCount: 5
  },
  {
    id: "4",
    timestamp: "2025-01-16T16:20:00",
    machineIds: ["M004"],
    cashAmount: 450.00,
    safeDropped: 200.00,
    reason: "Payout",
    isShiftClose: false,
    payouts: ["450", "customer request"],
    imageCount: 1
  },
  {
    id: "5",
    timestamp: "2025-01-15T18:30:00",
    machineIds: ["M002", "M005"],
    cashAmount: 1100.00,
    safeDropped: 600.00,
    reason: "Maintenance",
    isShiftClose: false,
    payouts: [],
    imageCount: 4
  },
  {
    id: "6",
    timestamp: "2025-01-15T12:15:00",
    machineIds: ["M001"],
    cashAmount: 320.00,
    safeDropped: 150.00,
    reason: "ATM Empty",
    isShiftClose: false,
    payouts: [],
    imageCount: 2
  },
  {
    id: "7",
    timestamp: "2025-01-14T20:30:00",
    machineIds: ["M003", "M004"],
    cashAmount: 2100.00,
    safeDropped: 900.00,
    reason: "End of Shift",
    isShiftClose: true,
    payouts: ["750", "weekly bonus"],
    imageCount: 3
  },
  {
    id: "8",
    timestamp: "2025-01-14T15:45:00",
    machineIds: ["M005"],
    cashAmount: 580.00,
    safeDropped: 0,
    reason: "Customer Request",
    isShiftClose: false,
    payouts: ["580", "refund"],
    imageCount: 1
  },
];

export default function Reports() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    entryType: "all", // "all" | "shift-close" | "regular"
    quickFilter: "" // "today" | "yesterday" | "this-week" | "this-month"
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const machines = [
    { id: "M001", name: "Machine 1 - Lobby" },
    { id: "M002", name: "Machine 2 - Back Room" },
    { id: "M003", name: "Machine 3 - Front Counter" },
    { id: "M004", name: "Machine 4 - Side Entrance" },
    { id: "M005", name: "Machine 5 - Main Floor" },
  ];

  const getMachineName = (id: string) => {
    return machines.find(m => m.id === id)?.name || id;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const applyQuickFilter = (quickFilter: string) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (quickFilter) {
      case "today":
        start = new Date();
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        start = new Date();
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "this-week":
        const dayOfWeek = now.getDay();
        start = new Date();
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case "this-month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return;
    }

    setFilters({
      ...filters,
      quickFilter,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => {
    return sampleEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp);
      
      // Date range filter
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        if (entryDate < start) return false;
      }
      
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (entryDate > end) return false;
      }
      
      // Entry type filter
      if (filters.entryType === "shift-close" && !entry.isShiftClose) return false;
      if (filters.entryType === "regular" && entry.isShiftClose) return false;
      
      return true;
    });
  }, [filters]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

  // Calculate totals from filtered entries
  const totalCash = filteredEntries.reduce((sum, entry) => sum + entry.cashAmount, 0);
  const totalSafeDropped = filteredEntries.reduce((sum, entry) => sum + entry.safeDropped, 0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  /* 
  // When integrating with your API, replace the sampleEntries with this:
  
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: filters.startDate,
            endDate: filters.endDate,
            entryType: filters.entryType,
            page: currentPage,
            limit: itemsPerPage
          })
        });
        const data = await response.json();
        setEntries(data.entries);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEntries();
  }, [filters, currentPage]);
  */

  return (
    <AuthGuard allowedRoles={["OWNER", "MANAGER"]}>
    <div className="bg-gradient-to-b from-emerald-500/5 to-transparent min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-800">Reports</h2>
          <p className="text-slate-600 mt-2">View and filter all machine entries</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Filters</h3>
          
          {/* Quick Filters */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Quick Filters
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyQuickFilter("today")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filters.quickFilter === "today"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => applyQuickFilter("yesterday")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filters.quickFilter === "yesterday"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={() => applyQuickFilter("this-week")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filters.quickFilter === "this-week"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => applyQuickFilter("this-month")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filters.quickFilter === "this-month"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                This Month
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => {
                  setFilters({ ...filters, startDate: e.target.value, quickFilter: "" });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => {
                  setFilters({ ...filters, endDate: e.target.value, quickFilter: "" });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Entry Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Entry Type
              </label>
              <select
                value={filters.entryType}
                onChange={(e) => {
                  setFilters({ ...filters, entryType: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="all">All Entries</option>
                <option value="shift-close">Shift Close Only</option>
                <option value="regular">Regular Entries</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.startDate || filters.endDate || filters.entryType !== "all" || filters.quickFilter) && (
            <button
              onClick={() => {
                setFilters({ startDate: "", endDate: "", entryType: "all", quickFilter: "" });
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Total Entries</h3>
            <p className="text-3xl font-bold text-blue-600">{filteredEntries.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Total Cash</h3>
            <p className="text-3xl font-bold text-green-600">${totalCash.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-cyan-500">
            <h3 className="text-sm font-semibold text-slate-500 uppercase mb-2">Total Safe Dropped</h3>
            <p className="text-3xl font-bold text-cyan-600">${totalSafeDropped.toFixed(2)}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b-2 border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Machine(s)</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Cash Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Safe Dropped</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Payouts</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Images</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      No entries found matching your filters
                    </td>
                  </tr>
                ) : (
                  paginatedEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                        {formatDate(entry.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        <div className="flex flex-wrap gap-1">
                          {entry.machineIds.map(id => (
                            <span key={id} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {getMachineName(id)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600 whitespace-nowrap">
                        ${entry.cashAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                        ${entry.safeDropped.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {entry.reason}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {entry.isShiftClose ? (
                          <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Shift Close
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                            Regular
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {entry.payouts.length > 0 ? (
                          <span className="text-blue-600 font-medium">
                            {entry.payouts.length / 2} payout(s)
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {entry.imageCount > 0 ? (
                          <span className="flex items-center gap-1 text-slate-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {entry.imageCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length} entries
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 py-2 text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}