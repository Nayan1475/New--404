import React from 'react';
import { useTracker } from '../context/TrackerContext';
import { 
  Clock, 
  PhoneCall, 
  MessageSquare, 
  Wifi, 
  HardDrive, 
  Navigation, 
  Smartphone 
} from 'lucide-react';

export const MetricCards: React.FC = () => {
  const { summaryStats, setActiveTab } = useTracker();

  const hours = Math.floor(summaryStats.screenOnMinutes / 60);
  const minutes = summaryStats.screenOnMinutes % 60;
  const screenTimeFormatted = `${hours}h ${minutes}m`;
  const totalDataGb = (summaryStats.totalDataMb / 1024).toFixed(2);

  const cards = [
    {
      title: 'Screen Time',
      value: screenTimeFormatted,
      secondary: `${summaryStats.pickupsCount} phone pickups today`,
      icon: <Clock className="w-4 h-4 text-indigo-400" />,
      tab: 'system' as const,
      kicker: 'UsageStats API',
    },
    {
      title: 'Calls Logged',
      value: `${summaryStats.callsCount}`,
      secondary: 'Cellular & Social App Calls',
      icon: <PhoneCall className="w-4 h-4 text-emerald-400" />,
      tab: 'calls' as const,
      kicker: 'Call Log & Audio API',
    },
    {
      title: 'Messages Captured',
      value: `${summaryStats.messagesCount}`,
      secondary: 'SMS & WhatsApp / Insta alerts',
      icon: <MessageSquare className="w-4 h-4 text-sky-400" />,
      tab: 'messages' as const,
      kicker: 'Notification Listener',
    },
    {
      title: 'Data Consumed',
      value: `${totalDataGb} GB`,
      secondary: `${summaryStats.mobileDataMb} MB 5G · ${(summaryStats.wifiDataMb / 1024).toFixed(1)} GB Wi-Fi`,
      icon: <HardDrive className="w-4 h-4 text-amber-400" />,
      tab: 'network' as const,
      kicker: 'NetworkStatsManager',
    },
    {
      title: 'Active Hotspot Clients',
      value: `${summaryStats.hotspotClientsActive}`,
      secondary: 'Tethering on 5GHz Wi-Fi 6',
      icon: <Wifi className="w-4 h-4 text-purple-400" />,
      tab: 'connectivity' as const,
      kicker: 'Tethering Manager',
    },
    {
      title: 'Distance Traveled',
      value: `${summaryStats.distanceTraveledKm} km`,
      secondary: '5 waypoints visited today',
      icon: <Navigation className="w-4 h-4 text-teal-400" />,
      tab: 'location' as const,
      kicker: 'FusedLocationProvider',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => (
        <button
          key={idx}
          onClick={() => setActiveTab(card.tab)}
          className="text-left bg-slate-900 border border-slate-800 rounded-lg p-3.5 hover:border-slate-700 hover:bg-slate-850 transition-all group focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-400 transition-colors truncate">
              {card.kicker}
            </span>
            <div className="p-1 rounded bg-slate-800/80 group-hover:bg-slate-800 transition-colors">
              {card.icon}
            </div>
          </div>
          <div className="text-xs text-slate-400 font-medium">{card.title}</div>
          <div className="text-xl font-bold text-white tracking-tight font-mono tabular-nums mt-0.5">
            {card.value}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {card.secondary}
          </div>
        </button>
      ))}
    </div>
  );
};
