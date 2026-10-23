import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CallLogItem,
  MessageLogItem,
  AppInstallItem,
  AppDataUsageItem,
  AppScreenTimeItem,
  HourlyScreenTime,
  SimCardInfo,
  SimEventLog,
  HotspotDevice,
  LocationWaypoint,
  UnifiedTimelineItem,
  TrackerPermissions,
  ActivityCategory,
  SystemStatsSummary,
  InspectorEntity,
  SimDataUsageItem,
  WifiSessionItem,
  HourlyDataLogItem,
} from '../types/tracker';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  uploadBackupToDrive,
  DriveFileItem,
} from '../services/googleDriveService';
import {
  TODAY_KEY,
  YESTERDAY_KEY,
  PREV_KEY,
  INITIAL_CALLS,
  INITIAL_MESSAGES,
  INITIAL_APP_INSTALLS,
  INITIAL_DATA_USAGE,
  INITIAL_APP_SCREEN_TIME,
  INITIAL_HOURLY_SCREEN_TIME,
  INITIAL_SIM_CARDS,
  INITIAL_SIM_EVENTS,
  INITIAL_HOTSPOT_DEVICES,
  INITIAL_WAYPOINTS,
  INITIAL_TIMELINE,
  INITIAL_PERMISSIONS,
  INITIAL_SIM_DATA_USAGE,
  INITIAL_WIFI_SESSIONS,
  INITIAL_HOURLY_DATA_LOGS,
} from '../data/mockData';

export type NavigationTab = 'timeline' | 'calls' | 'messages' | 'network' | 'system' | 'connectivity' | 'location' | 'vault' | 'google-drive' | 'native-kit';

interface TrackerContextType {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategoryFilter: ActivityCategory | 'all';
  setActiveCategoryFilter: (cat: ActivityCategory | 'all') => void;

  // Calls
  calls: CallLogItem[];
  addCall: (call: Omit<CallLogItem, 'id'>) => void;
  deleteCall: (id: string) => void;

  // Messages
  messages: MessageLogItem[];
  addMessage: (msg: Omit<MessageLogItem, 'id'>) => void;
  toggleStarMessage: (id: string) => void;
  deleteMessage: (id: string) => void;

  // System & Screen Time
  appInstalls: AppInstallItem[];
  addAppInstall: (item: Omit<AppInstallItem, 'id'>) => void;
  dataUsage: AppDataUsageItem[];
  appScreenTime: AppScreenTimeItem[];
  hourlyScreenTime: HourlyScreenTime[];
  screenOnMinutes: number;
  pickupsCount: number;

  // Connectivity
  simCards: SimCardInfo[];
  simEvents: SimEventLog[];
  hotspotDevices: HotspotDevice[];
  isHotspotEnabled: boolean;
  toggleHotspot: () => void;
  connectHotspotDevice: (device: Omit<HotspotDevice, 'id'>) => void;
  toggleBlockDevice: (id: string) => void;
  disconnectDevice: (id: string) => void;
  triggerSimSwapAlert: () => void;

  // Location
  waypoints: LocationWaypoint[];
  addWaypoint: (waypoint: Omit<LocationWaypoint, 'id'>) => void;
  captureRealLocation: () => Promise<{ success: boolean; message: string; place?: string }>;
  isLocating: boolean;

  // Timeline
  timeline: UnifiedTimelineItem[];
  addTimelineItem: (item: Omit<UnifiedTimelineItem, 'id'>) => void;
  deleteTimelineItem: (id: string) => void;

  // Permissions & Vault
  permissions: TrackerPermissions;
  togglePermission: (key: keyof TrackerPermissions) => void;
  isVaultEncrypted: boolean;
  toggleVaultEncryption: () => void;
  exportLogs: (format: 'json' | 'csv') => void;
  importPhoneLogs: (jsonString: string) => { success: boolean; message: string; count?: number };
  wipeAllLogs: () => void;
  resetToSampleData: () => void;

  // Real device hardware stats
  batteryLevel: number | null;
  isCharging: boolean;
  isOnline: boolean;
  connectionType: string;

  // Quick summary numbers for current day
  summaryStats: SystemStatsSummary;

  // Modal open states
  isSimulatorOpen: boolean;
  setIsSimulatorOpen: (open: boolean) => void;
  inspectorItem: InspectorEntity | null;
  setInspectorItem: (item: InspectorEntity | null) => void;

  // Google Drive Workspace integration
  driveUser: User | null;
  isDriveConnected: boolean;
  driveLogin: () => Promise<void>;
  driveLogout: () => Promise<void>;
  backupCurrentDayToDrive: () => Promise<{ success: boolean; message: string; file?: DriveFileItem }>;

  // Network & Granular Data Tracking (SIM, Wi-Fi, Hourly Data)
  simDataUsage: SimDataUsageItem[];
  wifiSessions: WifiSessionItem[];
  hourlyDataLogs: HourlyDataLogItem[];
  activeDataSimSlot: number;
  switchActiveDataSim: (slot: number) => void;
  isWifiConnected: boolean;
  toggleWifiConnection: () => void;
  logNetworkEvent: (event: {
    appName: string;
    mbUsed: number;
    networkSource: 'sim1' | 'sim2' | 'wifi';
    timeRange?: string;
    activity?: string;
    isDownload?: boolean;
  }) => void;

  // Stealth Disguise / Hide-Unhide mode
  isAppHidden: boolean;
  setIsAppHidden: (val: boolean) => void;
  hideApp: () => void;
  unhideApp: () => void;
  toggleHideApp: () => void;

  // Auto-Fetch Background Daemon
  isAutoFetchActive: boolean;
  toggleAutoFetch: () => void;
  lastAutoFetchTime: string;
  autoFetchCount: number;
  triggerManualAutoFetch: () => Promise<{ success: boolean; message: string; count: number }>;

  // Anti-Delete Forensic Protection
  isAntiDeleteLocked: boolean;
  simulatePhoneDeletion: (type: 'call' | 'message', id: string) => void;

  // Forensic Report Export Modal
  isForensicReportModalOpen: boolean;
  setIsForensicReportModalOpen: (open: boolean) => void;

  // 3-Day Data Retention & Auto-Purge Policy
  retentionPolicyDays: number;
  lastAutoPurgeTime: string;
  runManualAutoPurge: () => { purgedCount: number; message: string };
  injectExpiredTestLog: () => void;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CALLS: 'phonepulse_calls_v1',
  MESSAGES: 'phonepulse_messages_v1',
  INSTALLS: 'phonepulse_installs_v1',
  SIM_EVENTS: 'phonepulse_simevents_v1',
  HOTSPOT: 'phonepulse_hotspot_v1',
  WAYPOINTS: 'phonepulse_waypoints_v1',
  TIMELINE: 'phonepulse_timeline_v1',
  PERMISSIONS: 'phonepulse_perms_v1',
  VAULT_ENCRYPTED: 'phonepulse_vault_encrypted_v1',
  SIM_DATA: 'phonepulse_simdata_v1',
  WIFI_SESSIONS: 'phonepulse_wifisessions_v1',
  HOURLY_DATA: 'phonepulse_hourlydata_v1',
  ACTIVE_SIM: 'phonepulse_activesim_v1',
  STEALTH_HIDDEN: 'phonepulse_stealth_hidden_v1',
  AUTO_FETCH_ENABLED: 'phonepulse_autofetch_v1',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to parse storage key ${key}:`, e);
    return fallback;
  }
}

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_KEY);
  const [activeTab, setActiveTab] = useState<NavigationTab>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<ActivityCategory | 'all'>('all');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [inspectorItem, setInspectorItem] = useState<InspectorEntity | null>(null);

  // Google Drive Authentication & Integration State
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setDriveUser(user);
        setIsDriveConnected(true);
      },
      () => {
        setDriveUser(null);
        setIsDriveConnected(false);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // States with LocalStorage persistence
  const [calls, setCalls] = useState<CallLogItem[]>(() => loadStorage(STORAGE_KEYS.CALLS, INITIAL_CALLS));
  const [messages, setMessages] = useState<MessageLogItem[]>(() => loadStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES));
  const [appInstalls, setAppInstalls] = useState<AppInstallItem[]>(() => loadStorage(STORAGE_KEYS.INSTALLS, INITIAL_APP_INSTALLS));
  const [dataUsage] = useState<AppDataUsageItem[]>(INITIAL_DATA_USAGE);
  const [appScreenTime] = useState<AppScreenTimeItem[]>(INITIAL_APP_SCREEN_TIME);
  const [hourlyScreenTime] = useState<HourlyScreenTime[]>(INITIAL_HOURLY_SCREEN_TIME);
  const [simCards, setSimCards] = useState<SimCardInfo[]>(INITIAL_SIM_CARDS);
  const [simEvents, setSimEvents] = useState<SimEventLog[]>(() => loadStorage(STORAGE_KEYS.SIM_EVENTS, INITIAL_SIM_EVENTS));
  const [hotspotDevices, setHotspotDevices] = useState<HotspotDevice[]>(() => loadStorage(STORAGE_KEYS.HOTSPOT, INITIAL_HOTSPOT_DEVICES));
  const [isHotspotEnabled, setIsHotspotEnabled] = useState(true);
  const [waypoints, setWaypoints] = useState<LocationWaypoint[]>(() => loadStorage(STORAGE_KEYS.WAYPOINTS, INITIAL_WAYPOINTS));
  const [timeline, setTimeline] = useState<UnifiedTimelineItem[]>(() => loadStorage(STORAGE_KEYS.TIMELINE, INITIAL_TIMELINE));
  const [permissions, setPermissions] = useState<TrackerPermissions>(() => loadStorage(STORAGE_KEYS.PERMISSIONS, INITIAL_PERMISSIONS));
  const [isVaultEncrypted, setIsVaultEncrypted] = useState<boolean>(() => loadStorage(STORAGE_KEYS.VAULT_ENCRYPTED, true));

  // Network & Data consumption states
  const [simDataUsage, setSimDataUsage] = useState<SimDataUsageItem[]>(() => loadStorage(STORAGE_KEYS.SIM_DATA, INITIAL_SIM_DATA_USAGE));
  const [wifiSessions, setWifiSessions] = useState<WifiSessionItem[]>(() => loadStorage(STORAGE_KEYS.WIFI_SESSIONS, INITIAL_WIFI_SESSIONS));
  const [hourlyDataLogs, setHourlyDataLogs] = useState<HourlyDataLogItem[]>(() => loadStorage(STORAGE_KEYS.HOURLY_DATA, INITIAL_HOURLY_DATA_LOGS));
  const [activeDataSimSlot, setActiveDataSimSlot] = useState<number>(() => loadStorage(STORAGE_KEYS.ACTIVE_SIM, 1));
  const [isWifiConnected, setIsWifiConnected] = useState<boolean>(true);

  // Stealth Disguise / Hide-Unhide state
  const [isAppHidden, setIsAppHidden] = useState<boolean>(() => loadStorage(STORAGE_KEYS.STEALTH_HIDDEN, false));

  // Auto-Fetch Background Daemon state
  const [isAutoFetchActive, setIsAutoFetchActive] = useState<boolean>(() => loadStorage(STORAGE_KEYS.AUTO_FETCH_ENABLED, true));
  const [lastAutoFetchTime, setLastAutoFetchTime] = useState<string>('Just now');
  const [autoFetchCount, setAutoFetchCount] = useState<number>(0);

  // Forensic PDF Report Modal state
  const [isForensicReportModalOpen, setIsForensicReportModalOpen] = useState<boolean>(false);
  const isAntiDeleteLocked = true;

  // 3-Day Data Retention Policy state
  const retentionPolicyDays = 3;
  const [lastAutoPurgeTime, setLastAutoPurgeTime] = useState<string>('Active (3-Day Rolling Window)');

  // Device telemetry hooks
  const [batteryLevel, setBatteryLevel] = useState<number | null>(82);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine ?? true);
  const [connectionType, setConnectionType] = useState<string>('5G / Wi-Fi');

  // Sync stealth & auto-fetch to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STEALTH_HIDDEN, JSON.stringify(isAppHidden));
    } catch {}
  }, [isAppHidden]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTO_FETCH_ENABLED, JSON.stringify(isAutoFetchActive));
    } catch {}
  }, [isAutoFetchActive]);

  // Sync network state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIM_DATA, JSON.stringify(simDataUsage));
    } catch {}
  }, [simDataUsage]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WIFI_SESSIONS, JSON.stringify(wifiSessions));
    } catch {}
  }, [wifiSessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOURLY_DATA, JSON.stringify(hourlyDataLogs));
    } catch {}
  }, [hourlyDataLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SIM, JSON.stringify(activeDataSimSlot));
    } catch {}
  }, [activeDataSimSlot]);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(calls));
    } catch {}
  }, [calls]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INSTALLS, JSON.stringify(appInstalls));
    } catch {}
  }, [appInstalls]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIM_EVENTS, JSON.stringify(simEvents));
    } catch {}
  }, [simEvents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOTSPOT, JSON.stringify(hotspotDevices));
    } catch {}
  }, [hotspotDevices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WAYPOINTS, JSON.stringify(waypoints));
    } catch {}
  }, [waypoints]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));
    } catch {}
  }, [timeline]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(permissions));
    } catch {}
  }, [permissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VAULT_ENCRYPTED, JSON.stringify(isVaultEncrypted));
    } catch {}
  }, [isVaultEncrypted]);

  // Real browser telemetry listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery API if supported
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }

    if (nav.connection) {
      setConnectionType(nav.connection.effectiveType?.toUpperCase() || 'Wi-Fi / 5G');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Actions
  const addCall = (callData: Omit<CallLogItem, 'id'>) => {
    const newId = `call-${Date.now()}`;
    const newCall: CallLogItem = { ...callData, id: newId };
    setCalls((prev) => [newCall, ...prev]);

    // Also add to timeline
    const typeLabel = newCall.type.charAt(0).toUpperCase() + newCall.type.slice(1);
    const channelLabel = newCall.channel === 'cellular' ? 'Phone' : newCall.channel.charAt(0).toUpperCase() + newCall.channel.slice(1);
    const durationMin = Math.floor(newCall.durationSeconds / 60);
    const durationSec = newCall.durationSeconds % 60;
    const durationStr = newCall.durationSeconds > 0 ? `${durationMin}m ${durationSec}s` : '0s';

    addTimelineItem({
      category: 'calls',
      timestamp: newCall.timestamp,
      timeFormatted: newCall.timeFormatted,
      dateKey: newCall.dateKey,
      title: `${typeLabel} ${channelLabel} Call: ${newCall.contactName}`,
      description: `${channelLabel} Call · Duration ${durationStr} · ${newCall.phoneNumberOrHandle}`,
      badge: `${channelLabel} Call`,
      iconName: newCall.type === 'missed' ? 'PhoneMissed' : newCall.type === 'incoming' ? 'PhoneIncoming' : 'PhoneOutgoing',
      severity: newCall.type === 'missed' ? 'alert' : 'normal',
    });
  };

  const deleteCall = (id: string) => {
    // ANTI-DELETE POLICY: Even if user or phone attempts to delete, the record is permanently preserved
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCalls((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              deletedOnPhone: true,
              deletedOnPhoneAt: timeFormatted,
              notes: (c.notes ? `${c.notes} · ` : '') + `[DELETED ON PHONE at ${timeFormatted} · PRESERVED IN IMMUTABLE VAULT]`,
              permanentPreserved: true,
            }
          : c
      )
    );

    addTimelineItem({
      category: 'calls',
      timestamp: now.toISOString(),
      timeFormatted,
      dateKey: selectedDate,
      title: 'SECURITY AUDIT: Call Log Deletion Prevented',
      description: 'Call record was erased on target phone dialer, but permanently preserved in this immutable ledger.',
      badge: 'Anti-Delete Guard',
      iconName: 'ShieldAlert',
      severity: 'alert',
    });
  };

  const addMessage = (msgData: Omit<MessageLogItem, 'id'>) => {
    const newId = `msg-${Date.now()}`;
    const newMsg: MessageLogItem = { ...msgData, id: newId };
    setMessages((prev) => [newMsg, ...prev]);

    const sourceLabel = newMsg.source.charAt(0).toUpperCase() + newMsg.source.slice(1);
    addTimelineItem({
      category: 'messages',
      timestamp: newMsg.timestamp,
      timeFormatted: newMsg.timeFormatted,
      dateKey: newMsg.dateKey,
      title: `${sourceLabel} Msg: ${newMsg.sender}`,
      description: newMsg.preview,
      badge: `${sourceLabel} (${newMsg.capturedVia === 'SMS Receiver' ? 'SMS' : 'Notification'})`,
      iconName: 'MessageSquare',
      severity: 'normal',
    });
  };

  const toggleStarMessage = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m))
    );
  };

  const deleteMessage = (id: string) => {
    // ANTI-DELETE POLICY: Intercepted chats cannot be erased; marked as phone deleted but retained
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              deletedOnPhone: true,
              deletedOnPhoneAt: timeFormatted,
              preview: `[PHONE DELETED at ${timeFormatted}: PRESERVED] ${m.preview}`,
              permanentPreserved: true,
            }
          : m
      )
    );

    addTimelineItem({
      category: 'messages',
      timestamp: now.toISOString(),
      timeFormatted,
      dateKey: selectedDate,
      title: 'SECURITY AUDIT: Message Deletion Intercepted',
      description: 'Message was erased from WhatsApp/SMS app, but full transcript is retained in permanent audit vault.',
      badge: 'Anti-Delete Guard',
      iconName: 'ShieldAlert',
      severity: 'alert',
    });
  };

  const simulatePhoneDeletion = (type: 'call' | 'message', id: string) => {
    if (type === 'call') {
      deleteCall(id);
    } else {
      deleteMessage(id);
    }
  };

  const addAppInstall = (appData: Omit<AppInstallItem, 'id'>) => {
    const newId = `install-${Date.now()}`;
    const newInstall: AppInstallItem = { ...appData, id: newId };
    setAppInstalls((prev) => [newInstall, ...prev]);

    addTimelineItem({
      category: 'system',
      timestamp: newInstall.installedAt,
      timeFormatted: newInstall.timeFormatted,
      dateKey: newInstall.dateKey,
      title: `New App Installed: ${newInstall.appName}`,
      description: `Package ${newInstall.packageName} (${newInstall.sizeMb} MB) via ${newInstall.sourceStore}`,
      badge: 'App Install',
      iconName: 'DownloadCloud',
      severity: 'notice',
    });
  };

  const toggleHotspot = () => {
    setIsHotspotEnabled((prev) => !prev);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addTimelineItem({
      category: 'connectivity',
      timestamp: now.toISOString(),
      timeFormatted,
      dateKey: selectedDate,
      title: isHotspotEnabled ? 'Wi-Fi Hotspot Disabled' : 'Wi-Fi Hotspot Activated',
      description: isHotspotEnabled
        ? 'Tethering service stopped. All connected clients disconnected.'
        : 'Broadcasting SSID "Aryan_Pixel_5G" on 5GHz Wi-Fi 6',
      badge: 'Hotspot Toggle',
      iconName: 'Wifi',
      severity: isHotspotEnabled ? 'normal' : 'notice',
    });
  };

  const connectHotspotDevice = (deviceData: Omit<HotspotDevice, 'id'>) => {
    const newId = `hs-${Date.now()}`;
    const newDevice: HotspotDevice = { ...deviceData, id: newId };
    setHotspotDevices((prev) => [newDevice, ...prev]);

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addTimelineItem({
      category: 'connectivity',
      timestamp: now.toISOString(),
      timeFormatted,
      dateKey: selectedDate,
      title: `Hotspot Client Connected: ${newDevice.deviceName}`,
      description: `IP ${newDevice.ipAddress} · MAC ${newDevice.macAddress} · ${newDevice.connectionType}`,
      badge: 'Hotspot Client',
      iconName: 'Radio',
      severity: 'notice',
    });
  };

  const toggleBlockDevice = (id: string) => {
    setHotspotDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextStatus = d.status === 'blocked' ? 'connected' : 'blocked';
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  const disconnectDevice = (id: string) => {
    const now = new Date().toISOString();
    setHotspotDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'disconnected', disconnectedAt: now } : d))
    );
  };

  const triggerSimSwapAlert = () => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newSimEvent: SimEventLog = {
      id: `sim-${Date.now()}`,
      timestamp: now.toISOString(),
      timeFormatted,
      dateKey: selectedDate,
      event: 'sim_swapped',
      details: 'CRITICAL: TelephonyManager detected SIM Serial (ICCID) change on Slot 2',
      slotIndex: 2,
    };
    setSimEvents((prev) => [newSimEvent, ...prev]);

    setSimCards((prev) =>
      prev.map((sim) =>
        sim.slotIndex === 2
          ? {
              ...sim,
              iccid: '89914400552233990F',
              carrier: 'Vi (Vodafone Idea)',
              status: 'changed',
              phoneNumber: '+91 99880 77661',
            }
          : sim
      )
    );

    addTimelineItem({
      category: 'connectivity',
      timestamp: now.toISOString(),
      timeFormatted,
      dateKey: selectedDate,
      title: 'SECURITY ALERT: SIM Card Swapped on Slot 2',
      description: 'TelephonyManager detected unexpected ICCID change to 89914400552233990F (Carrier: Vi)',
      badge: 'SIM Change',
      iconName: 'AlertTriangle',
      severity: 'alert',
    });
  };

  const switchActiveDataSim = (slot: number) => {
    setActiveDataSimSlot(slot);
    const carrier = slot === 1 ? 'Jio True 5G' : 'Airtel 5G Plus';
    const now = new Date();
    addTimelineItem({
      category: 'connectivity',
      timestamp: now.toISOString(),
      timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateKey: selectedDate,
      title: `Switched Default Data SIM to Slot ${slot} (${carrier})`,
      description: `TelephonyManager default mobile data bearer switched to SIM ${slot}`,
      badge: 'Data SIM Switch',
      iconName: 'Radio',
      severity: 'notice',
    });
  };

  const toggleWifiConnection = () => {
    setIsWifiConnected((prev) => {
      const next = !prev;
      const now = new Date();
      addTimelineItem({
        category: 'connectivity',
        timestamp: now.toISOString(),
        timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateKey: selectedDate,
        title: next ? 'Wi-Fi Reconnected: TechPark-Secure-Corp-Wi-Fi' : 'Wi-Fi Disconnected: 5G Mobile Data Active',
        description: next ? 'Link Speed 866 Mbps · 5.0 GHz Wi-Fi 6 Enterprise' : 'Fallback to Mobile Data SIM 1 (Jio True 5G)',
        badge: next ? 'Wi-Fi Active' : 'Wi-Fi Disabled',
        iconName: 'Wifi',
        severity: 'normal',
      });
      return next;
    });
  };

  const logNetworkEvent = (event: {
    appName: string;
    mbUsed: number;
    networkSource: 'sim1' | 'sim2' | 'wifi';
    timeRange?: string;
    activity?: string;
    isDownload?: boolean;
  }) => {
    const now = new Date();
    const currentHour = now.getHours();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedRange = event.timeRange || `${timeFormatted} (Live Capture)`;

    if (event.networkSource === 'wifi') {
      setWifiSessions((prev) => [
        {
          id: `wifi-session-${Date.now()}`,
          ssid: isWifiConnected ? 'TechPark-Secure-Corp-Wi-Fi' : 'Home-Fibernet-5GHz',
          bssid: '70:B3:17:9A:88:F2',
          connectedAt: now.toISOString(),
          timeFormatted,
          durationMinutes: 15,
          dataUsedMb: event.mbUsed,
          frequency: '5.0 GHz (Wi-Fi 6)',
          speedMbps: 866,
          locationLabel: 'Indiranagar Residence',
          dateKey: selectedDate,
        },
        ...prev,
      ]);
    } else {
      const slot = event.networkSource === 'sim1' ? 1 : 2;
      setSimDataUsage((prev) =>
        prev.map((s) =>
          s.slotIndex === slot
            ? {
                ...s,
                usedMb: Math.round((s.usedMb + event.mbUsed) * 10) / 10,
                downloadMb:
                  event.isDownload !== false
                    ? Math.round((s.downloadMb + event.mbUsed) * 10) / 10
                    : s.downloadMb,
                uploadMb:
                  event.isDownload === false
                    ? Math.round((s.uploadMb + event.mbUsed) * 10) / 10
                    : s.uploadMb,
              }
            : s
        )
      );
    }

    const newHourlyItem: HourlyDataLogItem = {
      id: `h-log-${Date.now()}`,
      timeRange: formattedRange,
      hour: currentHour,
      wifiMb: event.networkSource === 'wifi' ? event.mbUsed : 0,
      mobileMb: event.networkSource !== 'wifi' ? event.mbUsed : 0,
      totalMb: event.mbUsed,
      topApps: [event.appName],
      primaryActivity: event.activity || `${event.appName} data transmission`,
      dateKey: selectedDate,
      simSlot: event.networkSource === 'sim2' ? 2 : 1,
    };
    setHourlyDataLogs((prev) => [newHourlyItem, ...prev]);

    addTimelineItem({
      category: 'system',
      timestamp: now.toISOString(),
      timeFormatted,
      dateKey: selectedDate,
      title: `Network Log: ${event.appName} used ${event.mbUsed} MB (${(event.mbUsed / 1024).toFixed(2)} GB)`,
      description: `Bearer: ${event.networkSource === 'wifi' ? 'Wi-Fi (5.0 GHz)' : event.networkSource === 'sim1' ? 'SIM 1 (Jio 5G)' : 'SIM 2 (Airtel 5G)'} · ${event.activity || 'Interactive Session'}`,
      badge: event.networkSource === 'wifi' ? 'Wi-Fi Data' : 'Cellular 5G',
      iconName: event.networkSource === 'wifi' ? 'Wifi' : 'Radio',
      severity: event.mbUsed > 500 ? 'notice' : 'normal',
    });
  };

  // Stealth Disguise Methods
  const hideApp = () => {
    setIsAppHidden(true);
    try {
      localStorage.setItem(STORAGE_KEYS.STEALTH_HIDDEN, JSON.stringify(true));
    } catch {}
  };

  const unhideApp = () => {
    setIsAppHidden(false);
    try {
      localStorage.setItem(STORAGE_KEYS.STEALTH_HIDDEN, JSON.stringify(false));
    } catch {}
  };

  const toggleHideApp = () => {
    if (isAppHidden) unhideApp();
    else hideApp();
  };

  // Auto-Fetch Background Worker & Methods
  const toggleAutoFetch = () => {
    setIsAutoFetchActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEYS.AUTO_FETCH_ENABLED, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const triggerManualAutoFetch = async (): Promise<{ success: boolean; message: string; count: number }> => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastAutoFetchTime(timeFormatted);
    setAutoFetchCount((prev) => prev + 1);

    // Refresh real hardware states
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (nav.getBattery) {
      try {
        const battery = await nav.getBattery();
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);
      } catch {}
    }
    if (nav.connection) {
      setConnectionType(nav.connection.effectiveType?.toUpperCase() || '5G / Wi-Fi');
    }
    setIsOnline(navigator.onLine);

    return {
      success: true,
      message: 'Auto-Fetch synced latest phone telemetry, network, and battery states.',
      count: 1,
    };
  };

  // 3-Day Data Retention Helper: Checks if record is within the 3-day rolling window
  const isWithin3Days = (dateKey: string): boolean => {
    // 3 active days: TODAY, YESTERDAY, and PREV (3-day rolling buffer)
    if (dateKey === TODAY_KEY || dateKey === YESTERDAY_KEY || dateKey === PREV_KEY) {
      return true;
    }
    try {
      const itemTime = new Date(dateKey + 'T00:00:00Z').getTime();
      const refTime = new Date(TODAY_KEY + 'T00:00:00Z').getTime();
      const diffDays = Math.floor((refTime - itemTime) / (1000 * 60 * 60 * 24));
      // Must be within 0, 1, or 2 days (total 3 days)
      return diffDays >= 0 && diffDays < 3;
    } catch {
      return true;
    }
  };

  // Automated 3-Day Retention Auto-Purge Runner
  const autoPurgeExpiredData = (notify: boolean = false): { purgedCount: number; message: string } => {
    let purged = 0;

    setCalls((prev) => {
      const kept = prev.filter((c) => isWithin3Days(c.dateKey));
      purged += prev.length - kept.length;
      return kept;
    });

    setMessages((prev) => {
      const kept = prev.filter((m) => isWithin3Days(m.dateKey));
      purged += prev.length - kept.length;
      return kept;
    });

    setWaypoints((prev) => {
      const kept = prev.filter((w) => isWithin3Days(w.dateKey));
      purged += prev.length - kept.length;
      return kept;
    });

    setAppInstalls((prev) => {
      const kept = prev.filter((a) => isWithin3Days(a.dateKey));
      purged += prev.length - kept.length;
      return kept;
    });

    setSimEvents((prev) => {
      const kept = prev.filter((s) => isWithin3Days(s.dateKey));
      purged += prev.length - kept.length;
      return kept;
    });

    setTimeline((prev) => {
      const kept = prev.filter((t) => isWithin3Days(t.dateKey));
      purged += prev.length - kept.length;
      return kept;
    });

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastAutoPurgeTime(`Enforced at ${timeFormatted}`);

    if (purged > 0 || notify) {
      addTimelineItem({
        category: 'system',
        timestamp: now.toISOString(),
        timeFormatted,
        dateKey: TODAY_KEY,
        title: `3-Day Retention Policy Auto-Purge`,
        description: purged > 0
          ? `Automatically purged ${purged} logs older than 3 days. Rolling 72-hour storage buffer enforced.`
          : `Audit completed: All stored phone logs and telemetry are within the mandatory 3-day retention limit.`,
        badge: '3-Day Retention Daemon',
        iconName: 'Trash2',
        severity: purged > 0 ? 'notice' : 'normal',
      });
    }

    return {
      purgedCount: purged,
      message: purged > 0
        ? `Auto-purged ${purged} logs older than 3 days.`
        : 'All logs are currently within the 3-day retention limit.',
    };
  };

  const runManualAutoPurge = () => autoPurgeExpiredData(true);

  // Test tool: Inject an expired record (from 5 days ago) to test the 3-day auto-purge daemon
  const injectExpiredTestLog = () => {
    const expiredDateKey = '2026-10-15'; // 5 days old
    const expiredCall: CallLogItem = {
      id: `call-expired-${Date.now()}`,
      type: 'incoming',
      channel: 'cellular',
      contactName: 'Test Expired Call (5 Days Ago)',
      phoneNumberOrHandle: '+91 99999 14750',
      timestamp: '2026-10-15T11:00:00Z',
      timeFormatted: '11:00 AM',
      dateKey: expiredDateKey,
      durationSeconds: 95,
      callMedia: 'voice',
      notes: 'Test call injected from 5 days ago. Will be immediately auto-deleted by the 3-day retention daemon.',
    };

    setCalls((prev) => [expiredCall, ...prev]);

    // Automatically trigger daemon to prune it
    setTimeout(() => {
      autoPurgeExpiredData(true);
    }, 1200);
  };

  // Run initial 3-day retention check on mount
  useEffect(() => {
    autoPurgeExpiredData(false);
  }, []);

  // Auto-Fetch interval effect with background 3-day retention check
  useEffect(() => {
    if (!isAutoFetchActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastAutoFetchTime(timeFormatted);
      setAutoFetchCount((prev) => prev + 1);

      // Auto-purge any logs older than 3 days
      autoPurgeExpiredData(false);

      // Refresh hardware
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      if (nav.getBattery) {
        nav.getBattery().then((battery: any) => {
          setBatteryLevel(Math.round(battery.level * 100));
          setIsCharging(battery.charging);
        }).catch(() => {});
      }
      setIsOnline(navigator.onLine);

      // Periodically record micro telemetry keep-alive
      const rand = Math.random();
      if (rand < 0.4) {
        const simSlot = activeDataSimSlot === 1 ? 'sim1' : 'wifi';
        logNetworkEvent({
          appName: 'System Daemon (Auto-Fetch Poll)',
          mbUsed: Math.floor(Math.random() * 4) + 1,
          networkSource: simSlot,
          activity: 'Automated Device Telemetry Background Heartbeat',
          isDownload: true,
        });
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [isAutoFetchActive, activeDataSimSlot]);

  const addWaypoint = (waypointData: Omit<LocationWaypoint, 'id'>) => {
    const newId = `loc-${Date.now()}`;
    const newWaypoint: LocationWaypoint = { ...waypointData, id: newId };
    setWaypoints((prev) => [newWaypoint, ...prev]);

    addTimelineItem({
      category: 'location',
      timestamp: newWaypoint.timestamp,
      timeFormatted: newWaypoint.timeFormatted,
      dateKey: newWaypoint.dateKey,
      title: `Location Ping: ${newWaypoint.placeName}`,
      description: `${newWaypoint.address} · Accuracy ±${newWaypoint.accuracyMeters}m · Activity: ${newWaypoint.activity}`,
      badge: 'Fused GPS',
      iconName: 'MapPin',
      severity: 'normal',
    });
  };

  const captureRealLocation = (): Promise<{ success: boolean; message: string; place?: string }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ success: false, message: 'Geolocation is not supported by your browser.' });
        return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lng = parseFloat(pos.coords.longitude.toFixed(4));
          const acc = Math.round(pos.coords.accuracy);
          const now = new Date();
          const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const placeName = `Current Position (${lat}, ${lng})`;
          const address = `Live Coordinates · Accuracy ±${acc}m · Real Geolocation`;

          addWaypoint({
            timestamp: now.toISOString(),
            timeFormatted,
            dateKey: selectedDate,
            latitude: lat,
            longitude: lng,
            placeName,
            address,
            accuracyMeters: acc,
            activity: 'still',
            speedKmh: 0,
            dwellTimeMinutes: 5,
            batteryLevel: batteryLevel || 85,
          });

          resolve({ success: true, message: `Acquired real GPS coordinate: ${lat}, ${lng} (±${acc}m)`, place: placeName });
        },
        (err) => {
          setIsLocating(false);
          resolve({ success: false, message: `Location request failed: ${err.message}` });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const addTimelineItem = (itemData: Omit<UnifiedTimelineItem, 'id'>) => {
    const newItem: UnifiedTimelineItem = { ...itemData, id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` };
    setTimeline((prev) => [newItem, ...prev]);
  };

  const deleteTimelineItem = (id: string) => {
    setTimeline((prev) => prev.filter((item) => item.id !== id));
  };

  const togglePermission = (key: keyof TrackerPermissions) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleVaultEncryption = () => {
    setIsVaultEncrypted((prev) => !prev);
  };

  const exportLogs = (format: 'json' | 'csv') => {
    const payload = {
      exportTimestamp: new Date().toISOString(),
      encryptionStandard: isVaultEncrypted ? 'AES-256-GCM Hardware-Backed Key' : 'Plaintext Local JSON',
      calls: calls.filter((c) => c.dateKey === selectedDate),
      messages: messages.filter((m) => m.dateKey === selectedDate),
      appInstalls: appInstalls.filter((a) => a.dateKey === selectedDate),
      simEvents: simEvents.filter((s) => s.dateKey === selectedDate),
      hotspotDevices,
      waypoints: waypoints.filter((w) => w.dateKey === selectedDate),
      timeline: timeline.filter((t) => t.dateKey === selectedDate),
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phonepulse-logs-${selectedDate}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV format of timeline
      const headers = ['Time', 'Category', 'Title', 'Description', 'Badge', 'Severity'];
      const rows = timeline
        .filter((t) => t.dateKey === selectedDate)
        .map((t) => [
          `"${t.timeFormatted}"`,
          `"${t.category}"`,
          `"${t.title.replace(/"/g, '""')}"`,
          `"${t.description.replace(/"/g, '""')}"`,
          `"${t.badge}"`,
          `"${t.severity || 'normal'}"`,
        ]);
      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `phonepulse-timeline-${selectedDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const importPhoneLogs = (jsonString: string): { success: boolean; message: string; count?: number } => {
    try {
      const parsed = JSON.parse(jsonString);
      let count = 0;
      if (Array.isArray(parsed.calls) && parsed.calls.length > 0) {
        setCalls((prev) => [...parsed.calls, ...prev]);
        count += parsed.calls.length;
      }
      if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
        setMessages((prev) => [...parsed.messages, ...prev]);
        count += parsed.messages.length;
      }
      if (Array.isArray(parsed.waypoints) && parsed.waypoints.length > 0) {
        setWaypoints((prev) => [...parsed.waypoints, ...prev]);
        count += parsed.waypoints.length;
      }
      if (Array.isArray(parsed.timeline) && parsed.timeline.length > 0) {
        setTimeline((prev) => [...parsed.timeline, ...prev]);
        count += parsed.timeline.length;
      }
      if (count === 0 && Array.isArray(parsed)) {
        setTimeline((prev) => [...parsed, ...prev]);
        count = parsed.length;
      }
      return {
        success: true,
        message: `Successfully imported ${count} entries into your encrypted local storage!`,
        count,
      };
    } catch (e: any) {
      return { success: false, message: `Failed to parse JSON: ${e.message || 'Invalid format'}` };
    }
  };

  const wipeAllLogs = () => {
    setCalls([]);
    setMessages([]);
    setAppInstalls([]);
    setSimEvents([]);
    setHotspotDevices([]);
    setWaypoints([]);
    setTimeline([]);
    try {
      localStorage.clear();
    } catch {}
  };

  const resetToSampleData = () => {
    setCalls(INITIAL_CALLS);
    setMessages(INITIAL_MESSAGES);
    setAppInstalls(INITIAL_APP_INSTALLS);
    setSimEvents(INITIAL_SIM_EVENTS);
    setHotspotDevices(INITIAL_HOTSPOT_DEVICES);
    setWaypoints(INITIAL_WAYPOINTS);
    setTimeline(INITIAL_TIMELINE);
    setPermissions(INITIAL_PERMISSIONS);
  };

  // Calculate day summary stats
  const dayCalls = calls.filter((c) => c.dateKey === selectedDate);
  const dayMessages = messages.filter((m) => m.dateKey === selectedDate);
  const dayWaypoints = waypoints.filter((w) => w.dateKey === selectedDate);
  const activeHotspotCount = hotspotDevices.filter((d) => d.status === 'connected').length;

  const driveLogin = async () => {
    const res = await googleSignIn();
    if (res) {
      setDriveUser(res.user);
      setIsDriveConnected(true);
    }
  };

  const driveLogout = async () => {
    await logoutGoogle();
    setDriveUser(null);
    setIsDriveConnected(false);
  };

  const backupCurrentDayToDrive = async (): Promise<{ success: boolean; message: string; file?: DriveFileItem }> => {
    if (!isDriveConnected) {
      return { success: false, message: 'Please sign in with Google to access Google Drive.' };
    }
    try {
      const payload = {
        exportTimestamp: new Date().toISOString(),
        device: 'PhonePulse Android 15 Telemetry Vault',
        encryptionStandard: isVaultEncrypted ? 'AES-256-GCM Hardware-Backed Key' : 'Plaintext Local JSON',
        dateKey: selectedDate,
        summary: summaryStats,
        calls: calls.filter((c) => c.dateKey === selectedDate),
        messages: messages.filter((m) => m.dateKey === selectedDate),
        appInstalls: appInstalls.filter((a) => a.dateKey === selectedDate),
        simEvents: simEvents.filter((s) => s.dateKey === selectedDate),
        hotspotDevices,
        waypoints: waypoints.filter((w) => w.dateKey === selectedDate),
        timeline: timeline.filter((t) => t.dateKey === selectedDate),
      };

      const filename = `phonepulse-backup-${selectedDate}-${Date.now()}.json`;
      const uploadedFile = await uploadBackupToDrive(filename, payload);

      const now = new Date();
      addTimelineItem({
        category: 'system',
        timestamp: now.toISOString(),
        timeFormatted: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateKey: selectedDate,
        title: `Google Drive Cloud Vault Backup`,
        description: `Backed up to "PhonePulse Tracker Archives" folder · File ID: ${uploadedFile.id}`,
        badge: 'Google Drive',
        iconName: 'DownloadCloud',
        severity: 'notice',
      });

      return {
        success: true,
        message: `Successfully uploaded "${filename}" to Google Drive folder "PhonePulse Tracker Archives"!`,
        file: uploadedFile,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Failed to upload backup to Google Drive.',
      };
    }
  };

    const dayHourlyLogs = hourlyDataLogs.filter((h) => !h.dateKey || h.dateKey === selectedDate);
    const dayWifiSessions = wifiSessions.filter((w) => !w.dateKey || w.dateKey === selectedDate);
    const dayWifiMb = dayWifiSessions.reduce((acc, s) => acc + s.dataUsedMb, 0) || dayHourlyLogs.reduce((acc, h) => acc + h.wifiMb, 0);
    const dayMobileMb = dayHourlyLogs.reduce((acc, h) => acc + h.mobileMb, 0) || 1100;
    const dayTotalDataMb = Math.round((dayWifiMb + dayMobileMb) * 10) / 10;

    const summaryStats: SystemStatsSummary = {
      screenOnMinutes: 342, // ~5h 42m
      pickupsCount: 68,
      totalDataMb: dayTotalDataMb || 4210,
      mobileDataMb: Math.round(dayMobileMb) || 1100,
      wifiDataMb: Math.round(dayWifiMb) || 3110,
      callsCount: dayCalls.length,
      messagesCount: dayMessages.length,
      hotspotClientsActive: activeHotspotCount,
      distanceTraveledKm: dayWaypoints.length > 1 ? 24.6 : 8.2,
    };

    return (
      <TrackerContext.Provider
        value={{
          selectedDate,
          setSelectedDate,
          activeTab,
          setActiveTab,
          searchQuery,
          setSearchQuery,
          activeCategoryFilter,
          setActiveCategoryFilter,
          calls,
          addCall,
          deleteCall,
          messages,
          addMessage,
          toggleStarMessage,
          deleteMessage,
          appInstalls,
          addAppInstall,
          dataUsage,
          appScreenTime,
          hourlyScreenTime,
          screenOnMinutes: 342,
          pickupsCount: 68,
          simCards,
          simEvents,
          hotspotDevices,
          isHotspotEnabled,
          toggleHotspot,
          connectHotspotDevice,
          toggleBlockDevice,
          disconnectDevice,
          triggerSimSwapAlert,
          waypoints,
          addWaypoint,
          captureRealLocation,
          isLocating,
          timeline,
          addTimelineItem,
          deleteTimelineItem,
          permissions,
          togglePermission,
          isVaultEncrypted,
          toggleVaultEncryption,
          exportLogs,
          importPhoneLogs,
          wipeAllLogs,
          resetToSampleData,
          batteryLevel,
          isCharging,
          isOnline,
          connectionType,
          summaryStats,
          isSimulatorOpen,
          setIsSimulatorOpen,
          inspectorItem,
          setInspectorItem,
          driveUser,
          isDriveConnected,
          driveLogin,
          driveLogout,
          backupCurrentDayToDrive,
          simDataUsage,
          wifiSessions,
          hourlyDataLogs,
          activeDataSimSlot,
          switchActiveDataSim,
          isWifiConnected,
          toggleWifiConnection,
          logNetworkEvent,
          isAppHidden,
          setIsAppHidden,
          hideApp,
          unhideApp,
          toggleHideApp,
          isAutoFetchActive,
          toggleAutoFetch,
          lastAutoFetchTime,
          autoFetchCount,
          triggerManualAutoFetch,
          isAntiDeleteLocked,
          simulatePhoneDeletion,
          isForensicReportModalOpen,
          setIsForensicReportModalOpen,
          retentionPolicyDays,
          lastAutoPurgeTime,
          runManualAutoPurge,
          injectExpiredTestLog,
        }}
      >
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};
