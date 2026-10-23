import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import {
  Wifi,
  Smartphone,
  Radio,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Power,
  Ban,
  CheckCircle2,
  Cpu,
  Clock,
  Layers,
} from 'lucide-react';

export const ConnectivityView: React.FC = () => {
  const {
    simCards,
    simEvents,
    hotspotDevices,
    isHotspotEnabled,
    toggleHotspot,
    toggleBlockDevice,
    disconnectDevice,
    triggerSimSwapAlert,
    setIsSimulatorOpen,
  } = useTracker();

  const [activeSection, setActiveSection] = useState<'hotspot' | 'sim'>('hotspot');

  const connectedClients = hotspotDevices.filter((d) => d.status === 'connected');
  const totalTetheringMb = hotspotDevices.reduce((sum, d) => sum + d.dataConsumedMb, 0);

  return (
    <div className="space-y-4">
      {/* Top Section Nav Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit">
        <button
          onClick={() => setActiveSection('hotspot')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSection === 'hotspot'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wifi className="w-3.5 h-3.5 text-purple-400" />
          <span>Wi-Fi Hotspot Tethering ({connectedClients.length} Active)</span>
        </button>
        <button
          onClick={() => setActiveSection('sim')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeSection === 'sim'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span>Dual SIM Telephony & Serial (ICCID)</span>
        </button>
      </div>

      {/* Hotspot Section */}
      {activeSection === 'hotspot' && (
        <div className="space-y-4">
          {/* Hotspot Status Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isHotspotEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                  <h3 className="text-base font-semibold text-white">
                    {isHotspotEnabled ? 'Personal Hotspot Active' : 'Personal Hotspot Disabled'}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>SSID: &quot;Aryan_Pixel_5G&quot;</span>
                  <span>·</span>
                  <span>Band: 5.0 GHz (Wi-Fi 6)</span>
                  <span>·</span>
                  <span>Security: WPA3-Personal</span>
                  <span>·</span>
                  <span>Total Tethered: {(totalTetheringMb / 1024).toFixed(2)} GB</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleHotspot}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors ${
                    isHotspotEnabled
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isHotspotEnabled ? 'Turn Off Tethering' : 'Turn On Tethering'}</span>
                </button>
                <button
                  onClick={() => setIsSimulatorOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Simulate Device Connection</span>
                </button>
              </div>
            </div>
          </div>

          {/* Connected Devices Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <h4 className="text-sm font-semibold text-white">
                Tethered Client Devices &amp; MAC Logs
              </h4>
              <span className="text-xs font-mono text-slate-400">
                Tracked via <code className="text-indigo-300">TetheringManager /proc/net/arp</code>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="py-2.5 px-3 font-medium">Device Name</th>
                    <th className="py-2.5 px-3 font-medium">Hardware MAC</th>
                    <th className="py-2.5 px-3 font-medium">Assigned IP</th>
                    <th className="py-2.5 px-3 font-medium">Wi-Fi Band</th>
                    <th className="py-2.5 px-3 font-medium">Connected At</th>
                    <th className="py-2.5 px-3 font-medium text-right">Data Consumed</th>
                    <th className="py-2.5 px-3 font-medium text-center">Status</th>
                    <th className="py-2.5 px-3 font-medium text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {hotspotDevices.map((device) => {
                    const isConnected = device.status === 'connected';
                    const isBlocked = device.status === 'blocked';
                    return (
                      <tr key={device.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-sans">
                          <div className="font-semibold text-slate-100">{device.deviceName}</div>
                          {device.disconnectedAt && (
                            <div className="text-[11px] text-slate-500 font-mono">
                              Left at: {new Date(device.disconnectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-400 tabular-nums">
                          {device.macAddress}
                        </td>
                        <td className="py-3 px-3 text-slate-400 tabular-nums">
                          {device.ipAddress}
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-sans">
                          {device.connectionType}
                        </td>
                        <td className="py-3 px-3 text-slate-400 tabular-nums">
                          {new Date(device.connectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-white tabular-nums">
                          {device.dataConsumedMb.toFixed(1)} MB
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isConnected ? (
                            <span className="text-emerald-400 text-[11px] font-medium">Connected</span>
                          ) : isBlocked ? (
                            <span className="text-rose-400 text-[11px] font-medium">Blocked</span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Disconnected</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 font-sans">
                            {isConnected && (
                              <button
                                onClick={() => disconnectDevice(device.id)}
                                className="px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                              >
                                Disconnect
                              </button>
                            )}
                            <button
                              onClick={() => toggleBlockDevice(device.id)}
                              className={`px-2 py-1 text-[11px] rounded transition-colors ${
                                isBlocked
                                  ? 'text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60'
                                  : 'text-rose-400 bg-rose-950/40 hover:bg-rose-900/40'
                              }`}
                            >
                              {isBlocked ? 'Unblock' : 'Block'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SIM & Telephony Section */}
      {activeSection === 'sim' && (
        <div className="space-y-4">
          {/* SIM Cards Dual Slot Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simCards.map((sim) => (
              <div
                key={sim.slotIndex}
                className={`bg-slate-900 border rounded-lg p-5 relative ${
                  sim.status === 'changed'
                    ? 'border-rose-500/50 bg-rose-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-indigo-400 uppercase">
                        Slot {sim.slotIndex}
                      </span>
                      <span aria-hidden="true" className="text-slate-700">·</span>
                      <span className="text-xs font-mono text-slate-400">
                        {sim.networkType}
                      </span>
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {sim.carrier}
                    </div>
                  </div>

                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                    sim.status === 'changed'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {sim.status === 'changed' ? 'SIM Swapped' : 'Active SIM'}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">SIM Serial (ICCID):</span>
                    <span className="text-slate-200 font-bold tabular-nums">{sim.iccid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IMSI Identifier:</span>
                    <span className="text-slate-400 tabular-nums">{sim.imsi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">MSISDN Number:</span>
                    <span className="text-slate-300 tabular-nums">{sim.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signal Strength:</span>
                    <span className="text-emerald-400 tabular-nums">{sim.signalDbm} dBm (Optimal)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SIM Event Log & Security Simulation */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  SIM Change &amp; Carrier Event Log
                </h4>
                <div className="text-xs text-slate-400 mt-0.5">
                  Monitored via <code className="text-indigo-300 font-mono">TelephonyManager.getSimSerialNumber()</code>
                </div>
              </div>

              <button
                onClick={triggerSimSwapAlert}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/60 border border-rose-800/80 hover:bg-rose-900/60 rounded-md transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate SIM Card Swap</span>
              </button>
            </div>

            <div className="space-y-3">
              {simEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-3 rounded-lg border flex items-start gap-3 ${
                    ev.event === 'sim_swapped'
                      ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${ev.event === 'sim_swapped' ? 'text-rose-400' : 'text-amber-400'}`} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold capitalize">
                        {ev.event.replace('_', ' ')} (Slot {ev.slotIndex})
                      </span>
                      <span className="font-mono text-slate-400 tabular-nums">
                        {ev.timeFormatted} · {ev.dateKey}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">{ev.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Technical Architecture Info */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 space-y-1">
          <span className="font-semibold text-slate-200">Connectivity Tracking Under Android:</span>
          <p>
            The SIM change detector polls the Integrated Circuit Card Identifier (<code className="text-indigo-300 font-mono">ICCID</code>) using Android's <code className="text-indigo-300 font-mono">TelephonyManager</code> with <code className="text-indigo-300 font-mono">READ_PRIVILEGED_PHONE_STATE</code> permission. 
            When someone inserts a replacement or unauthorized SIM, the app registers the new hardware identifier, detects the new carrier network, and records an immediate security warning into the local vault. Hotspot clients are monitored using Linux network ARP tables (<code className="text-indigo-300 font-mono">/proc/net/arp</code>) and <code className="text-indigo-300 font-mono">WifiManager.LocalOnlyHotspotReservation</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
