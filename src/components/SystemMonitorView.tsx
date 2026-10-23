import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  Clock,
  HardDrive,
  DownloadCloud,
  Smartphone,
  Wifi,
  BarChart2,
  Layers,
  ShieldCheck,
  Plus,
} from 'lucide-react';

export const SystemMonitorView: React.FC = () => {
  const {
    appScreenTime,
    hourlyScreenTime,
    dataUsage,
    appInstalls,
    selectedDate,
    setIsSimulatorOpen,
  } = useTracker();

  const [activeSubTab, setActiveSubTab] = useState<'screentime' | 'data' | 'installs'>('screentime');

  const totalScreenMinutes = appScreenTime.reduce((sum, item) => sum + item.durationMinutes, 0);
  const totalWifiMb = dataUsage.reduce((sum, item) => sum + item.wifiMb, 0);
  const totalMobileMb = dataUsage.reduce((sum, item) => sum + item.mobileMb, 0);
  const totalDataMb = totalWifiMb + totalMobileMb;

  const maxHourlyMinutes = Math.max(...hourlyScreenTime.map((h) => h.screenMinutes), 60);

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit">
        <button
          onClick={() => setActiveSubTab('screentime')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'screentime'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Screen Time (UsageStats)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('data')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'data'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5 text-amber-400" />
          <span>Data Usage (NetworkStats)</span>
        </button>
        <button
          onClick={() => setActiveSubTab('installs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSubTab === 'installs'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DownloadCloud className="w-3.5 h-3.5 text-emerald-400" />
          <span>App Installs ({appInstalls.length})</span>
        </button>
      </div>

      {/* Screen Time Section */}
      {activeSubTab === 'screentime' && (
        <div className="space-y-4">
          {/* Hourly Usage Graph */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white">Hourly Screen Intensity</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  UsageStatsManager hourly aggregate · Total: {Math.floor(totalScreenMinutes / 60)}h {totalScreenMinutes % 60}m
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-xs" />
                  <span>Screen On (mins)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-slate-700 rounded-xs" />
                  <span>Pickups</span>
                </div>
              </div>
            </div>

            {/* Hourly bar chart container */}
            <div className="pt-6 pb-2">
              <div className="grid grid-cols-12 gap-2 items-end h-40">
                {hourlyScreenTime.map((hour) => {
                  const heightPercent = Math.round((hour.screenMinutes / maxHourlyMinutes) * 100);
                  return (
                    <div key={hour.hour} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono tabular-nums text-slate-300 bg-slate-950 px-1 py-0.5 rounded border border-slate-800 whitespace-nowrap">
                        {hour.screenMinutes}m · {hour.pickups}p
                      </div>
                      <div className="w-full bg-slate-800/60 rounded-t h-full flex items-end overflow-hidden p-0.5">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-indigo-600 rounded-xs transition-all group-hover:bg-indigo-500"
                        />
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 truncate">
                        {hour.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* App-by-App Screen Time Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Top Apps by Usage Duration</h3>
            <p className="text-xs text-slate-400 mb-4">Calculated from Android UsageStatsManager foreground service intervals</p>

            <div className="space-y-3">
              {appScreenTime.map((app) => (
                <div key={app.packageName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{app.appName}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{app.packageName}</span>
                      <span aria-hidden="true" className="text-slate-700">·</span>
                      <span className="text-slate-400 text-[11px]">{app.category}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-500 text-[11px]">{app.sessionsCount} sessions</span>
                      <span className="font-bold text-white tabular-nums">
                        {Math.floor(app.durationMinutes / 60) > 0 ? `${Math.floor(app.durationMinutes / 60)}h ` : ''}
                        {app.durationMinutes % 60}m
                      </span>
                      <span className="text-indigo-400 text-[11px] tabular-nums">({app.percentageOfDay}%)</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
                    <div
                      style={{ width: `${app.percentageOfDay * 2.5}%` }}
                      className="bg-indigo-600 h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Usage Section */}
      {activeSubTab === 'data' && (
        <div className="space-y-4">
          {/* Data Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
              <div className="text-xs text-slate-400">Total Internet Consumed</div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums mt-0.5">
                {(totalDataMb / 1024).toFixed(2)} GB
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Wi-Fi + 5G Mobile Data</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
              <div className="text-xs text-slate-400">Wi-Fi Network Usage</div>
              <div className="text-2xl font-bold text-teal-400 font-mono tabular-nums mt-0.5">
                {(totalWifiMb / 1024).toFixed(2)} GB
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Office & Home networks</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5">
              <div className="text-xs text-slate-400">Mobile Cellular (5G SA)</div>
              <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-0.5">
                {totalMobileMb.toFixed(1)} MB
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Jio True 5G data pack</div>
            </div>
          </div>

          {/* Data Usage Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white mb-1">Per-App Network Data Usage</h3>
            <p className="text-xs text-slate-400 mb-4">NetworkStatsManager query by UID (User ID) and network interface</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2.5 px-3 font-medium">Application</th>
                    <th className="py-2.5 px-3 font-medium">Category</th>
                    <th className="py-2.5 px-3 font-medium text-right">Wi-Fi Usage</th>
                    <th className="py-2.5 px-3 font-medium text-right">Mobile Data</th>
                    <th className="py-2.5 px-3 font-medium text-right">Total Transferred</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {dataUsage.map((row) => (
                    <tr key={row.packageName} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-sans font-semibold text-slate-200">{row.appName}</div>
                        <div className="text-[11px] text-slate-500">{row.packageName}</div>
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-400">
                        {row.category}
                      </td>
                      <td className="py-3 px-3 text-right text-teal-400 tabular-nums">
                        {row.wifiMb >= 1000 ? `${(row.wifiMb / 1024).toFixed(2)} GB` : `${row.wifiMb} MB`}
                      </td>
                      <td className="py-3 px-3 text-right text-amber-400 tabular-nums">
                        {row.mobileMb} MB
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white tabular-nums">
                        {row.totalMb >= 1000 ? `${(row.totalMb / 1024).toFixed(2)} GB` : `${row.totalMb} MB`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* App Installs Section */}
      {activeSubTab === 'installs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">App Install & Update Log</h3>
              <div className="text-xs text-slate-400 mt-0.5">
                BroadcastReceiver: <code className="text-indigo-300 font-mono">android.intent.action.PACKAGE_ADDED</code>
              </div>
            </div>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simulate App Install</span>
            </button>
          </div>

          <div className="space-y-3">
            {appInstalls.map((app) => (
              <div
                key={app.id}
                className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{app.appName}</span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span className="text-xs text-slate-400">{app.category}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-500 flex flex-wrap items-center gap-2">
                    <span>Package: {app.packageName}</span>
                    <span>·</span>
                    <span>Size: {app.sizeMb} MB</span>
                    <span>·</span>
                    <span>Source: {app.sourceStore}</span>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-400 sm:text-right shrink-0">
                  <div className="text-slate-300 tabular-nums">{app.timeFormatted}</div>
                  <div className="text-[11px] text-slate-500">{app.dateKey}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Architecture Info */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-200">System Monitoring Architecture:</span>
          <p>
            App installations are logged in real time via an Android <code className="text-indigo-300 font-mono">BroadcastReceiver</code> configured for <code className="text-indigo-300 font-mono">Intent.ACTION_PACKAGE_ADDED</code>.
            Screen time and app pickups use Android's <code className="text-indigo-300 font-mono">UsageStatsManager.queryUsageStats()</code> with the privileged <code className="text-indigo-300 font-mono">PACKAGE_USAGE_STATS</code> permission.
            Data consumption is broken down using <code className="text-indigo-300 font-mono">NetworkStatsManager.querySummary()</code> across Wi-Fi and Cellular interfaces.
          </p>
        </div>
      </div>
    </div>
  );
};
