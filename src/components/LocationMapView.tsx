import React, { useState, useEffect, useRef } from 'react';
import { useTracker } from '../context/TrackerContext';
import { LocationWaypoint } from '../types/tracker';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Compass,
  LocateFixed,
  Clock,
  Battery,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Layers,
  Search,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Coffee,
  Building,
  Home,
  Fuel,
  Train,
  HeartPulse,
  ShoppingBag,
  Dumbbell,
  Crosshair,
} from 'lucide-react';

interface MapPoiItem {
  id: string;
  name: string;
  category: 'cafe' | 'office' | 'home' | 'transit' | 'fuel' | 'hospital' | 'mall' | 'gym';
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewsCount: number;
  isOpen: boolean;
  timings: string;
  description: string;
}

const GOOGLE_MAP_STYLE_POIS: MapPoiItem[] = [
  {
    id: 'poi-home',
    name: 'Home - Indiranagar Villa',
    category: 'home',
    address: '12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
    lat: 12.9716,
    lng: 77.6412,
    rating: 5.0,
    reviewsCount: 1,
    isOpen: true,
    timings: 'Private Residence · 24/7',
    description: 'Home base with verified Wi-Fi beacon ACT-Fibernet-5GHz-Home.',
  },
  {
    id: 'poi-metro',
    name: 'Swami Vivekananda Road Metro Station',
    category: 'transit',
    address: 'Old Madras Rd, Hoysala Nagar, Indiranagar, Bengaluru',
    lat: 12.9642,
    lng: 77.6358,
    rating: 4.4,
    reviewsCount: 2840,
    isOpen: true,
    timings: '05:00 AM – 11:30 PM · Purple Line',
    description: 'Namma Metro terminal connection with cellular cell tower AIR-BLR-892.',
  },
  {
    id: 'poi-coffee',
    name: 'Blue Tokai Coffee Roasters',
    category: 'cafe',
    address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru, Karnataka 560034',
    lat: 12.9344,
    lng: 77.6101,
    rating: 4.6,
    reviewsCount: 1420,
    isOpen: true,
    timings: '07:30 AM – 11:00 PM',
    description: 'Artisanal coffee and co-working workspace with 150 Mbps Wi-Fi.',
  },
  {
    id: 'poi-office',
    name: 'Tech Campus - Global Technology Park',
    category: 'office',
    address: 'Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103',
    lat: 12.9261,
    lng: 77.6762,
    rating: 4.7,
    reviewsCount: 3890,
    isOpen: true,
    timings: 'Open 24 hours · Security Gate #3',
    description: 'Primary corporate engineering office. 5G Standalone indoor micro-cell.',
  },
  {
    id: 'poi-fuel',
    name: 'Shell Fuel Station & EV Supercharger',
    category: 'fuel',
    address: 'Old Airport Road, Kodihalli, Bengaluru',
    lat: 12.9592,
    lng: 77.6521,
    rating: 4.5,
    reviewsCount: 980,
    isOpen: true,
    timings: 'Open 24 hours · EV Fast DC 120kW',
    description: 'Refueling stop and quick convenience store transaction.',
  },
  {
    id: 'poi-hospital',
    name: 'Manipal Hospital & Super Specialty Clinic',
    category: 'hospital',
    address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru',
    lat: 12.9583,
    lng: 77.6489,
    rating: 4.3,
    reviewsCount: 4210,
    isOpen: true,
    timings: 'Open 24 hours · Emergency & Trauma',
    description: 'Health checkup center and verified medical facility landmark.',
  },
  {
    id: 'poi-mall',
    name: 'Nexus Koramangala Mall & IMAX',
    category: 'mall',
    address: 'Hosur Rd, Chikku Lakshmaiah Layout, Koramangala, Bengaluru',
    lat: 12.9351,
    lng: 77.6148,
    rating: 4.6,
    reviewsCount: 12890,
    isOpen: true,
    timings: '10:00 AM – 10:30 PM',
    description: 'Premier retail mall with cinema and indoor dining hub.',
  },
  {
    id: 'poi-gym',
    name: 'Cult.fit Indiranagar Center',
    category: 'gym',
    address: '100 Feet Rd, Indiranagar, Bengaluru',
    lat: 12.9735,
    lng: 77.6428,
    rating: 4.8,
    reviewsCount: 1820,
    isOpen: true,
    timings: '06:00 AM – 10:00 PM',
    description: 'Fitness training center with morning workout check-in.',
  },
];

export const LocationMapView: React.FC = () => {
  const {
    waypoints,
    selectedDate,
    captureRealLocation,
    isLocating,
    setIsSimulatorOpen,
  } = useTracker();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const liveLocationMarkerRef = useRef<L.CircleMarker | null>(null);

  const [mapType, setMapType] = useState<'streets' | 'satellite' | 'dark' | 'osm'>('streets');
  const [selectedPoi, setSelectedPoi] = useState<MapPoiItem | null>(GOOGLE_MAP_STYLE_POIS[0]);
  const [selectedWaypointId, setSelectedWaypointId] = useState<string | null>(waypoints[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayingRoute, setIsPlayingRoute] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [realLocationFeedback, setRealLocationFeedback] = useState<{ success: boolean; message: string; place?: string } | null>(null);
  const [showPois, setShowPois] = useState(true);

  const dayWaypoints = waypoints.filter((w) => w.dateKey === selectedDate);
  const currentSelectedWaypoint = dayWaypoints.find((w) => w.id === selectedWaypointId) || dayWaypoints[0];

  // Tile provider endpoints (Google-Maps-like styling)
  const getTileUrl = (type: 'streets' | 'satellite' | 'dark' | 'osm') => {
    switch (type) {
      case 'streets':
        // CartoDB Voyager: Crisp street map with businesses, parks, roads, building footprints
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      case 'satellite':
        // Esri World Imagery: Real high-resolution satellite imagery
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'dark':
        // CartoDB Dark Matter: Sleek night navigation
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'osm':
        // OpenStreetMap Standard
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const getAttribution = (type: 'streets' | 'satellite' | 'dark' | 'osm') => {
    switch (type) {
      case 'satellite':
        return '&copy; Esri &mdash; Earthstar Geographics, Maxar, GeoEye';
      case 'osm':
        return '&copy; OpenStreetMap contributors';
      default:
        return '&copy; CartoDB &copy; OpenStreetMap contributors';
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center around Bengaluru waypoints
    const centerLat = dayWaypoints[0]?.latitude || 12.9716;
    const centerLng = dayWaypoints[0]?.longitude || 77.6412;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      zoomControl: false, // We will position custom zoom control
    });

    const tileLayer = L.tileLayer(getTileUrl(mapType), {
      attribution: getAttribution(mapType),
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Add controls
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapType changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newLayer = L.tileLayer(getTileUrl(mapType), {
      attribution: getAttribution(mapType),
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [mapType]);

  // Update Markers and Polyline on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Plot Waypoints route polyline
    const routeCoords: [number, number][] = dayWaypoints.map((w) => [w.latitude, w.longitude]);

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
    }

    if (routeCoords.length > 1) {
      const polyline = L.polyline(routeCoords, {
        color: '#6366f1',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
      routePolylineRef.current = polyline;
    }

    // 2. Plot Waypoint Pins
    dayWaypoints.forEach((wp, idx) => {
      const isSelected = wp.id === selectedWaypointId;
      const isLatest = idx === dayWaypoints.length - 1;

      const markerHtml = `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${isSelected ? '#4f46e5' : isLatest ? '#10b981' : '#1e293b'};
          color: white;
          border-radius: 50%;
          border: 2.5px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          font-weight: bold;
          font-size: 11px;
          cursor: pointer;
        ">
          ${idx + 1}
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-wp-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([wp.latitude, wp.longitude], { icon: customIcon });
      marker.bindPopup(`
        <div style="font-family: sans-serif; color: #0f172a; min-width: 180px;">
          <div style="font-weight: 700; font-size: 13px; color: #1e293b;">${wp.placeName}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${wp.address}</div>
          <div style="margin-top: 6px; font-size: 11px; font-weight: 600; color: #4f46e5;">
            ⏰ ${wp.timeFormatted} · Accuracy: ±${wp.accuracyMeters}m
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedWaypointId(wp.id);
      });

      markersGroup.addLayer(marker);
    });

    // 3. Plot Google Maps Style POIs if enabled
    if (showPois) {
      GOOGLE_MAP_STYLE_POIS.forEach((poi) => {
        const poiColor =
          poi.category === 'cafe'
            ? '#d97706'
            : poi.category === 'hospital'
            ? '#e11d48'
            : poi.category === 'fuel'
            ? '#2563eb'
            : poi.category === 'transit'
            ? '#059669'
            : '#7c3aed';

        const poiHtml = `
          <div style="
            position: relative;
            background: ${poiColor};
            color: white;
            padding: 4px 8px;
            border-radius: 14px;
            border: 1.5px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            font-size: 10px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            cursor: pointer;
          ">
            <span>📍</span>
            <span>${poi.name.split(' - ')[0].slice(0, 16)}</span>
          </div>
        `;

        const poiIcon = L.divIcon({
          html: poiHtml,
          className: 'custom-poi-label',
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        });

        const poiMarker = L.marker([poi.lat, poi.lng], { icon: poiIcon });
        poiMarker.on('click', () => {
          setSelectedPoi(poi);
        });

        markersGroup.addLayer(poiMarker);
      });
    }

    // Auto-fit bounds if we have waypoints
    if (routeCoords.length > 0) {
      map.fitBounds(routeCoords, { padding: [50, 50], maxZoom: 15 });
    }
  }, [dayWaypoints, selectedWaypointId, showPois]);

  // Live real GPS tracking watcher
  useEffect(() => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const map = mapInstanceRef.current;
        if (!map) return;

        if (!liveLocationMarkerRef.current) {
          const liveMarker = L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#3b82f6',
            color: '#ffffff',
            weight: 2.5,
            opacity: 1,
            fillOpacity: 0.9,
          }).addTo(map);

          liveMarker.bindTooltip('Current Live Real-Time Position', { permanent: false });
          liveLocationMarkerRef.current = liveMarker;
        } else {
          liveLocationMarkerRef.current.setLatLng([latitude, longitude]);
        }
      },
      (err) => console.log('Geolocation watcher notice:', err.message),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Route playback simulation loop
  useEffect(() => {
    if (!isPlayingRoute || dayWaypoints.length === 0) return;

    const interval = setInterval(() => {
      setReplayIndex((prev) => {
        const next = (prev + 1) % dayWaypoints.length;
        const wp = dayWaypoints[next];
        if (wp && mapInstanceRef.current) {
          mapInstanceRef.current.panTo([wp.latitude, wp.longitude], { animate: true, duration: 1 });
          setSelectedWaypointId(wp.id);
        }
        return next;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isPlayingRoute, dayWaypoints]);

  const handleLiveGPSCheckIn = async () => {
    setRealLocationFeedback(null);
    const res = await captureRealLocation();
    setRealLocationFeedback(res);
    setTimeout(() => {
      setRealLocationFeedback(null);
    }, 6000);
  };

  const handleCenterOnSelected = () => {
    if (!mapInstanceRef.current || !currentSelectedWaypoint) return;
    mapInstanceRef.current.setView(
      [currentSelectedWaypoint.latitude, currentSelectedWaypoint.longitude],
      16,
      { animate: true }
    );
  };

  const handleSearchPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.toLowerCase();
    // Search POIs or waypoints
    const matchedPoi = GOOGLE_MAP_STYLE_POIS.find(
      (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
    );

    if (matchedPoi && mapInstanceRef.current) {
      mapInstanceRef.current.setView([matchedPoi.lat, matchedPoi.lng], 16, { animate: true });
      setSelectedPoi(matchedPoi);
      return;
    }

    const matchedWp = dayWaypoints.find(
      (w) => w.placeName.toLowerCase().includes(q) || w.address.toLowerCase().includes(q)
    );

    if (matchedWp && mapInstanceRef.current) {
      mapInstanceRef.current.setView([matchedWp.latitude, matchedWp.longitude], 16, { animate: true });
      setSelectedWaypointId(matchedWp.id);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'home':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'cafe':
        return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'transit':
        return <Train className="w-4 h-4 text-sky-400" />;
      case 'office':
        return <Building className="w-4 h-4 text-indigo-400" />;
      case 'fuel':
        return <Fuel className="w-4 h-4 text-blue-400" />;
      case 'hospital':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'mall':
        return <ShoppingBag className="w-4 h-4 text-purple-400" />;
      case 'gym':
        return <Dumbbell className="w-4 h-4 text-orange-400" />;
      default:
        return <MapPin className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar & Map Layer Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white tracking-tight">
                Realistic Geo-Location Map
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                GOOGLE MAPS ENGINE
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>Street names, business POIs, satellite imagery &amp; GPS trail</span>
              <span aria-hidden="true">·</span>
              <span>Date: {selectedDate}</span>
            </div>
          </div>

          {/* Quick Actions & Live GPS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLiveGPSCheckIn}
              disabled={isLocating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 hover:bg-emerald-900/60 disabled:opacity-50 rounded-lg transition-colors"
            >
              <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Acquiring GPS...' : 'Log Live Device GPS'}</span>
            </button>

            <button
              onClick={() => setIsPlayingRoute(!isPlayingRoute)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isPlayingRoute
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isPlayingRoute ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlayingRoute ? 'Pause Route' : 'Play Journey'}</span>
            </button>

            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Waypoint</span>
            </button>
          </div>
        </div>

        {/* Feedback alert */}
        {realLocationFeedback && (
          <div
            className={`mt-3 p-3 rounded-md text-xs flex items-center gap-2 ${
              realLocationFeedback.success
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-800 text-rose-300'
            }`}
          >
            {realLocationFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{realLocationFeedback.message}</span>
          </div>
        )}

        {/* Search & Style Filter Strip */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearchPlace} className="w-full sm:w-80 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search place, Starbucks, Metro, Hospital..."
              className="w-full pl-8 pr-16 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] rounded font-medium"
            >
              Find
            </button>
          </form>

          {/* Map Layer Mode Switcher (Street, Satellite, Dark, OSM) */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5" />
              Layer:
            </span>
            <button
              onClick={() => setMapType('streets')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                mapType === 'streets'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Street Map
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                mapType === 'satellite'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType('dark')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                mapType === 'dark'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Dark Mode
            </button>
            <button
              onClick={() => setShowPois(!showPois)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
                showPois
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              {showPois ? 'POIs Visible' : 'POIs Hidden'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Real Interactive Leaflet Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col relative h-[500px]">
          {/* Map DOM Element */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Top Floating Overlay info */}
          <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg shadow-lg flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">{dayWaypoints.length} GPS Waypoints</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="text-slate-400 font-mono text-[11px]">
              {GOOGLE_MAP_STYLE_POIS.length} Places of Interest
            </div>
            <button
              onClick={handleCenterOnSelected}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded transition-colors"
              title="Center on selected waypoint"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Floating Legend */}
          <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg shadow-lg hidden sm:flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Route Trail</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
              <span>Live Real Device GPS</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Cafes &amp; Places</span>
            </span>
          </div>
        </div>

        {/* Selected Place & Waypoint Inspector Sidebar */}
        <div className="space-y-4">
          {/* Selected POI Inspector Card */}
          {selectedPoi && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-800">
                    {getCategoryIcon(selectedPoi.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{selectedPoi.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <span className="text-amber-400 font-semibold font-mono">★ {selectedPoi.rating}</span>
                      <span>({selectedPoi.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  Open Now
                </span>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed font-mono">
                {selectedPoi.address}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedPoi.description}
              </p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Timings: {selectedPoi.timings}</span>
                <button
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([selectedPoi.lat, selectedPoi.lng], 16, { animate: true });
                    }
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Pan to Place →
                </button>
              </div>
            </div>
          )}

          {/* Chronological Waypoints Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-200">Day Waypoint Timeline</span>
              <span className="text-[11px] font-mono text-slate-500">{dayWaypoints.length} stops</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {dayWaypoints.map((wp, idx) => {
                const isSelected = wp.id === selectedWaypointId;
                return (
                  <button
                    key={wp.id}
                    onClick={() => {
                      setSelectedWaypointId(wp.id);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([wp.latitude, wp.longitude], 16, { animate: true });
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-700 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 truncate">{wp.placeName}</span>
                        <span className="text-[10px] font-mono text-slate-500">{wp.timeFormatted}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{wp.address}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                        <span>Speed: {wp.speedKmh} km/h</span>
                        <span>·</span>
                        <span>Dwell: {wp.dwellTimeMinutes}m</span>
                        <span>·</span>
                        <span>Battery: {wp.batteryLevel}%</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
