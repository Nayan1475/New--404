import React, { useState } from 'react';
import { useTracker } from '../context/TrackerContext';
import { CallChannel, CallType, CallMedia, MessageSource } from '../types/tracker';
import {
  X,
  PhoneCall,
  MessageSquare,
  Radio,
  Wifi,
  DownloadCloud,
  MapPin,
  AlertTriangle,
  Zap,
  Check,
} from 'lucide-react';

export const LiveSimulatorModal: React.FC = () => {
  const {
    isSimulatorOpen,
    setIsSimulatorOpen,
    selectedDate,
    addCall,
    addMessage,
    addAppInstall,
    connectHotspotDevice,
    addWaypoint,
    triggerSimSwapAlert,
    logNetworkEvent,
  } = useTracker();

  const [activeTab, setActiveTab] = useState<'call' | 'message' | 'network' | 'hotspot' | 'app' | 'location'>('call');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Network form state
  const [netAppName, setNetAppName] = useState('YouTube 4K');
  const [netMb, setNetMb] = useState('450');
  const [netSource, setNetSource] = useState<'sim1' | 'sim2' | 'wifi'>('sim1');
  const [netActivity, setNetActivity] = useState('4K Ultra HD Video Streaming Spike');

  // Call form state
  const [callContact, setCallContact] = useState('Vikram Malhotra');
  const [callNumber, setCallNumber] = useState('+91 98450 33221');
  const [callChannel, setCallChannel] = useState<CallChannel>('whatsapp');
  const [callType, setCallType] = useState<CallType>('incoming');
  const [callMedia, setCallMedia] = useState<CallMedia>('voice');
  const [callDuration, setCallDuration] = useState('240'); // seconds

  // Message form state
  const [msgSender, setMsgSender] = useState('ICICI-Alert');
  const [msgHandle, setMsgHandle] = useState('TX-ICICIBK');
  const [msgSource, setMsgSource] = useState<MessageSource>('sms');
  const [msgPreview, setMsgPreview] = useState('Acct XX3091 credited with INR 85,000.00 on 20-OCT-26 by Salary NEFT.');

  // Hotspot form state
  const [hsDeviceName, setHsDeviceName] = useState("Ananya's iPhone 15 Pro");
  const [hsMac, setHsMac] = useState('A4:83:E7:22:19:CD');

  // App install form state
  const [appName, setAppName] = useState('Zerodha Kite: Stock Trading');
  const [appPkg, setAppPkg] = useState('com.zerodha.kite3');
  const [appSize, setAppSize] = useState('48.5');
  const [appCategory, setAppCategory] = useState('Finance');

  // Location form state
  const [placeName, setPlaceName] = useState('Phoenix Marketcity Mall');
  const [address, setAddress] = useState('Whitefield Main Rd, Mahadevapura, Bengaluru');
  const [lat, setLat] = useState('12.9961');
  const [lng, setLng] = useState('77.6966');

  if (!isSimulatorOpen) return null;

  const triggerNotice = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => {
      setSuccessNotice(null);
      setIsSimulatorOpen(false);
    }, 1200);
  };

  const handleSimulateCall = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const cleanDigits = callNumber.replace(/[^0-9]/g, '');
    const isWa = callChannel === 'whatsapp';
    const whatsappJid = isWa ? `${cleanDigits || '919845033221'}@s.whatsapp.net` : undefined;

    addCall({
      type: callType,
      channel: callChannel,
      contactName: callContact,
      phoneNumberOrHandle: callNumber,
      rawPhoneNumber: callNumber,
      whatsappJid,
      whatsappVerified: isWa,
      timestamp: now.toISOString(),
      timeFormatted,
      dateKey: selectedDate,
      durationSeconds: parseInt(callDuration) || 0,
      callMedia,
      notes: `Simulated live ${callChannel} call test event${isWa ? ` · Verified WA Number: ${callNumber}` : ''}`,
    });

    triggerNotice(`Logged ${callChannel} call from ${callContact} (${callNumber})`);
  };

  const handleSimulateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addMessage({
      source: msgSource,
      direction: 'incoming',
      sender: msgSender,
      senderHandleOrNumber: msgHandle,
      preview: msgPreview,
      timestamp: now.toISOString(),
      timeFormatted,
      dateKey: selectedDate,
      capturedVia: msgSource === 'sms' ? 'SMS Receiver' : 'Notification Listener Service',
    });

    triggerNotice(`Captured ${msgSource} notification from ${msgSender}`);
  };

  const handleSimulateHotspot = (e: React.FormEvent) => {
    e.preventDefault();
    const randomIp = `192.168.43.${Math.floor(Math.random() * 80) + 120}`;

    connectHotspotDevice({
      deviceName: hsDeviceName,
      macAddress: hsMac,
      ipAddress: randomIp,
      connectedAt: new Date().toISOString(),
      disconnectedAt: null,
      dataConsumedMb: 52.4,
      status: 'connected',
      connectionType: '5GHz Wi-Fi 6',
    });

    triggerNotice(`Tethered device connected: ${hsDeviceName}`);
  };

  const handleSimulateApp = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addAppInstall({
      appName,
      packageName: appPkg,
      installedAt: now.toISOString(),
      timeFormatted,
      dateKey: selectedDate,
      sizeMb: parseFloat(appSize) || 45.0,
      category: appCategory,
      sourceStore: 'Google Play Store',
      iconColor: '#3b82f6',
    });

    triggerNotice(`New app install logged: ${appName}`);
  };

  const handleSimulateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    addWaypoint({
      timestamp: now.toISOString(),
      timeFormatted,
      dateKey: selectedDate,
      latitude: parseFloat(lat) || 12.9716,
      longitude: parseFloat(lng) || 77.6412,
      placeName,
      address,
      accuracyMeters: 6,
      activity: 'in_vehicle',
      speedKmh: 34.5,
      dwellTimeMinutes: 30,
      batteryLevel: 80,
    });

    triggerNotice(`Recorded GPS waypoint: ${placeName}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-indigo-600 text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Activity Simulator</h3>
              <p className="text-[11px] text-slate-400">Trigger simulated Android OS intents &amp; background logs</p>
            </div>
          </div>

          <button
            onClick={() => setIsSimulatorOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs">
          {[
            { id: 'call', label: 'Call Log', icon: <PhoneCall className="w-3.5 h-3.5" /> },
            { id: 'message', label: 'Message / Chat', icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: 'hotspot', label: 'Hotspot Device', icon: <Wifi className="w-3.5 h-3.5" /> },
            { id: 'app', label: 'App Install', icon: <DownloadCloud className="w-3.5 h-3.5" /> },
            { id: 'location', label: 'Location GPS', icon: <MapPin className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Notice Banner */}
        {successNotice && (
          <div className="m-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-xs text-emerald-200 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successNotice}</span>
          </div>
        )}

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {/* CALL SIMULATOR */}
          {activeTab === 'call' && (
            <form onSubmit={handleSimulateCall} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={callContact}
                  onChange={(e) => setCallContact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">
                    {callChannel === 'whatsapp' ? 'WhatsApp Phone Number' : 'Phone / Handle'}
                  </label>
                  <input
                    type="text"
                    value={callNumber}
                    onChange={(e) => setCallNumber(e.target.value)}
                    placeholder={callChannel === 'whatsapp' ? '+91 98450 33221' : '+91 98200 11223'}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                    required
                  />
                  {callChannel === 'whatsapp' && (
                    <span className="text-[10px] text-emerald-400 mt-1 block">
                      Auto-resolves to JID: {callNumber.replace(/[^0-9]/g, '') || '919845033221'}@s.whatsapp.net
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Duration (Seconds)</label>
                  <input
                    type="number"
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Channel</label>
                  <select
                    value={callChannel}
                    onChange={(e) => setCallChannel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="cellular">Cellular Phone</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="telegram">Telegram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Call Type</label>
                  <select
                    value={callType}
                    onChange={(e) => setCallType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="incoming">Incoming</option>
                    <option value="outgoing">Outgoing</option>
                    <option value="missed">Missed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Media</label>
                  <select
                    value={callMedia}
                    onChange={(e) => setCallMedia(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="voice">Voice</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded transition-colors"
              >
                Inject Call Event
              </button>
            </form>
          )}

          {/* MESSAGE SIMULATOR */}
          {activeTab === 'message' && (
            <form onSubmit={handleSimulateMessage} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={msgSender}
                    onChange={(e) => setMsgSender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Source App</label>
                  <select
                    value={msgSource}
                    onChange={(e) => setMsgSource(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="sms">SMS Text (Telephony)</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram Direct</option>
                    <option value="snapchat">Snapchat</option>
                    <option value="telegram">Telegram</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Message Preview Content</label>
                <textarea
                  rows={3}
                  value={msgPreview}
                  onChange={(e) => setMsgPreview(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded transition-colors"
              >
                Inject Message Notification
              </button>
            </form>
          )}

          {/* HOTSPOT SIMULATOR */}
          {activeTab === 'hotspot' && (
            <form onSubmit={handleSimulateHotspot} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Client Device Name</label>
                <input
                  type="text"
                  value={hsDeviceName}
                  onChange={(e) => setHsDeviceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hardware MAC Address</label>
                <input
                  type="text"
                  value={hsMac}
                  onChange={(e) => setHsMac(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded transition-colors"
              >
                Connect Hotspot Client
              </button>
            </form>
          )}

          {/* APP INSTALL SIMULATOR */}
          {activeTab === 'app' && (
            <form onSubmit={handleSimulateApp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">App Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Package Name</label>
                  <input
                    type="text"
                    value={appPkg}
                    onChange={(e) => setAppPkg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Size (MB)</label>
                  <input
                    type="number"
                    value={appSize}
                    onChange={(e) => setAppSize(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  value={appCategory}
                  onChange={(e) => setAppCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded transition-colors"
              >
                Log App Installation
              </button>
            </form>
          )}

          {/* LOCATION SIMULATOR */}
          {activeTab === 'location' && (
            <form onSubmit={handleSimulateLocation} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Place Name</label>
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Latitude</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Longitude</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white rounded transition-colors"
              >
                Log GPS Waypoint
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
