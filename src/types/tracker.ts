export type ActivityCategory = 'calls' | 'messages' | 'location' | 'connectivity' | 'system';

export type CallChannel = 'cellular' | 'whatsapp' | 'instagram' | 'telegram' | 'messenger';
export type CallType = 'incoming' | 'outgoing' | 'missed' | 'rejected';
export type CallMedia = 'voice' | 'video';

export interface CallLogItem {
  id: string;
  type: CallType;
  channel: CallChannel;
  contactName: string;
  phoneNumberOrHandle: string;
  rawPhoneNumber?: string;
  whatsappJid?: string;
  whatsappVerified?: boolean;
  timestamp: string; // ISO string
  timeFormatted: string; // "10:14 AM"
  dateKey: string; // "2026-10-20"
  durationSeconds: number;
  callMedia: CallMedia;
  notes?: string;
  simSlot?: number;
  carrier?: string;
  codec?: string;
  towerId?: string;
  conversationSnippet?: string;
  deletedOnPhone?: boolean;
  deletedOnPhoneAt?: string;
  immutableHash?: string;
  permanentPreserved?: boolean;
}

export type MessageSource = 'sms' | 'whatsapp' | 'instagram' | 'snapchat' | 'telegram';

export interface MessageLogItem {
  id: string;
  source: MessageSource;
  direction: 'incoming' | 'outgoing';
  sender: string;
  senderHandleOrNumber: string;
  preview: string;
  fullMessageText?: string;
  notificationTitle?: string;
  notificationSubtext?: string;
  packageName?: string;
  notificationChannelId?: string;
  timestamp: string;
  timeFormatted: string;
  dateKey: string;
  capturedVia: 'SMS Receiver' | 'Notification Listener Service';
  isStarred?: boolean;
  hasAttachment?: boolean;
  attachmentType?: string;
  deletedOnPhone?: boolean;
  deletedOnPhoneAt?: string;
  immutableHash?: string;
  permanentPreserved?: boolean;
}

export interface AppInstallItem {
  id: string;
  appName: string;
  packageName: string;
  installedAt: string;
  timeFormatted: string;
  dateKey: string;
  sizeMb: number;
  category: string;
  sourceStore: string;
  iconColor: string;
}

export interface AppDataUsageItem {
  packageName: string;
  appName: string;
  wifiMb: number;
  mobileMb: number;
  totalMb: number;
  foregroundMb?: number;
  backgroundMb?: number;
  uploadMb?: number;
  downloadMb?: number;
  category: string;
}

export interface SimDataUsageItem {
  slotIndex: number;
  carrier: string;
  phoneNumber: string;
  networkType: string;
  usedMb: number;
  dailyLimitMb: number;
  unlimited5g: boolean;
  resetTime: string;
  uploadMb: number;
  downloadMb: number;
  signalStrengthDbm: number;
}

export interface WifiSessionItem {
  id: string;
  ssid: string;
  bssid: string;
  connectedAt: string;
  timeFormatted: string;
  durationMinutes: number;
  dataUsedMb: number;
  frequency: string;
  speedMbps: number;
  locationLabel: string;
  dateKey?: string;
}

export interface HourlyDataLogItem {
  id: string;
  timeRange: string;
  hour: number;
  wifiMb: number;
  mobileMb: number;
  totalMb: number;
  topApps: string[];
  primaryActivity: string;
  dateKey?: string;
  simSlot?: number;
}

export type NetworkUnit = 'MB' | 'GB' | 'BOTH';


export interface AppScreenTimeItem {
  packageName: string;
  appName: string;
  durationMinutes: number;
  category: string;
  sessionsCount: number;
  percentageOfDay: number;
}

export interface HourlyScreenTime {
  hour: number; // 0-23
  label: string; // "9 AM"
  screenMinutes: number;
  pickups: number;
}

export interface SimCardInfo {
  slotIndex: number;
  carrier: string;
  iccid: string; // SIM Serial e.g. 89918700234891234F
  imsi: string;
  networkType: string; // "5G Standalone", "4G LTE"
  signalDbm: number;
  status: 'active' | 'changed' | 'roaming' | 'inactive';
  phoneNumber: string;
}

export interface SimEventLog {
  id: string;
  timestamp: string;
  timeFormatted: string;
  dateKey: string;
  event: 'sim_inserted' | 'sim_removed' | 'sim_swapped' | 'network_changed' | 'roaming_active';
  details: string;
  slotIndex: number;
}

export interface HotspotDevice {
  id: string;
  deviceName: string;
  macAddress: string;
  ipAddress: string;
  connectedAt: string;
  disconnectedAt: string | null;
  dataConsumedMb: number;
  status: 'connected' | 'disconnected' | 'blocked';
  connectionType: '5GHz Wi-Fi 6' | '2.4GHz Wi-Fi 5';
}

export interface LocationWaypoint {
  id: string;
  timestamp: string;
  timeFormatted: string;
  dateKey: string;
  latitude: number;
  longitude: number;
  placeName: string;
  address: string;
  accuracyMeters: number;
  activity: 'still' | 'in_vehicle' | 'walking' | 'cycling';
  speedKmh: number;
  dwellTimeMinutes: number;
  batteryLevel: number;
  categoryTag?: 'home' | 'work' | 'cafe' | 'transit' | 'shopping' | 'hospital' | 'gym' | 'station';
  isPoi?: boolean;
}

export interface UnifiedTimelineItem {
  id: string;
  category: ActivityCategory;
  timestamp: string;
  timeFormatted: string;
  dateKey: string;
  title: string;
  description: string;
  badge: string;
  iconName: string;
  severity?: 'normal' | 'notice' | 'alert';
  details?: Record<string, string | number | boolean>;
  entityId?: string; // Links to exact call/message/location record
  deletedOnPhone?: boolean;
  permanentPreserved?: boolean;
}

export interface TrackerPermissions {
  notificationListener: boolean;
  usageStats: boolean;
  accessibilityService: boolean;
  backgroundLocation: boolean;
  callLogsAndSms: boolean;
  telephonyReadState: boolean;
  wifiTethering: boolean;
}

export interface SystemStatsSummary {
  screenOnMinutes: number;
  pickupsCount: number;
  totalDataMb: number;
  mobileDataMb: number;
  wifiDataMb: number;
  callsCount: number;
  messagesCount: number;
  hotspotClientsActive: number;
  distanceTraveledKm: number;
}

export type InspectorEntity =
  | { type: 'call'; data: CallLogItem }
  | { type: 'message'; data: MessageLogItem }
  | { type: 'timeline'; data: UnifiedTimelineItem };
