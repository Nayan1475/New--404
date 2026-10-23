import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { UnifiedTimelineItem } from '../types/tracker';
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  MessageSquare,
  MessageCircle,
  MapPin,
  Navigation,
  DownloadCloud,
  Wifi,
  Radio,
  Unlock,
  AlertTriangle,
  Clock,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const TimelineView: React.FC = () => {
  const {
    timeline,
    selectedDate,
    searchQuery,
    activeCategoryFilter,
    deleteTimelineItem,
    setActiveTab,
    setInspectorItem,
    calls,
    messages,
  } = useTracker();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleInspectEvent = (item: UnifiedTimelineItem) => {
    if (item.category === 'calls') {
      const match = calls.find(
        (c) =>
          item.title.toLowerCase().includes(c.contactName.toLowerCase()) ||
          (c.phoneNumberOrHandle && item.description.includes(c.phoneNumberOrHandle))
      );
      if (match) {
        setInspectorItem({ type: 'call', data: match });
        return;
      }
    } else if (item.category === 'messages') {
      const match = messages.find(
        (m) =>
          item.title.toLowerCase().includes(m.sender.toLowerCase()) ||
          (m.preview && item.description.includes(m.preview.slice(0, 20)))
      );
      if (match) {
        setInspectorItem({ type: 'message', data: match });
        return;
      }
    }
    setInspectorItem({ type: 'timeline', data: item });
  };

  // Filter timeline items
  const filteredItems = timeline.filter((item) => {
    // Match date
    if (item.dateKey !== selectedDate) return false;
    // Match category
    if (activeCategoryFilter !== 'all' && item.category !== activeCategoryFilter) return false;
    // Match search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q);
      const inDesc = item.description.toLowerCase().includes(q);
      const inBadge = item.badge.toLowerCase().includes(q);
      if (!inTitle && !inDesc && !inBadge) return false;
    }
    return true;
  });

  const getEventIcon = (item: UnifiedTimelineItem) => {
    switch (item.iconName) {
      case 'PhoneIncoming':
        return <PhoneIncoming className="w-4 h-4 text-emerald-400" />;
      case 'PhoneOutgoing':
        return <PhoneOutgoing className="w-4 h-4 text-sky-400" />;
      case 'PhoneMissed':
        return <PhoneMissed className="w-4 h-4 text-rose-400" />;
      case 'MessageSquare':
        return <MessageSquare className="w-4 h-4 text-amber-400" />;
      case 'MessageCircle':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'MapPin':
      case 'Navigation':
        return <MapPin className="w-4 h-4 text-teal-400" />;
      case 'DownloadCloud':
        return <DownloadCloud className="w-4 h-4 text-indigo-400" />;
      case 'Wifi':
      case 'Radio':
        return <Wifi className="w-4 h-4 text-purple-400" />;
      case 'Unlock':
        return <Unlock className="w-4 h-4 text-blue-400" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'calls':
        return 'text-emerald-400 border-emerald-500/30';
      case 'messages':
        return 'text-amber-400 border-amber-500/30';
      case 'location':
        return 'text-teal-400 border-teal-500/30';
      case 'connectivity':
        return 'text-purple-400 border-purple-500/30';
      case 'system':
        return 'text-indigo-400 border-indigo-500/30';
      default:
        return 'text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            Daily Activity Timeline
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Chronological phone telemetry feed</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-slate-300">
              {filteredItems.length} events logged
            </span>
            <span aria-hidden="true">·</span>
            <span>Date: {selectedDate}</span>
          </div>
        </div>

        {/* Quick jump to detailed views */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('location')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span>Map View</span>
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors"
          >
            <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />
            <span>Call Details</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-slate-300">No activity logged for this query</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try switching the date filter, clearing search keywords, or simulate a live event using the top right button.
          </p>
        </div>
      ) : (
        /* Timeline Feed */
        <div className="relative pl-6 sm:pl-8 space-y-4 before:content-[''] before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
          {filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} className="relative group">
                {/* Timeline node dot */}
                <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:border-slate-500 transition-colors">
                  {getEventIcon(item)}
                </div>

                {/* Event Card */}
                <div
                  className={`bg-slate-950/70 border rounded-lg p-3.5 transition-all ${
                    item.severity === 'alert'
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : 'border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      {/* Meta header line: unboxed metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-slate-400 font-semibold tabular-nums">
                          {item.timeFormatted}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className={`font-mono text-[11px] capitalize ${getCategoryColor(item.category)}`}>
                          {item.badge}
                        </span>
                        {item.severity === 'alert' && (
                          <>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="text-rose-400 font-medium text-[11px] flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" />
                              Security Notice
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <div className="text-sm font-semibold text-slate-100 leading-snug">
                        {item.title}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Expanded extra info if clicked */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400 font-mono space-y-1 bg-slate-900/50 p-2.5 rounded">
                          <div><span className="text-slate-500">Event ID:</span> {item.id}</div>
                          <div><span className="text-slate-500">ISO Timestamp:</span> {item.timestamp}</div>
                          <div><span className="text-slate-500">Category:</span> {item.category}</div>
                          <div><span className="text-slate-500">Vault Storage:</span> Encrypted SQLite / AES-GCM</div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      <button
                        onClick={() => handleInspectEvent(item)}
                        className="px-2 py-1 rounded text-[11px] font-medium text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/80 transition-colors"
                        title="Inspect full details"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                        title={isExpanded ? 'Collapse' : 'Inspect raw telemetry'}
                      >
                        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                      <button
                        onClick={() => deleteTimelineItem(item.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
