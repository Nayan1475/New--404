import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { TODAY_KEY, YESTERDAY_KEY, PREV_KEY } from '../data/mockData';
import { ActivityCategory } from '../types/tracker';
import { Search, Calendar, Filter, X } from 'lucide-react';

export const DateSelector: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    searchQuery,
    setSearchQuery,
    activeCategoryFilter,
    setActiveCategoryFilter,
  } = useTracker();

  const dates = [
    { key: TODAY_KEY, label: 'Today (Oct 20)' },
    { key: YESTERDAY_KEY, label: 'Yesterday (Oct 19)' },
    { key: PREV_KEY, label: 'Oct 18, 2026' },
  ];

  const categories: { key: ActivityCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All Activities' },
    { key: 'calls', label: 'Calls' },
    { key: 'messages', label: 'Messages' },
    { key: 'location', label: 'Location' },
    { key: 'connectivity', label: 'SIM & Hotspot' },
    { key: 'system', label: 'System & Apps' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Date Segmented Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-950/70 border border-slate-800/80 rounded-md overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 px-2 text-xs text-slate-500 font-mono shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Date:</span>
            </div>
            {dates.map((d) => {
              const isSelected = selectedDate === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => setSelectedDate(d.key)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-800 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 rounded">
            3-Day Rolling Window (Auto-Purge &gt; 72h)
          </span>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search phone logs, contacts, messages, apps..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-md pl-9 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-800/60 scrollbar-none">
        <span className="text-xs text-slate-500 flex items-center gap-1 mr-1 shrink-0">
          <Filter className="w-3 h-3" />
          <span>Category:</span>
        </span>
        {categories.map((cat) => {
          const isActive = activeCategoryFilter === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategoryFilter(cat.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
