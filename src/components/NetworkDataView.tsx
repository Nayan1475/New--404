import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { NetworkUnit } from '../types/tracker';
import {
  Radio,
  Wifi,
  HardDrive,
  Clock,
  ArrowDownUp,
  ArrowDown,
  ArrowUp,
  Smartphone,
  CheckCircle2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Zap,
  Layers,
  ChevronRight,
  ShieldCheck,
  Activity,
  AlertCircle,
  X,
} from 'lucide-react';

export const NetworkDataView: React.FC = () => {
  const {
    selectedDate,
    simCards,
    simDataUsage,
    wifiSessions,
    hourlyDataLogs,
    activeDataSimSlot,
    switchActiveDataSim,
    isWifiConnected,
    toggleWifiConnection,
    logNetworkEvent,
    dataUsage,
  } = useTracker();

  // Unit display state: 'MB', 'GB', or 'BOTH'
  const [unitMode, setUnitMode] = useState<NetworkUnit>('BOTH');

  // Filter for hourly timeline: 'all', 'morning', 'afternoon', 'evening'
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  // Filter for bearer: 'all', 'sim', 'wifi'
  const [bearerFilter, setBearerFilter] = useState<'all' | 'sim' | 'wifi'>('all');

  // Filter for App forensic table
  const [appSourceFilter, setAppSourceFilter] = useState<'all' | 'mobile' | 'wifi'>('all');
  const [appSearch, setAppSearch] = useState('');

  // Manual/Simulation Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [formSource, setFormSource] = useState<'sim1' | 'sim2' | 'wifi'>('sim1');
  const [formAppName, setFormAppName] = useState('YouTube');
  const [formAmount, setFormAmount] = useState('350');
  const [formUnit, setFormUnit] = useState<'MB' | 'GB'>('MB');
  const [formTimeRange, setFormTimeRange] = useState('02:00 PM – 03:00 PM');
  const [formActivity, setFormActivity] = useState('1080p Video Streaming & Social Sync');

  // Helper function to format data based on unitMode
  const formatData = (mb: number, forcedUnit?: NetworkUnit) => {
    const effectiveUnit = forcedUnit || unitMode;
    const gb = mb / 1024;
    const mbFormatted = mb.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' MB';
    const gbFormatted = gb.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' GB';

    if (effectiveUnit === 'MB') return mbFormatted;
    if (effectiveUnit === 'GB') return gbFormatted;
    return `${mbFormatted} (${gbFormatted})`;
  };

  // Filter hourly logs by selected date & time period
  const dateHourlyLogs = hourlyDataLogs.filter((h) => !h.dateKey || h.dateKey === selectedDate);
  const filteredHourlyLogs = dateHourlyLogs.filter((h) => {
    if (timeFilter === 'morning' && (h.hour < 6 || h.hour >= 12)) return false;
    if (timeFilter === 'afternoon' && (h.hour < 12 || h.hour >= 18)) return false;
    if (timeFilter === 'evening' && (h.hour < 18 || h.hour > 23)) return false;

    if (bearerFilter === 'sim' && h.mobileMb <= 0) return false;
    if (bearerFilter === 'wifi' && h.wifiMb <= 0) return false;

    return true;
  });

  // Calculate day totals
  const dateWifiSessions = wifiSessions.filter((w) => !w.dateKey || w.dateKey === selectedDate);
  const totalWifiMb = dateWifiSessions.reduce((acc, s) => acc + s.dataUsedMb, 0) || dateHourlyLogs.reduce((acc, h) => acc + h.wifiMb, 0);
  const totalMobileMb = dateHourlyLogs.reduce((acc, h) => acc + h.mobileMb, 0) || 1100;
  const grandTotalMb = totalWifiMb + totalMobileMb;

  // Filter Apps table
  const filteredApps = dataUsage.filter((app) => {
    const matchesSearch =
      app.appName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.packageName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.category.toLowerCase().includes(appSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (appSourceFilter === 'mobile' && app.mobileMb <= 0) return false;
    if (appSourceFilter === 'wifi' && app.wifiMb <= 0) return false;

    return true;
  });

  const handleCreateNetworkLog = (e: React.FormEvent) => {
    e.preventDefault();
    const rawNum = parseFloat(formAmount);
    if (isNaN(rawNum) || rawNum <= 0) return;

    const mb = formUnit === 'GB' ? Math.round(rawNum * 1024 * 10) / 10 : Math.round(rawNum * 10) / 10;

    logNetworkEvent({
      appName: formAppName,
      mbUsed: mb,
      networkSource: formSource,
      timeRange: formTimeRange,
      activity: formActivity,
      isDownload: true,
    });

    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Zone */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Radio className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Network &amp; Data Tracker
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                Dual SIM 5G + Wi-Fi 6
              </span>
            </div>
            <p className="text-xs text-slate-400">
              SIM 1, SIM 2 aur Wi-Fi ka complete data breakdown: kab, kitne time, kis app ne kitna MB/GB consume kiya.
            </p>
          </div>

          {/* Unit Toggle and Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Unit Selector: MB / GB / BOTH */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs font-mono">
              <span className="text-slate-500 px-2 text-[11px]">Unit:</span>
              <button
                onClick={() => setUnitMode('MB')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  unitMode === 'MB'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                MB
              </button>
              <button
                onClick={() => setUnitMode('GB')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  unitMode === 'GB'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                GB
              </button>
              <button
                onClick={() => setUnitMode('BOTH')}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  unitMode === 'BOTH'
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Both (MB &amp; GB)
              </button>
            </div>

            {/* Quick Record Log Button */}
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Data Event</span>
            </button>
          </div>
        </div>

        {/* Global Consumption Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span>Total Data (Selected Date)</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400 font-semibold">ALL TRAFFIC</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tracking-tight">
              {formatData(grandTotalMb)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Mobile: {formatData(totalMobileMb, 'GB')}</span>
              <span>·</span>
              <span>Wi-Fi: {formatData(totalWifiMb, 'GB')}</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cellular 5G Data</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                ACTIVE: SIM {activeDataSimSlot}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400 tracking-tight">
              {formatData(totalMobileMb)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>SIM 1: {formatData(simDataUsage[0]?.usedMb || 840.5, 'MB')}</span>
              <span>·</span>
              <span>SIM 2: {formatData(simDataUsage[1]?.usedMb || 259.5, 'MB')}</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                <span>Wi-Fi High-Speed Data</span>
              </span>
              <span className="text-[10px] font-mono text-sky-400 font-semibold">
                {isWifiConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-sky-400 tracking-tight">
              {formatData(totalWifiMb)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{dateWifiSessions.length} active sessions today</span>
              <span>·</span>
              <span>Avg Speed: 450 Mbps</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: SIM & WI-FI PHYSICAL CARRIERS OVERVIEW ("jo bhi sim ho") */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
              Physical SIM Cards &amp; Wi-Fi Interface Status
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            TelephonyManager &amp; WifiManager APIs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SIM 1 Card */}
          {(() => {
            const sim1 = simCards.find((s) => s.slotIndex === 1);
            const usage1 = simDataUsage.find((u) => u.slotIndex === 1) || {
              usedMb: 840.5,
              dailyLimitMb: 2048,
              unlimited5g: true,
              resetTime: '12:00 AM Midnight',
              downloadMb: 720.5,
              uploadMb: 120.0,
            };
            const isPrimary = activeDataSimSlot === 1;
            const pctUsed = Math.min(100, Math.round((usage1.usedMb / usage1.dailyLimitMb) * 100));

            return (
              <div
                className={`bg-slate-900 border rounded-xl p-4 transition-all ${
                  isPrimary
                    ? 'border-indigo-500/70 shadow-sm shadow-indigo-500/10 bg-slate-900/90 ring-1 ring-indigo-500/30'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                        SIM SLOT 1
                      </span>
                      {isPrimary && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          PRIMARY DATA
                        </span>
                      )}
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {sim1?.carrier || 'Jio True 5G'}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {sim1?.phoneNumber || '+91 98201 44520'}
                    </div>
                  </div>

                  {/* Signal Strength Meter */}
                  <div className="flex items-end gap-1 h-5" title="Signal: -88 dBm (5 Bars)">
                    <div className="w-1.5 h-2 bg-emerald-400 rounded-2xs" />
                    <div className="w-1.5 h-3 bg-emerald-400 rounded-2xs" />
                    <div className="w-1.5 h-3.5 bg-emerald-400 rounded-2xs" />
                    <div className="w-1.5 h-4.5 bg-emerald-400 rounded-2xs" />
                    <div className="w-1.5 h-5 bg-emerald-400 rounded-2xs" />
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Network Mode:</span>
                    <span className="font-mono text-slate-200 font-medium">5G Standalone (Band n78)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>SIM Serial (ICCID):</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate max-w-[140px]">
                      {sim1?.iccid || '89918700234891234F'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Data Used Today:</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {formatData(usage1.usedMb)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Daily Limit: {formatData(usage1.dailyLimitMb, 'GB')}</span>
                      <span>{pctUsed}% used</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pctUsed}%` }}
                      />
                    </div>
                  </div>

                  {/* Download vs Upload */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ArrowDown className="w-3 h-3" />
                      DL: {formatData(usage1.downloadMb, 'MB')}
                    </span>
                    <span className="flex items-center gap-1 text-sky-400">
                      <ArrowUp className="w-3 h-3" />
                      UL: {formatData(usage1.uploadMb, 'MB')}
                    </span>
                  </div>

                  {usage1.unlimited5g && (
                    <div className="bg-emerald-950/40 border border-emerald-500/20 rounded p-2 text-[11px] text-emerald-300 flex items-center gap-1.5 mt-2">
                      <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Unlimited 5G Welcome Offer active (Zero daily cap)</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  {isPrimary ? (
                    <div className="text-center text-xs font-mono text-emerald-400 font-semibold py-1 bg-emerald-950/50 rounded-md border border-emerald-500/30">
                      ✓ Active Mobile Data Bearer
                    </div>
                  ) : (
                    <button
                      onClick={() => switchActiveDataSim(1)}
                      className="w-full text-center text-xs font-medium text-slate-200 hover:text-white py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
                    >
                      Set SIM 1 as Active Data Bearer
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* SIM 2 Card */}
          {(() => {
            const sim2 = simCards.find((s) => s.slotIndex === 2);
            const usage2 = simDataUsage.find((u) => u.slotIndex === 2) || {
              usedMb: 259.5,
              dailyLimitMb: 1536,
              unlimited5g: false,
              resetTime: '12:00 AM Midnight',
              downloadMb: 214.5,
              uploadMb: 45.0,
            };
            const isPrimary = activeDataSimSlot === 2;
            const pctUsed = Math.min(100, Math.round((usage2.usedMb / usage2.dailyLimitMb) * 100));

            return (
              <div
                className={`bg-slate-900 border rounded-xl p-4 transition-all ${
                  isPrimary
                    ? 'border-indigo-500/70 shadow-sm shadow-indigo-500/10 bg-slate-900/90 ring-1 ring-indigo-500/30'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        SIM SLOT 2
                      </span>
                      {isPrimary && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          PRIMARY DATA
                        </span>
                      )}
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {sim2?.carrier || 'Airtel 5G Plus'}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      {sim2?.phoneNumber || '+91 94140 18832'}
                    </div>
                  </div>

                  {/* Signal Strength Meter */}
                  <div className="flex items-end gap-1 h-5" title="Signal: -92 dBm (4 Bars)">
                    <div className="w-1.5 h-2 bg-emerald-400 rounded-2xs" />
                    <div className="w-1.5 h-3 bg-emerald-400 rounded-2xs" />
                    <div className="w-1.5 h-3.5 bg-emerald-400 rounded-2xs" />
                    <div className="w-1.5 h-4.5 bg-emerald-400 rounded-2xs" />
                    <div className="w-1.5 h-5 bg-slate-700 rounded-2xs" />
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Network Mode:</span>
                    <span className="font-mono text-slate-200 font-medium">5G Non-Standalone (Band n28)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>SIM Serial (ICCID):</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate max-w-[140px]">
                      {sim2?.iccid || '89914009871234567F'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Data Used Today:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatData(usage2.usedMb)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Daily Limit: {formatData(usage2.dailyLimitMb, 'GB')}</span>
                      <span>{pctUsed}% used</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pctUsed}%` }}
                      />
                    </div>
                  </div>

                  {/* Download vs Upload */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <ArrowDown className="w-3 h-3" />
                      DL: {formatData(usage2.downloadMb, 'MB')}
                    </span>
                    <span className="flex items-center gap-1 text-sky-400">
                      <ArrowUp className="w-3 h-3" />
                      UL: {formatData(usage2.uploadMb, 'MB')}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-2">
                    Resets daily at 12:00 AM Midnight ({formatData(usage2.dailyLimitMb - usage2.usedMb, 'MB')} remaining)
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  {isPrimary ? (
                    <div className="text-center text-xs font-mono text-emerald-400 font-semibold py-1 bg-emerald-950/50 rounded-md border border-emerald-500/30">
                      ✓ Active Mobile Data Bearer
                    </div>
                  ) : (
                    <button
                      onClick={() => switchActiveDataSim(2)}
                      className="w-full text-center text-xs font-medium text-slate-200 hover:text-white py-1.5 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
                    >
                      Set SIM 2 as Active Data Bearer
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Wi-Fi Interface Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-500/40">
                      WI-FI 6 INTERFACE
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border flex items-center gap-1 ${
                        isWifiConnected
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-950 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isWifiConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}
                      />
                      {isWifiConnected ? 'CONNECTED' : 'DISABLED'}
                    </span>
                  </div>
                  <div className="text-base font-bold text-white mt-1">
                    {isWifiConnected ? 'TechPark-Secure-Corp-Wi-Fi' : 'Not Connected to Wi-Fi'}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    {isWifiConnected ? 'BSSID: 70:B3:17:9A:88:F2' : 'Searching for saved SSIDs...'}
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-500/30">
                  <Wifi className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Frequency &amp; Standard:</span>
                  <span className="font-mono text-slate-200 font-medium">5.0 GHz (Wi-Fi 6 802.11ax)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Link Speed:</span>
                  <span className="font-mono text-emerald-400 font-medium">866 Mbps (Full Duplex)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Total Wi-Fi Used Today:</span>
                  <span className="font-mono font-bold text-sky-400">
                    {formatData(totalWifiMb)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Assigned IP Address:</span>
                  <span className="font-mono text-slate-300">192.168.1.45 (DHCP)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                onClick={toggleWifiConnection}
                className={`w-full text-center text-xs font-medium py-1.5 rounded-md border transition-colors ${
                  isWifiConnected
                    ? 'bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-900/50'
                    : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500'
                }`}
              >
                {isWifiConnected ? 'Disconnect Wi-Fi (Force 5G)' : 'Connect to Saved Wi-Fi'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: "KAB KITNE TIME KYA USE HUA" (HOURLY TIME INTERVAL BREAKDOWN) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Kab Kitne Time Kya Use Hua (Time-Interval Breakdown)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Har ghante ka exact data: time range, kis network par chala, kitna MB aur GB kharch hua aur kaunse apps active the.
            </p>
          </div>

          {/* Time Filter & Bearer Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  timeFilter === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                }`}
              >
                All Hours
              </button>
              <button
                onClick={() => setTimeFilter('morning')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  timeFilter === 'morning' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                }`}
              >
                Morning
              </button>
              <button
                onClick={() => setTimeFilter('afternoon')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  timeFilter === 'afternoon' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                }`}
              >
                Afternoon
              </button>
              <button
                onClick={() => setTimeFilter('evening')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  timeFilter === 'evening' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                }`}
              >
                Evening
              </button>
            </div>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setBearerFilter('all')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  bearerFilter === 'all' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setBearerFilter('sim')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  bearerFilter === 'sim' ? 'bg-emerald-950 text-emerald-400 font-medium' : 'text-slate-400'
                }`}
              >
                5G SIM
              </button>
              <button
                onClick={() => setBearerFilter('wifi')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  bearerFilter === 'wifi' ? 'bg-sky-950 text-sky-400 font-medium' : 'text-slate-400'
                }`}
              >
                Wi-Fi
              </button>
            </div>
          </div>
        </div>

        {/* Hourly Chronological List */}
        <div className="space-y-2.5">
          {filteredHourlyLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/50 rounded-lg border border-slate-800 text-slate-500 text-xs">
              No network usage records found for this time filter. Try selecting "All Hours".
            </div>
          ) : (
            filteredHourlyLogs.map((item) => {
              const hasWifi = item.wifiMb > 0;
              const hasMobile = item.mobileMb > 0;
              const isHeavy = item.totalMb >= 500;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  {/* Left: Time and primary action */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-slate-900 border border-slate-800 text-indigo-400 shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white tracking-wide">
                          {item.timeRange}
                        </span>

                        {hasWifi && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950/80 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                            <Wifi className="w-2.5 h-2.5" />
                            Wi-Fi ({formatData(item.wifiMb, 'MB')})
                          </span>
                        )}

                        {hasMobile && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5" />
                            SIM {item.simSlot || 1} 5G ({formatData(item.mobileMb, 'MB')})
                          </span>
                        )}

                        {isHeavy && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/80 text-amber-300 border border-amber-500/30">
                            High Traffic Peak
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-300 mt-1 font-medium">
                        {item.primaryActivity}
                      </div>

                      {/* Top Apps during this interval */}
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <span>Active Apps:</span>
                        <div className="flex flex-wrap items-center gap-1">
                          {item.topApps.map((app, aIdx) => (
                            <span
                              key={aIdx}
                              className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px] font-mono"
                            >
                              {app}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Exact Data Numbers with Dual Units */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 border-slate-800/80 pt-2 md:pt-0">
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white tracking-tight">
                        {formatData(item.totalMb)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {(item.totalMb / 1024).toFixed(3)} GB total
                      </div>
                    </div>

                    {/* Proportional visual bar */}
                    <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden flex">
                      {hasWifi && (
                        <div
                          className="bg-sky-500 h-full"
                          style={{ width: `${(item.wifiMb / item.totalMb) * 100}%` }}
                          title={`Wi-Fi: ${item.wifiMb} MB`}
                        />
                      )}
                      {hasMobile && (
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${(item.mobileMb / item.totalMb) * 100}%` }}
                          title={`Mobile 5G: ${item.mobileMb} MB`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 3: WI-FI SESSIONS HISTORY LOG ("our kitna wifi kab use hua") */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-sky-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Wi-Fi Connection Sessions History
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total Wi-Fi: {formatData(totalWifiMb)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dateWifiSessions.map((session) => (
            <div
              key={session.id}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-mono text-sky-400 font-semibold">{session.timeFormatted}</span>
                  <span className="text-[10px] text-slate-500">{session.durationMinutes} mins</span>
                </div>
                <div className="text-sm font-bold text-white tracking-tight truncate">
                  {session.ssid}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {session.locationLabel}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  {session.speedMbps} Mbps · {session.frequency}
                </span>
                <span className="font-mono font-bold text-sky-400">
                  {formatData(session.dataUsedMb)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: PER-APP FORENSIC DATA CONSUMPTION TABLE ("kya use hua kitna mb kitna gb") */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                App-by-App Forensic Data Consumption
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              NetworkStatsManager API se calculated: har app ka Wi-Fi vs Mobile 5G data, foreground aur background distribution.
            </p>
          </div>

          {/* Search & Source Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search apps..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setAppSourceFilter('all')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  appSourceFilter === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400'
                }`}
              >
                All Apps
              </button>
              <button
                onClick={() => setAppSourceFilter('mobile')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  appSourceFilter === 'mobile' ? 'bg-emerald-950 text-emerald-400 font-medium' : 'text-slate-400'
                }`}
              >
                Mobile 5G
              </button>
              <button
                onClick={() => setAppSourceFilter('wifi')}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  appSourceFilter === 'wifi' ? 'bg-sky-950 text-sky-400 font-medium' : 'text-slate-400'
                }`}
              >
                Wi-Fi Only
              </button>
            </div>
          </div>
        </div>

        {/* Deep Forensic Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Application &amp; Package</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Wi-Fi Data</th>
                <th className="py-2.5 px-3">Mobile 5G Data</th>
                <th className="py-2.5 px-3">Total Consumed</th>
                <th className="py-2.5 px-3">Foreground / Background</th>
                <th className="py-2.5 px-3">Download / Upload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredApps.map((app) => {
                const totalMb = app.wifiMb + app.mobileMb;
                const fgMb = app.foregroundMb ?? Math.round(totalMb * 0.85);
                const bgMb = app.backgroundMb ?? Math.round(totalMb * 0.15);
                const dlMb = app.downloadMb ?? Math.round(totalMb * 0.9);
                const ulMb = app.uploadMb ?? Math.round(totalMb * 0.1);

                return (
                  <tr key={app.packageName} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{app.appName}</div>
                      <div className="font-mono text-[10px] text-slate-500 truncate max-w-[180px]">
                        {app.packageName}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{app.category}</td>
                    <td className="py-2.5 px-3 font-mono text-sky-400">
                      {formatData(app.wifiMb)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-emerald-400">
                      {formatData(app.mobileMb)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-white">
                        {formatData(totalMb)}
                      </div>
                      <div className="w-20 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, (totalMb / 1550) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      <div>FG: {formatData(fgMb, 'MB')}</div>
                      <div className="text-slate-500">BG: {formatData(bgMb, 'MB')}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      <div className="text-emerald-400">DL: {formatData(dlMb, 'MB')}</div>
                      <div className="text-sky-400">UL: {formatData(ulMb, 'MB')}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: LOG / SIMULATE LIVE DATA EVENT */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Radio className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Log Network Usage Event</h3>
                  <p className="text-[11px] text-slate-400">Record custom data transmission for testing</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNetworkLog} className="space-y-4 text-xs">
              {/* Network Source / Bearer */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Select Network Bearer:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormSource('sim1')}
                    className={`p-2 rounded-lg border text-center font-mono ${
                      formSource === 'sim1'
                        ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    SIM 1 (Jio 5G)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSource('sim2')}
                    className={`p-2 rounded-lg border text-center font-mono ${
                      formSource === 'sim2'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    SIM 2 (Airtel 5G)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSource('wifi')}
                    className={`p-2 rounded-lg border text-center font-mono ${
                      formSource === 'wifi'
                        ? 'bg-sky-950/80 border-sky-500 text-sky-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Wi-Fi (5.0 GHz)
                  </button>
                </div>
              </div>

              {/* App Name */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Application Name:</label>
                <select
                  value={formAppName}
                  onChange={(e) => setFormAppName(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                >
                  <option value="YouTube">YouTube (HD Streaming)</option>
                  <option value="WhatsApp">WhatsApp (VoIP / Video Call / Media)</option>
                  <option value="Instagram">Instagram (Reels / Stories)</option>
                  <option value="Google Chrome">Google Chrome (Web Browsing)</option>
                  <option value="Spotify Music">Spotify Music (Audio Streaming)</option>
                  <option value="Google Maps">Google Maps (Turn-by-turn Navigation)</option>
                  <option value="Zoom Meeting">Zoom Video Conference</option>
                  <option value="Google Drive">Google Drive (Cloud Sync &amp; Backup)</option>
                  <option value="Notion">Notion (Workspace Sync)</option>
                </select>
              </div>

              {/* Data Amount and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Data Amount:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Unit:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormUnit('MB')}
                      className={`p-2 rounded-lg border text-center font-mono ${
                        formUnit === 'MB'
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      MB
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormUnit('GB')}
                      className={`p-2 rounded-lg border text-center font-mono ${
                        formUnit === 'GB'
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      GB
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Range */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Time Window:</label>
                <input
                  type="text"
                  value={formTimeRange}
                  onChange={(e) => setFormTimeRange(e.target.value)}
                  placeholder="e.g. 02:00 PM – 03:00 PM"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Activity Description */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Activity Description:</label>
                <input
                  type="text"
                  value={formActivity}
                  onChange={(e) => setFormActivity(e.target.value)}
                  placeholder="e.g. 1080p Video Streaming & Social Sync"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
                >
                  Record Network Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
