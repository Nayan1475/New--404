import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { MessageSource } from '../types/tracker';
import {
  MessageSquare,
  Star,
  Trash2,
  Copy,
  Plus,
  ShieldCheck,
  Check,
  Search,
  Eye,
  Info,
  Lock,
  AlertTriangle,
  ShieldAlert,
  FileText,
} from 'lucide-react';

export const MessageTrackerView: React.FC = () => {
  const {
    messages,
    selectedDate,
    searchQuery,
    toggleStarMessage,
    deleteMessage,
    simulatePhoneDeletion,
    setIsSimulatorOpen,
    setInspectorItem,
    setIsForensicReportModalOpen,
  } = useTracker();

  const [sourceFilter, setSourceFilter] = useState<MessageSource | 'all'>('all');
  const [onlyStarred, setOnlyStarred] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredMessages = messages.filter((msg) => {
    if (msg.dateKey !== selectedDate) return false;
    if (sourceFilter !== 'all' && msg.source !== sourceFilter) return false;
    if (onlyStarred && !msg.isStarred) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inSender = msg.sender.toLowerCase().includes(q);
      const inHandle = msg.senderHandleOrNumber.toLowerCase().includes(q);
      const inPreview = msg.preview.toLowerCase().includes(q);
      if (!inSender && !inHandle && !inPreview) return false;
    }
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getSourceDetails = (source: MessageSource) => {
    switch (source) {
      case 'sms':
        return { label: 'SMS', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
      case 'whatsapp':
        return { label: 'WhatsApp', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
      case 'instagram':
        return { label: 'Instagram', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
      case 'snapchat':
        return { label: 'Snapchat', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
      case 'telegram':
        return { label: 'Telegram', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Messages & Chat Previews
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>SMS BroadcastReceiver & Notification Listener</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{filteredMessages.length} captured</span>
              <span aria-hidden="true">·</span>
              <span>Date: {selectedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsForensicReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/80 hover:bg-indigo-900/60 rounded-md transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate Message</span>
            </button>
          </div>
        </div>

        {/* Anti-Delete Immutable Guarantee Strip */}
        <div className="mb-4 p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-200">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Forensic Anti-Delete Active:</strong> Even if a user clears their chat or uses "Delete for Everyone" on WhatsApp, intercepted message text remains preserved here permanently.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            IMMUTABLE CHAT LOGS
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Source Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-md text-xs">
            <span className="px-2 text-slate-500">Source:</span>
            {(['all', 'sms', 'whatsapp', 'instagram', 'snapchat', 'telegram'] as const).map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src)}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  sourceFilter === src ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          {/* Starred filter button */}
          <button
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors ${
              onlyStarred
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Starred Only</span>
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      {filteredMessages.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg py-16 text-center">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-slate-300">No message notifications logged</div>
          <div className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Incoming SMS and social chat notifications from WhatsApp, Instagram, and Snapchat will be recorded here.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredMessages.map((msg) => {
            const src = getSourceDetails(msg.source);
            return (
              <div
                key={msg.id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-mono font-medium ${src.color}`}>
                          {src.label}
                        </span>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <span className="font-mono text-xs tabular-nums text-slate-400">
                          {msg.timeFormatted}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        {msg.sender}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {msg.senderHandleOrNumber}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleStarMessage(msg.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        title={msg.isStarred ? 'Unstar' : 'Star message'}
                      >
                        <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => simulatePhoneDeletion('message', msg.id)}
                        className="p-1.5 rounded text-rose-400 hover:text-white hover:bg-rose-950/60 transition-colors"
                        title="Anti-Delete Test: Simulates user deleting this chat from WhatsApp/SMS. Notice it remains preserved permanently here."
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      </button>
                    </div>
                  </div>

                  {/* Phone Deletion Alert Banner if erased on device */}
                  {msg.deletedOnPhone && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>DELETED ON DEVICE ({msg.deletedOnPhoneAt || 'Preserved'}) · Retained in Vault</span>
                    </div>
                  )}

                  {/* Message Preview Body */}
                  <div className="p-3 rounded bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed break-words font-sans">
                    {msg.preview}
                  </div>
                </div>

                {/* Footer metadata */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/60 text-[11px] text-slate-500">
                  <span className="font-mono truncate max-w-[140px] sm:max-w-none">
                    via {msg.capturedVia}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectorItem({ type: 'message', data: msg })}
                      className="px-2 py-1 text-[11px] font-medium text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/80 rounded transition-colors flex items-center gap-1"
                      title="Inspect Full Message Body & Notification Channel"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Full Message</span>
                    </button>
                    <button
                      onClick={() => handleCopy(msg.id, msg.fullMessageText || msg.preview)}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors p-1"
                      title="Copy full message text"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="hidden sm:inline">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Technical Feasibility & Android Permission Note */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-200">Technical Note on Social Media Message Capture:</span>
          <p>
            Standard SMS is intercepted via Android's <code className="text-indigo-300 font-mono">android.provider.Telephony.SMS_RECEIVED</code> broadcast receiver.
            For end-to-end encrypted apps (WhatsApp, Instagram, Snapchat), Android does not allow direct database access. Instead, the tracker uses <code className="text-indigo-300 font-mono">NotificationListenerService</code> to parse status-bar notification titles, sender entities, and message body snippets the moment they arrive.
          </p>
        </div>
      </div>
    </div>
  );
};
