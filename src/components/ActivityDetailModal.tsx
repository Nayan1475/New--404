import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  X,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Video,
  MessageSquare,
  Copy,
  Check,
  Star,
  ShieldCheck,
  Radio,
  Clock,
  Layers,
  Smartphone,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const ActivityDetailModal: React.FC = () => {
  const { inspectorItem, setInspectorItem, toggleStarMessage } = useTracker();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!inspectorItem) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '0 seconds (Missed / Unanswered)';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} minute${m !== 1 ? 's' : ''} ${s} second${s !== 1 ? 's' : ''} (${seconds}s total)`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              {inspectorItem.type === 'call' ? (
                <Phone className="w-4 h-4" />
              ) : inspectorItem.type === 'message' ? (
                <MessageSquare className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                {inspectorItem.type === 'call'
                  ? 'Call Telemetry & Contact Inspector'
                  : inspectorItem.type === 'message'
                  ? 'Message & Notification Body Inspector'
                  : 'Event Forensics'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Hardware-backed Local Vault Decrypted View
              </div>
            </div>
          </div>

          <button
            onClick={() => setInspectorItem(null)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* CALL DETAILS */}
          {inspectorItem.type === 'call' && (() => {
            const call = inspectorItem.data;
            return (
              <div className="space-y-4">
                {/* Contact Card Header */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{call.contactName}</span>
                      <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 capitalize">
                        {call.type} Call
                      </span>
                    </div>
                    <div className="text-sm font-mono text-slate-300 font-semibold">
                      {call.phoneNumberOrHandle}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Channel: <strong className="text-slate-200 capitalize">{call.channel}</strong></span>
                      <span>·</span>
                      <span>Media: <strong className="text-slate-200 capitalize">{call.callMedia}</strong></span>
                      {call.carrier && (
                        <>
                          <span>·</span>
                          <span>Network: <strong className="text-slate-200">{call.carrier}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy('phone', call.phoneNumberOrHandle)}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      {copiedSection === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'phone' ? 'Copied' : 'Copy Number'}</span>
                    </button>
                  </div>
                </div>

                {/* Dedicated WhatsApp Verified Phone Number & JID Extraction Card */}
                {call.channel === 'whatsapp' && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/40 shadow-lg space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-emerald-500/25">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold font-mono text-xs">
                          WA
                        </div>
                        <div>
                          <div className="font-semibold text-emerald-300 text-xs flex items-center gap-2">
                            <span>WhatsApp VoIP Verified Phone Number</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              ACTIVE JID
                            </span>
                          </div>
                          <div className="text-[10px] text-emerald-400/80">
                            NotificationListener + Android ContactsContract JID Extraction
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                      <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-500/25 space-y-1">
                        <span className="text-[10px] text-slate-400 block font-sans">
                          WhatsApp Mobile Number (E.164):
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-emerald-300 tracking-wide">
                            {call.rawPhoneNumber || call.phoneNumberOrHandle}
                          </span>
                          <button
                            onClick={() => handleCopy('wa_phone', call.rawPhoneNumber || call.phoneNumberOrHandle)}
                            className="p-1 rounded text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                            title="Copy Phone Number"
                          >
                            {copiedSection === 'wa_phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-500/25 space-y-1">
                        <span className="text-[10px] text-slate-400 block font-sans">
                          WhatsApp JID Identifier:
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-200 truncate block">
                            {call.whatsappJid || `${(call.rawPhoneNumber || call.phoneNumberOrHandle).replace(/[^0-9]/g, '')}@s.whatsapp.net`}
                          </span>
                          <button
                            onClick={() => handleCopy('wa_jid', call.whatsappJid || `${(call.rawPhoneNumber || call.phoneNumberOrHandle).replace(/[^0-9]/g, '')}@s.whatsapp.net`)}
                            className="p-1 rounded text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                            title="Copy WhatsApp JID"
                          >
                            {copiedSection === 'wa_jid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-emerald-200/90 leading-relaxed font-sans bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
                      <strong>How Number Resolution Works:</strong> When WhatsApp receives a voice/video call, the notification contains the caller handle. PhonePulse automatically queries <code className="text-emerald-300 font-mono">ContactsContract.RawContacts</code> against the WhatsApp sync directory (<code className="text-emerald-300 font-mono">vnd.android.cursor.item/vnd.com.whatsapp.profile</code>) to retrieve the authentic international mobile number.
                    </div>
                  </div>
                )}

                {/* Technical Call Parameters */}
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 font-mono space-y-2.5">
                  <div className="text-xs font-semibold font-sans text-slate-300 border-b border-slate-800 pb-2">
                    Call Timing &amp; Audio Telemetry
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Exact Time of Call:</span>
                    <span className="text-slate-200 tabular-nums">{call.timeFormatted} ({call.dateKey})</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Call Airtime Duration:</span>
                    <span className="text-emerald-400 font-bold tabular-nums">{formatDuration(call.durationSeconds)}</span>
                  </div>
                  {call.simSlot && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Active SIM Slot:</span>
                      <span className="text-indigo-400">SIM Slot {call.simSlot} ({call.carrier})</span>
                    </div>
                  )}
                  {call.codec && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Audio Codec:</span>
                      <span className="text-slate-300">{call.codec}</span>
                    </div>
                  )}
                  {call.towerId && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Cell Tower Handover:</span>
                      <span className="text-slate-300">{call.towerId}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Detection Mechanism:</span>
                    <span className="text-slate-400">
                      {call.channel === 'cellular'
                        ? 'android.provider.CallLog.Calls'
                        : 'NotificationListenerService + AccessibilityState'}
                    </span>
                  </div>
                </div>

                {/* Notes & Summary */}
                {call.notes && (
                  <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/80 space-y-1.5">
                    <div className="font-semibold text-slate-300">Call Notes &amp; Conversation Log:</div>
                    <p className="text-slate-400 leading-relaxed font-sans">{call.notes}</p>
                    {call.conversationSnippet && (
                      <p className="text-slate-300 italic pt-1 border-t border-slate-800/60">
                        &quot;{call.conversationSnippet}&quot;
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* MESSAGE & NOTIFICATION DETAILS */}
          {inspectorItem.type === 'message' && (() => {
            const msg = inspectorItem.data;
            const fullText = msg.fullMessageText || msg.preview;
            return (
              <div className="space-y-4">
                {/* Sender Card Header */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">{msg.sender}</span>
                      <span className="text-xs font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 capitalize">
                        {msg.source}
                      </span>
                    </div>
                    <div className="text-sm font-mono text-slate-300 font-semibold">
                      {msg.senderHandleOrNumber}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Captured at <span className="font-mono text-slate-300">{msg.timeFormatted}</span> · {msg.dateKey}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleStarMessage(msg.id)}
                      className={`p-2 rounded-md border transition-colors ${
                        msg.isStarred
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title="Star this message"
                    >
                      <Star className={`w-4 h-4 ${msg.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleCopy('message_body', fullText)}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors"
                    >
                      {copiedSection === 'message_body' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'message_body' ? 'Copied' : 'Copy Full Text'}</span>
                    </button>
                  </div>
                </div>

                {/* Full Unabridged Message Text */}
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-xs">
                    <span className="font-semibold text-slate-200">Full Unabridged Message Text:</span>
                    <span className="font-mono text-[11px]">
                      {fullText.length} characters · {fullText.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </div>
                  <div className="text-slate-100 text-sm leading-relaxed p-3 rounded bg-slate-900/80 border border-slate-800 select-text whitespace-pre-wrap font-sans">
                    {fullText}
                  </div>
                </div>

                {/* Android Notification Metadata & Channel Details */}
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 font-mono space-y-2">
                  <div className="text-xs font-semibold font-sans text-slate-300 border-b border-slate-800 pb-2 flex items-center justify-between">
                    <span>Notification System Forensics</span>
                    <span className="text-[11px] text-emerald-400">Decrypted</span>
                  </div>
                  {msg.notificationTitle && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Notification Title:</span>
                      <span className="text-slate-200">{msg.notificationTitle}</span>
                    </div>
                  )}
                  {msg.notificationSubtext && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Notification Subtext:</span>
                      <span className="text-slate-300">{msg.notificationSubtext}</span>
                    </div>
                  )}
                  {msg.packageName && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Android Package ID:</span>
                      <span className="text-indigo-400">{msg.packageName}</span>
                    </div>
                  )}
                  {msg.notificationChannelId && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500">Channel Identifier:</span>
                      <span className="text-slate-300">{msg.notificationChannelId}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Capture Driver:</span>
                    <span className="text-slate-300">{msg.capturedVia}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TIMELINE EVENT DETAILS */}
          {inspectorItem.type === 'timeline' && (() => {
            const item = inspectorItem.data;
            return (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 uppercase">
                      {item.badge}
                    </span>
                    <span className="font-mono text-slate-400 tabular-nums">
                      {item.timeFormatted} · {item.dateKey}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">{item.description}</p>
                </div>

                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 font-mono space-y-2">
                  <div className="text-xs font-semibold font-sans text-slate-300 border-b border-slate-800 pb-2">
                    Event Technical Payload
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Event ID:</span>
                    <span className="text-slate-300">{item.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ISO Timestamp:</span>
                    <span className="text-slate-300">{item.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="text-indigo-400 capitalize">{item.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Security Vault:</span>
                    <span className="text-emerald-400">Encrypted AES-256-GCM Block</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted in local device storage only</span>
          </div>

          <button
            onClick={() => setInspectorItem(null)}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
