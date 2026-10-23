import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { CallChannel, CallType } from '../types/tracker';
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  PhoneOff,
  Video,
  Phone,
  Clock,
  Trash2,
  Plus,
  ShieldCheck,
  Eye,
  Info,
  Lock,
  AlertTriangle,
  ShieldAlert,
  FileText,
} from 'lucide-react';

export const CallLoggerView: React.FC = () => {
  const {
    calls,
    selectedDate,
    searchQuery,
    deleteCall,
    simulatePhoneDeletion,
    setIsSimulatorOpen,
    setInspectorItem,
    setIsForensicReportModalOpen,
  } = useTracker();

  const [channelFilter, setChannelFilter] = useState<CallChannel | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CallType | 'all'>('all');

  const filteredCalls = calls.filter((call) => {
    if (call.dateKey !== selectedDate) return false;
    if (channelFilter !== 'all' && call.channel !== channelFilter) return false;
    if (typeFilter !== 'all' && call.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = call.contactName.toLowerCase().includes(q);
      const inHandle = call.phoneNumberOrHandle.toLowerCase().includes(q);
      const inNotes = call.notes?.toLowerCase().includes(q) ?? false;
      if (!inName && !inHandle && !inNotes) return false;
    }
    return true;
  });

  // Analytics for the day
  const totalCalls = filteredCalls.length;
  const totalDurationSeconds = filteredCalls.reduce((acc, c) => acc + c.durationSeconds, 0);
  const totalDurationMinutes = Math.floor(totalDurationSeconds / 60);
  const missedCalls = filteredCalls.filter((c) => c.type === 'missed').length;
  const appCalls = filteredCalls.filter((c) => c.channel !== 'cellular').length;

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const getCallTypeIcon = (type: CallType) => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />;
      case 'outgoing':
        return <PhoneOutgoing className="w-3.5 h-3.5 text-sky-400" />;
      case 'missed':
        return <PhoneMissed className="w-3.5 h-3.5 text-rose-400" />;
      case 'rejected':
        return <PhoneOff className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getChannelBadge = (channel: CallChannel) => {
    switch (channel) {
      case 'cellular':
        return <span className="text-slate-400 font-mono text-[11px]">Cellular (SIM)</span>;
      case 'whatsapp':
        return <span className="text-emerald-400 font-mono text-[11px]">WhatsApp</span>;
      case 'instagram':
        return <span className="text-purple-400 font-mono text-[11px]">Instagram</span>;
      case 'telegram':
        return <span className="text-sky-400 font-mono text-[11px]">Telegram</span>;
      case 'messenger':
        return <span className="text-blue-400 font-mono text-[11px]">Messenger</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Analytics KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400">Total Calls Logged</div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums mt-0.5">
            {totalCalls}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Normal & Social App calls</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400">Total Talk Time</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
            {totalDurationMinutes}m {totalDurationSeconds % 60}s
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total active airtime</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400">Missed / Unanswered</div>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums mt-0.5">
            {missedCalls}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Captured with timestamps</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
          <div className="text-xs text-slate-400">Internet App Calls</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono tabular-nums mt-0.5">
            {appCalls}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Via Notification & Accessibility</div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Call Log Telemetry
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Android CallLog Provider & Notification Listener</span>
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
              <span>Simulate Call</span>
            </button>
          </div>
        </div>

        {/* Anti-Delete Immutable Guarantee Strip */}
        <div className="mb-4 p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-200">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Forensic Anti-Delete Active:</strong> Any call erased from phone dialer or WhatsApp is permanently preserved in this vault with cryptographic integrity.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            WORM VAULT
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-slate-800/60">
          {/* Channel selector */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-md text-xs">
            <span className="px-2 text-slate-500">Channel:</span>
            {(['all', 'cellular', 'whatsapp', 'instagram', 'telegram'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  channelFilter === ch ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Type selector */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-md text-xs">
            <span className="px-2 text-slate-500">Type:</span>
            {(['all', 'incoming', 'outgoing', 'missed'] as const).map((tp) => (
              <button
                key={tp}
                onClick={() => setTypeFilter(tp)}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  typeFilter === tp ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>

        {/* Table / High density records */}
        {filteredCalls.length === 0 ? (
          <div className="py-12 text-center">
            <Phone className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-slate-300">No call logs found for this filter</div>
            <div className="text-xs text-slate-500 mt-1">Try selecting another channel or simulate a call.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2.5 px-3 font-medium">Type</th>
                  <th className="py-2.5 px-3 font-medium">Contact / Number</th>
                  <th className="py-2.5 px-3 font-medium">Channel</th>
                  <th className="py-2.5 px-3 font-medium">Media</th>
                  <th className="py-2.5 px-3 font-medium">Duration</th>
                  <th className="py-2.5 px-3 font-medium">Time</th>
                  <th className="py-2.5 px-3 font-medium">Detection Source</th>
                  <th className="py-2.5 px-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 capitalize font-medium text-slate-200">
                        {getCallTypeIcon(call.type)}
                        <span>{call.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-100">{call.contactName}</span>
                        {call.channel === 'whatsapp' && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            WhatsApp Verified
                          </span>
                        )}
                        {call.deletedOnPhone && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                            Phone Deleted ({call.deletedOnPhoneAt || 'Preserved'})
                          </span>
                        )}
                      </div>
                      {call.channel === 'whatsapp' ? (
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <span>{call.rawPhoneNumber || call.phoneNumberOrHandle}</span>
                          </span>
                          {call.whatsappJid && (
                            <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                              JID: {call.whatsappJid}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">{call.phoneNumberOrHandle}</div>
                      )}
                      {call.notes && (
                        <div className="text-[11px] text-slate-400 italic mt-0.5">{call.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {getChannelBadge(call.channel)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-slate-400 capitalize">
                        {call.callMedia === 'video' ? <Video className="w-3.5 h-3.5 text-indigo-400" /> : <Phone className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{call.callMedia}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium tabular-nums text-slate-200">
                      {formatDuration(call.durationSeconds)}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-400">
                      {call.timeFormatted}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      <span className="text-[11px] font-mono">
                        {call.channel === 'cellular'
                          ? 'Telephony CallLog API'
                          : 'NotificationListenerService'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectorItem({ type: 'call', data: call })}
                          className="px-2 py-1 text-[11px] font-medium text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/80 rounded transition-colors flex items-center gap-1"
                          title="View Full Call & Contact Details"
                        >
                          <Info className="w-3 h-3" />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                        <button
                          onClick={() => simulatePhoneDeletion('call', call.id)}
                          className="px-2 py-1 text-[11px] font-medium text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 rounded transition-colors flex items-center gap-1"
                          title="Anti-Delete Test: Simulates user erasing this call on their phone dialer. Notice it is never deleted here, but permanently archived."
                        >
                          <ShieldAlert className="w-3 h-3 text-rose-400" />
                          <span className="hidden sm:inline">{call.deletedOnPhone ? 'Preserved' : 'Simulate Phone Delete'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Technical Architecture Info Card */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-200">How Internet App Call Tracking Works:</span>
          <p>
            Android does not provide a standard public API for WhatsApp or Instagram call records. 
            This app utilizes Android’s <code className="text-indigo-300 font-mono">NotificationListenerService</code> combined with <code className="text-indigo-300 font-mono">AccessibilityService</code> to detect incoming call notification channels, calculate call answer and hang-up timestamps, and persist them securely into local device storage.
          </p>
        </div>
      </div>
    </div>
  );
};
