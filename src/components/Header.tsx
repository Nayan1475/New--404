import React, { useState } from 'react';
import { useTracker, NavigationTab } from '../context/TrackerContext';
import { 
  Activity, 
  PhoneCall, 
  MessageSquare, 
  Radio,
  Cpu, 
  Wifi, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  Battery, 
  BatteryCharging,
  Code2,
  Menu,
  X,
  Layers,
  ChevronRight,
  Sparkles,
  Cloud,
  EyeOff,
  RefreshCw,
  FileText,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    batteryLevel, 
    isCharging, 
    isOnline, 
    connectionType, 
    setIsSimulatorOpen,
    isVaultEncrypted,
    summaryStats,
    hideApp,
    isAutoFetchActive,
    toggleAutoFetch,
    lastAutoFetchTime,
    triggerManualAutoFetch,
    setIsForensicReportModalOpen,
  } = useTracker();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFetchingNow, setIsFetchingNow] = useState(false);

  const handleManualFetch = async () => {
    setIsFetchingNow(true);
    await triggerManualAutoFetch();
    setTimeout(() => setIsFetchingNow(false), 800);
  };

  const navItems: { id: NavigationTab; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'timeline', label: 'Daily Timeline', desc: 'Chronological activity feed', icon: <Activity className="w-4 h-4" /> },
    { id: 'calls', label: 'Calls', desc: 'Cellular & Social VoIP', icon: <PhoneCall className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages & Apps', desc: 'SMS & notification previews', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'network', label: 'Network & Data', desc: 'SIM & Wi-Fi usage timeline', icon: <Radio className="w-4 h-4" /> },
    { id: 'system', label: 'System & Stats', desc: 'Screen time & 5G data', icon: <Cpu className="w-4 h-4" /> },
    { id: 'connectivity', label: 'SIM & Hotspot', desc: 'ICCID & Tethering ARP', icon: <Wifi className="w-4 h-4" /> },
    { id: 'location', label: 'Location Map', desc: 'Fused GPS breadcrumbs', icon: <MapPin className="w-4 h-4" /> },
    { id: 'vault', label: 'Security Vault', desc: 'AES-256 local storage', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'google-drive', label: 'Google Drive', desc: 'Cloud backups & file sync', icon: <Cloud className="w-4 h-4" /> },
    { id: 'native-kit', label: 'Android Bridge Kit', desc: 'Kotlin & Tasker blueprints', icon: <Code2 className="w-4 h-4" /> },
  ];

  const handleMobileNavClick = (tabId: NavigationTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar: Brand, Desktop Nav, and Telemetry Actions */}
          <div className="flex items-center justify-between gap-4 h-16">
            {/* Brand Zone */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setActiveTab('timeline')} 
                className="text-left group flex items-center gap-2.5 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap leading-none">
                    PhonePulse
                  </span>
                  <span className="text-[10px] font-mono text-indigo-400 font-semibold tracking-wide mt-0.5">
                    ACTIVITY TRACKER
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto py-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Zone: Hardware stats + Auto-Fetch + Forensic Report + Hide App + Simulate */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Telemetry pill */}
              <div className="hidden 2xl:flex items-center gap-2 text-xs font-mono text-slate-400 border border-slate-800 bg-slate-950/80 px-2.5 py-1 rounded-md">
                <span className="flex items-center gap-1">
                  {isCharging ? (
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Battery className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span className="tabular-nums">{batteryLevel ?? 82}%</span>
                </span>
                <span className="text-slate-700">|</span>
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>{connectionType}</span>
                </span>
              </div>

              {/* Auto-Fetch Status & Manual Sync Button */}
              <button
                onClick={handleManualFetch}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                title={`Auto-Fetch is ${isAutoFetchActive ? 'Active (Every 20s)' : 'Paused'}. Click to pull latest device telemetry immediately.`}
              >
                <RefreshCw className={`w-3 h-3 text-emerald-400 ${isFetchingNow ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Auto-Fetch:</span>
                <span className="font-semibold text-emerald-400">LIVE</span>
              </button>

              {/* Export Forensic PDF Report Button */}
              <button
                onClick={() => setIsForensicReportModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/80 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                title="Export cryptographically signed court-grade forensic report"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Forensic PDF</span>
              </button>

              {/* Dedicated Hide / Stealth Mode Button */}
              <button
                onClick={hideApp}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/70 hover:bg-amber-900/70 border border-amber-800/80 rounded-lg shadow-sm transition-all whitespace-nowrap"
                title="Hide App into Calculator Disguise. Type 1475 in calculator to unhide."
              >
                <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Hide App</span>
              </button>

              {/* Simulate button */}
              <button
                onClick={() => setIsSimulatorOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate</span>
              </button>

              {/* Mobile Menu Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors focus:outline-none"
                aria-label="Toggle navigation drawer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-400" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Scrollable Quick Sub-Bar (always visible under header on mobile/tablet) */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2 px-4 border-t border-slate-800/80 bg-slate-950/90 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Slide-out Mobile Navigation Drawer Modal */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-slate-900 border-l border-slate-800 h-full p-5 flex flex-col justify-between overflow-y-auto shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">PhonePulse</div>
                    <div className="text-[10px] font-mono text-slate-500">Android Telemetry Console</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Hardware Status In Drawer */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Battery Status:</span>
                  <span className="text-white font-bold tabular-nums">
                    {batteryLevel}% {isCharging ? '(Charging)' : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Radio Network:</span>
                  <span className="text-emerald-400">{connectionType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Local Vault:</span>
                  <span className="text-indigo-400">AES-256 Encrypted</span>
                </div>
              </div>

              {/* All Navigation Modules */}
              <div className="space-y-1">
                <div className="text-[11px] font-mono text-slate-500 uppercase px-2 pb-1">
                  App Modules &amp; Logs
                </div>
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleMobileNavClick(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{item.label}</div>
                          <div className={`text-[11px] ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  hideApp();
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-amber-950/80 border border-amber-800/80 hover:bg-amber-900/80 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <EyeOff className="w-4 h-4 text-amber-400" />
                <span>Hide App (Stealth Search Disguise)</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsForensicReportModalOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-indigo-950/80 border border-indigo-800/80 hover:bg-indigo-900/80 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Export Forensic PDF Report</span>
              </button>

              <button
                onClick={() => {
                  setIsSimulatorOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Simulate Phone Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <nav 
        aria-label="Mobile Navigation" 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around h-16 shadow-lg"
      >
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 transition-colors ${
            activeTab === 'timeline' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="text-[10px] truncate">Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 transition-colors ${
            activeTab === 'calls' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span className="text-[10px] truncate">Calls ({summaryStats.callsCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 transition-colors ${
            activeTab === 'messages' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[10px] truncate">Msgs ({summaryStats.messagesCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 transition-colors ${
            activeTab === 'system' ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span className="text-[10px] truncate">System</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-1 px-1 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px] truncate">More...</span>
        </button>
      </nav>
    </>
  );
};
