import React from 'react';
import { TrackerProvider, useTracker } from './context/TrackerContext';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { DateSelector } from './components/DateSelector';
import { TimelineView } from './components/TimelineView';
import { CallLoggerView } from './components/CallLoggerView';
import { MessageTrackerView } from './components/MessageTrackerView';
import { SystemMonitorView } from './components/SystemMonitorView';
import { NetworkDataView } from './components/NetworkDataView';
import { ConnectivityView } from './components/ConnectivityView';
import { LocationMapView } from './components/LocationMapView';
import { PrivacyAndPermissionsView } from './components/PrivacyAndPermissionsView';
import { GoogleDriveView } from './components/GoogleDriveView';
import { AndroidCompanionView } from './components/AndroidCompanionView';
import { LiveSimulatorModal } from './components/LiveSimulatorModal';
import { ActivityDetailModal } from './components/ActivityDetailModal';
import { StealthDisguiseView } from './components/StealthDisguiseView';
import { ForensicReportModal } from './components/ForensicReportModal';
import { ShieldCheck, HardDrive, Cpu, Radio, Sparkles } from 'lucide-react';

const TrackerDashboard: React.FC = () => {
  const { activeTab, setActiveTab, isAppHidden } = useTracker();

  if (isAppHidden) {
    return <StealthDisguiseView />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16 lg:pb-0">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6">
        {/* Metric Summary Strip (Single elevation, tabular figures) */}
        <section aria-label="Daily Metrics Summary">
          <MetricCards />
        </section>

        {/* Date Selector & Search/Filter Bar */}
        <section aria-label="Date and Filter Controls">
          <DateSelector />
        </section>

        {/* Tab View Container */}
        <section aria-label="Main Tracker View">
          {activeTab === 'timeline' && <TimelineView />}
          {activeTab === 'calls' && <CallLoggerView />}
          {activeTab === 'messages' && <MessageTrackerView />}
          {activeTab === 'network' && <NetworkDataView />}
          {activeTab === 'system' && <SystemMonitorView />}
          {activeTab === 'connectivity' && <ConnectivityView />}
          {activeTab === 'location' && <LocationMapView />}
          {activeTab === 'vault' && <PrivacyAndPermissionsView />}
          {activeTab === 'google-drive' && <GoogleDriveView />}
          {activeTab === 'native-kit' && <AndroidCompanionView />}
        </section>
      </main>

      {/* Footer conforming to domain rules (no telemetry ticker, clean links) */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-800 shrink-0">
              <img
                src="/src/assets/images/avatar_user_profile_1792529056538.jpg"
                alt="Account Holder"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-slate-300 font-medium">PhonePulse Core Daemon</div>
              <div className="text-slate-500 font-mono text-[11px]">Android 15 (API 35) · Telemetry Active</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('vault')}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              AES-256 Vault Architecture
            </button>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <button
              onClick={() => setActiveTab('calls')}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Call Log API
            </button>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <button
              onClick={() => setActiveTab('network')}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Network &amp; Data Tracker
            </button>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <button
              onClick={() => setActiveTab('connectivity')}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              SIM &amp; Hotspot Tethering
            </button>
            <span aria-hidden="true" className="text-slate-800">·</span>
            <button
              onClick={() => setActiveTab('native-kit')}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Android Bridge Kit
            </button>
          </div>
        </div>
      </footer>

      {/* Forensic Activity Detail Inspector Modal */}
      <ActivityDetailModal />

      {/* Simulator Modal */}
      <LiveSimulatorModal />

      {/* Cryptographically Signed Forensic Report Export Modal */}
      <ForensicReportModal />
    </div>
  );
};

export default function App() {
  return (
    <TrackerProvider>
      <TrackerDashboard />
    </TrackerProvider>
  );
}
