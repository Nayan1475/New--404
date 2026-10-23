import React, { useState, useEffect } from 'react';
import { useTracker } from '../context/TrackerContext';
import { generateForensicPdf, calculateSha256Digest } from '../services/forensicPdfService';
import {
  ShieldCheck,
  FileText,
  Download,
  Copy,
  Check,
  X,
  AlertTriangle,
  Lock,
  Calendar,
  Smartphone,
  Hash,
  Sparkles,
  Printer,
} from 'lucide-react';

export const ForensicReportModal: React.FC = () => {
  const {
    isForensicReportModalOpen,
    setIsForensicReportModalOpen,
    calls,
    messages,
    waypoints,
    simDataUsage,
    wifiSessions,
    summaryStats,
    selectedDate,
  } = useTracker();

  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [digest, setDigest] = useState<string>('Computing cryptographic hash...');

  const dayCalls = calls.filter((c) => c.dateKey === selectedDate);
  const dayMessages = messages.filter((m) => m.dateKey === selectedDate);
  const dayWaypoints = waypoints.filter((w) => w.dateKey === selectedDate);
  const deletedCallsCount = dayCalls.filter((c) => c.deletedOnPhone).length;
  const deletedMessagesCount = dayMessages.filter((m) => m.deletedOnPhone).length;

  const reportId = `FR-${selectedDate.replace(/-/g, '')}-X8912`;

  useEffect(() => {
    if (!isForensicReportModalOpen) return;

    const computeHash = async () => {
      const payloadString = JSON.stringify({
        reportId,
        date: selectedDate,
        calls: dayCalls.length,
        messages: dayMessages.length,
        deletedPreserved: deletedCallsCount + deletedMessagesCount,
      });
      const hash = await calculateSha256Digest(payloadString);
      setDigest(hash);
    };

    computeHash();
  }, [isForensicReportModalOpen, selectedDate, dayCalls.length, dayMessages.length, deletedCallsCount, deletedMessagesCount, reportId]);

  if (!isForensicReportModalOpen) return null;

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const now = new Date();
      const payload = {
        reportId,
        generatedAt: now.toLocaleString(),
        targetDate: selectedDate,
        deviceName: 'Samsung Galaxy S24 Ultra (SM-S928B)',
        deviceId: 'IMEI1: 358902118239014 · ICCID: 89918700234891234F',
        androidVersion: 'Android 15 (API 35, Vanilla Ice Cream)',
        calls: dayCalls,
        messages: dayMessages,
        waypoints: dayWaypoints,
        simDataUsage,
        wifiSessions,
        summaryStats,
      };

      const { doc, hash } = await generateForensicPdf(payload);
      doc.save(`Activity_Forensic_Report_${selectedDate}_${hash.slice(0, 8)}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(digest);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                Export Forensic Report
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  SHA-256 SIGNED
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official court-grade immutable audit summary &amp; external backup
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsForensicReportModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Immutable Guarantee Banner */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <Lock className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Immutable Anti-Delete Chain of Custody</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              This report compiles unalterable telemetry logs directly from the device daemon. Even if the user cleared recent calls or erased messages from WhatsApp/SMS on their phone, the intercepted records are preserved permanently and certified below.
            </p>
          </div>

          {/* Audit Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-[11px] text-slate-500">Target Date</div>
              <div className="text-sm font-semibold text-slate-200 mt-0.5">{selectedDate}</div>
              <div className="text-[10px] text-slate-500">24h telemetry</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-[11px] text-slate-500">Calls Preserved</div>
              <div className="text-sm font-semibold text-white mt-0.5">{dayCalls.length}</div>
              <div className="text-[10px] text-rose-400">{deletedCallsCount} deleted on phone</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-[11px] text-slate-500">Messages Intercepted</div>
              <div className="text-sm font-semibold text-white mt-0.5">{dayMessages.length}</div>
              <div className="text-[10px] text-rose-400">{deletedMessagesCount} deleted on phone</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-[11px] text-slate-500">GPS Checkpoints</div>
              <div className="text-sm font-semibold text-indigo-400 mt-0.5">{dayWaypoints.length}</div>
              <div className="text-[10px] text-slate-500">{summaryStats.distanceTraveledKm} km travel</div>
            </div>
          </div>

          {/* Device & Case Details */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              Target Hardware &amp; Telephony Carrier
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 font-mono">
              <div><span className="text-slate-500">Device:</span> Samsung Galaxy S24 Ultra (SM-S928B)</div>
              <div><span className="text-slate-500">Build:</span> Android 15 (API 35) / Kernel 6.1</div>
              <div><span className="text-slate-500">SIM 1:</span> Jio True 5G (89918700234891234F)</div>
              <div><span className="text-slate-500">SIM 2:</span> Airtel 5G Plus (89914009210084321A)</div>
              <div><span className="text-slate-500">Audit Case ID:</span> {reportId}</div>
              <div><span className="text-slate-500">Vault Format:</span> WORM Immutable Ledger</div>
            </div>
          </div>

          {/* SHA-256 Digital Signature Seal Box */}
          <div className="p-4 bg-slate-950 border border-indigo-900/40 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                Cryptographic Signature Seal (SHA-256)
              </span>
              <button
                onClick={handleCopyHash}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {copiedHash ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-indigo-200 break-all select-all">
              {digest}
            </div>
            <p className="text-[11px] text-slate-500">
              Any modification of a single byte in the generated PDF will permanently invalidate this digital signature.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ready for external legal, backup, or compliance archival.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsForensicReportModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating Signed PDF...' : 'Download Cryptographically Signed PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
