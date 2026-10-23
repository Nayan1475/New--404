import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { TrackerPermissions } from '../types/tracker';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  HardDrive,
  Info,
  Calendar,
  Clock,
  ShieldAlert,
  Zap,
} from 'lucide-react';

export const PrivacyAndPermissionsView: React.FC = () => {
  const {
    permissions,
    togglePermission,
    isVaultEncrypted,
    toggleVaultEncryption,
    exportLogs,
    wipeAllLogs,
    resetToSampleData,
    selectedDate,
    retentionPolicyDays,
    lastAutoPurgeTime,
    runManualAutoPurge,
    injectExpiredTestLog,
  } = useTracker();

  const [wipeConfirmOpen, setWipeConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const permissionList: {
    key: keyof TrackerPermissions;
    title: string;
    androidPermission: string;
    purpose: string;
    technicalRole: string;
  }[] = [
    {
      key: 'notificationListener',
      title: 'Notification Access',
      androidPermission: 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
      purpose: 'Capture incoming WhatsApp, Instagram, Snapchat and social chat previews & app call alerts.',
      technicalRole: 'NotificationListenerService intercepts active status-bar notifications in real time.',
    },
    {
      key: 'usageStats',
      title: 'Usage Access & Screen Time',
      androidPermission: 'android.permission.PACKAGE_USAGE_STATS',
      purpose: 'Track screen time per application, foreground session counts, and phone pickups.',
      technicalRole: 'UsageStatsManager calculates daily app usage intervals without accessing in-app content.',
    },
    {
      key: 'accessibilityService',
      title: 'Accessibility Services',
      androidPermission: 'android.accessibilityservice.AccessibilityService',
      purpose: 'Detect precise social app voice/video call start, answer, and termination durations.',
      technicalRole: 'AccessibilityEvent monitors VoIP call UI states on WhatsApp, Messenger, and Telegram.',
    },
    {
      key: 'backgroundLocation',
      title: 'Location (All the time)',
      androidPermission: 'android.permission.ACCESS_BACKGROUND_LOCATION',
      purpose: 'Build chronological daily route map and log 10–15 min GPS waypoint intervals.',
      technicalRole: 'FusedLocationProviderClient runs low-power periodic batch coordinate telemetry.',
    },
    {
      key: 'callLogsAndSms',
      title: 'Call Logs & SMS Access',
      androidPermission: 'android.permission.READ_CALL_LOG & RECEIVE_SMS',
      purpose: 'Log standard cellular phone calls (incoming, outgoing, missed) and incoming bank/transactional SMS.',
      technicalRole: 'Telephony CallLog Provider and SMS_RECEIVED BroadcastReceiver record phone calls & text timestamps.',
    },
    {
      key: 'telephonyReadState',
      title: 'Telephony & SIM Serial State',
      androidPermission: 'android.permission.READ_PHONE_STATE',
      purpose: 'Monitor SIM serial number (ICCID) on Dual-SIM slots and trigger instant alert upon SIM swapping.',
      technicalRole: 'TelephonyManager monitors slot ICCID and cellular carrier state changes.',
    },
    {
      key: 'wifiTethering',
      title: 'Hotspot & Wi-Fi Tethering',
      androidPermission: 'android.permission.TETHER_PRIVILEGED & ACCESS_WIFI_STATE',
      purpose: 'Track device names, MAC addresses, connection times, and tethering bandwidth used by hotspot clients.',
      technicalRole: 'Reads kernel ARP tables (/proc/net/arp) and WifiManager tethering client listeners.',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-500/50 rounded-lg text-xs text-indigo-200 flex items-center justify-between">
          <span>{toastMessage}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
      )}

      {/* Security & Local Vault Hero */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-emerald-400 uppercase">
              Zero-Cloud Privacy Guarantee
            </span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="text-xs font-mono text-slate-400">
              On-Device Encrypted Storage
            </span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            Local Database Encryption &amp; Security Vault
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            In compliance with strict mobile privacy principles, every single log (calls, messages, hotspot connections, and GPS coordinates) is saved <strong>exclusively in your phone's local storage</strong> using hardware-backed <strong>AES-256-GCM encryption</strong>. No telemetry is transmitted to any cloud servers or third parties.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => {
                toggleVaultEncryption();
                showToast(`Vault encryption toggled to: ${!isVaultEncrypted ? 'Active (AES-256)' : 'Plaintext'}`);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isVaultEncrypted
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 border border-amber-500/50 text-amber-300 hover:bg-amber-900/60'
              }`}
            >
              {isVaultEncrypted ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isVaultEncrypted ? 'AES-256 Encryption Active' : 'Encryption Paused (Plaintext)'}</span>
            </button>

            <button
              onClick={() => {
                exportLogs('json');
                showToast(`Exported ${selectedDate} logs as JSON`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Encrypted JSON</span>
            </button>

            <button
              onClick={() => {
                exportLogs('csv');
                showToast(`Exported ${selectedDate} timeline as CSV`);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Timeline CSV</span>
            </button>
          </div>
        </div>

        {/* Visual Hardware Vault Badge Image */}
        <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden border border-slate-800 relative shadow-inner hidden md:block">
          <img
            src="/src/assets/images/device_vault_shield_1792529056233.jpg"
            alt="Hardware Encrypted Vault"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
            <span className="text-[10px] font-mono text-emerald-300 font-semibold">AES-256 KEY</span>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="pb-3 mb-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">
            Required Android Permissions &amp; Technical Capabilities
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed breakdown of system services used to power the activity tracker modules
          </p>
        </div>

        <div className="space-y-3">
          {permissionList.map((perm) => {
            const isGranted = permissions[perm.key];
            return (
              <div
                key={perm.key}
                className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm">{perm.title}</span>
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <code className="text-[11px] font-mono text-indigo-300">{perm.androidPermission}</code>
                  </div>
                  <p className="text-xs text-slate-400">{perm.purpose}</p>
                  <div className="text-[11px] font-mono text-slate-500">
                    Engine: {perm.technicalRole}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded ${
                      isGranted
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {isGranted ? 'Granted' : 'Revoked'}
                  </span>

                  <button
                    onClick={() => {
                      togglePermission(perm.key);
                      showToast(`${perm.title} permission toggled`);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isGranted
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isGranted ? 'Revoke Access' : 'Grant Permission'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-DAY AUTOMATED RETENTION POLICY (72-HOUR AUTO-PURGE) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Automated 3-Day Rolling Data Retention
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                  72-HOUR AUTO-DELETE ACTIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Logs older than 3 days are automatically purged to prevent device storage exhaustion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lastAutoPurgeTime}</span>
          </div>
        </div>

        {/* 3-Day Policy Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
            <div className="text-[11px] text-slate-400">Retention Horizon</div>
            <div className="text-base font-bold text-white font-mono">3 Days (72h)</div>
            <div className="text-[10px] text-slate-500">Today, Yesterday &amp; Oct 18</div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
            <div className="text-[11px] text-slate-400">Auto-Purge Background Daemon</div>
            <div className="text-base font-bold text-emerald-400 font-mono">Continuous (20s)</div>
            <div className="text-[10px] text-slate-500">Runs alongside auto-fetch daemon</div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1">
            <div className="text-[11px] text-slate-400">Anti-Tamper Audit</div>
            <div className="text-base font-bold text-indigo-400 font-mono">Immutable</div>
            <div className="text-[10px] text-slate-500">All purges logged in timeline</div>
          </div>
        </div>

        {/* Action and Test Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
          <div className="text-slate-400 text-[11px]">
            <strong>Compliance Guarantee:</strong> No calls, SMS, WhatsApp records, or GPS coordinates older than 3 calendar days remain on the hardware.
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const res = runManualAutoPurge();
                showToast(res.message);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 rounded-md transition-colors"
              title="Execute retention check and auto-delete any records older than 3 days"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Run Auto-Purge Now</span>
            </button>

            <button
              onClick={() => {
                injectExpiredTestLog();
                showToast('Injected 5-day-old test call. Auto-purge daemon is detecting and deleting it...');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/80 rounded-md transition-colors"
              title="Test: Injects a 5-day-old expired record, which will be immediately detected and auto-deleted"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Test 3-Day Auto-Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dangerous Actions: Wipe Database or Reset Demo Data */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Data Retention &amp; Management</h3>
        <p className="text-xs text-slate-400 mb-4">
          Control how long logs remain on your device or wipe the local database completely.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-slate-950/80 border border-slate-800">
          <div>
            <div className="text-xs font-bold text-slate-200">Reset or Wipe Local Database</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Permanently delete all stored calls, messages, location coordinates, and hotspot client logs.
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetToSampleData();
                showToast('Reset to comprehensive seed demo data.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 rounded-md transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Sample Data</span>
            </button>

            {wipeConfirmOpen ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    wipeAllLogs();
                    setWipeConfirmOpen(false);
                    showToast('All local logs wiped permanently.');
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors"
                >
                  Confirm Wipe
                </button>
                <button
                  onClick={() => setWipeConfirmOpen(false)}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setWipeConfirmOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/50 border border-rose-800/80 hover:bg-rose-900/60 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Wipe All Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
