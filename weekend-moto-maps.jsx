import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Navigation, Clock, Wallet } from 'lucide-react';

export default function WeekEndPlanner() {
  const [selectedWeekend, setSelectedWeekend] = useState('11-12-juil');
  const [activeRoute, setActiveRoute] = useState('morbihan');
  const [leafletReady, setLeafletReady] = useState(false);
  const [routingDistance, setRoutingDistance] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerGroup = useRef(null);

  const weekends = {
    '4-5-juil': { label: '4-5 Juillet', season: 'Début saison', bayeux: [80, 90], vannes: [90, 110], rochelle: [100, 130], note: '✅ Bons prix', tone: 'good' },
    '11-12-juil': { label: '11-12 Juillet', season: 'Francofolies', bayeux: [85, 100], vannes: [100, 120], rochelle: [140, 180], note: '⚠️ Cher', tone: 'warn' },
    '18-19-juil': { label: '18-19 Juillet', season: 'Pic estival', bayeux: [90, 110], vannes: [110, 130], rochelle: [120, 150], note: '⚠️ Touristique', tone: 'warn' },
    '22-23-aou': { label: '22-23 Août', season: 'Post-estival', bayeux: [75, 90], vannes: [85, 100], rochelle: [95, 120], note: '✅ Bons prix', tone: 'good' },
    '12-13-sep': { label: '12-13 Septembre', season: 'Basse saison', bayeux: [55, 70], vannes: [60, 75], rochelle: [70, 90], note: '✅✅ Top prix', tone: 'best' }
  };

  const data = weekends[selectedWeekend];

  const routes = {
    morbihan: {
      title: 'Golfe du Morbihan',
      shortTitle: 'Morbihan',
      subtitle: 'Côte bretonne authentique',
      color: '#06b6d4',
      colorDark: '#0891b2',
      distance: '320 km',
      driveTime: '7h30 total',
      hotelKey: 'vannes',
      hotelName: 'Vannes centre',
      center: [48.1, -2.6],
      zoom: 8,
      waypoints: [
        { name: 'Fréhel', coords: [48.68, -2.32], type: 'start', day: 'Départ' },
        { name: 'Dinan', coords: [48.46, -2.05], type: 'stop', day: 'Sam midi' },
        { name: 'Vannes', coords: [47.66, -2.76], type: 'sleep', day: 'Sam soir 🛏' },
        { name: 'Carnac', coords: [47.58, -3.08], type: 'stop', day: 'Dim matin' },
        { name: 'Auray', coords: [47.66, -2.98], type: 'stop', day: 'Dim midi' },
        { name: 'Fréhel', coords: [48.68, -2.32], type: 'end', day: 'Dim soir' }
      ],
      highlights: ['🌊 Côte bretonne authentique', '🏍️ Routes D768/D34 sinueuses', '⚓ Ferry possible vers les îles', '🏛 Menhirs de Carnac']
    },
    vendee: {
      title: 'Vendée Côtière',
      shortTitle: 'Vendée',
      subtitle: 'La Rochelle & plages atlantiques',
      color: '#f59e0b',
      colorDark: '#d97706',
      distance: '440 km',
      driveTime: '8h30 total',
      hotelKey: 'rochelle',
      hotelName: 'La Rochelle',
      center: [47.4, -1.9],
      zoom: 7,
      waypoints: [
        { name: 'Fréhel', coords: [48.68, -2.32], type: 'start', day: 'Départ' },
        { name: 'Vannes', coords: [47.66, -2.76], type: 'stop', day: 'Sam midi' },
        { name: 'La Rochelle', coords: [46.16, -1.15], type: 'sleep', day: 'Sam soir 🛏' },
        { name: 'Île de Ré', coords: [46.20, -1.37], type: 'stop', day: 'Dim matin' },
        { name: 'Fontenay-le-Comte', coords: [46.47, -0.80], type: 'stop', day: 'Dim aprem' },
        { name: 'Fréhel', coords: [48.68, -2.32], type: 'end', day: 'Dim soir' }
      ],
      highlights: ['🌅 Plages longues & sauvages', '🏰 La Rochelle portuaire', '🌉 Île de Ré sublime', '🏍️ Routes variées (intérieur + côte)']
    },
    normandie: {
      title: 'Normandie D-Day',
      shortTitle: 'Normandie',
      subtitle: 'Bayeux & route D514 mythique',
      color: '#10b981',
      colorDark: '#059669',
      distance: '330 km',
      driveTime: '7h30 total',
      hotelKey: 'bayeux',
      hotelName: 'ibis budget Bayeux',
      center: [49.0, -1.5],
      zoom: 8,
      waypoints: [
        { name: 'Fréhel', coords: [48.68, -2.32], type: 'start', day: 'Départ' },
        { name: 'Bayeux', coords: [49.27, -0.70], type: 'sleep', day: 'Sam soir 🛏' },
        { name: 'Cimetière US', coords: [49.36, -0.85], type: 'stop', day: 'Dim matin' },
        { name: 'Omaha Beach', coords: [49.37, -0.88], type: 'stop', day: 'Dim matin' },
        { name: 'Vierville-sur-Mer', coords: [49.38, -0.90], type: 'stop', day: 'Dim midi' },
        { name: 'Fréhel', coords: [48.68, -2.32], type: 'end', day: 'Dim soir' }
      ],
      highlights: ['🛣 Route D514 légendaire', '🪦 Cimetière américain émouvant', '🌊 Omaha Beach historique', '💰 Meilleur rapport qualité/prix']
    }
  };

  const route = routes[activeRoute];

  // Charger Leaflet dynamiquement
  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(css);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => setLeafletReady(true);
    document.body.appendChild(script);
  }, []);

  // Initialiser la carte
  useEffect(() => {
    if (!leafletReady || !mapRef.current) return;
    const L = window.L;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: false,
        attributionControl: false,
        tap: true,
        touchZoom: true,
        dragging: true
      });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapInstance.current);
      layerGroup.current = L.layerGroup().addTo(mapInstance.current);
    }
    return () => {};
  }, [leafletReady]);

  // Dessiner la boucle quand l'itinéraire change (routing sur vraies routes)
  useEffect(() => {
    if (!leafletReady || !mapInstance.current) return;
    const L = window.L;
    const map = mapInstance.current;

    layerGroup.current.clearLayers();

    const latlngs = route.waypoints.map(wp => wp.coords);

    // Marqueurs (affichés immédiatement)
    route.waypoints.slice(0, -1).forEach((wp) => {
      const isEnd = wp.type === 'start' || wp.type === 'end';
      const isSleep = wp.type === 'sleep';
      const mColor = isEnd ? '#ef4444' : isSleep ? route.colorDark : route.color;
      const size = isSleep ? 18 : 14;

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${size}px;height:${size}px;border-radius:50%;
          background:${mColor};border:3px solid white;
          box-shadow:0 0 10px ${mColor};
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      L.marker(wp.coords, { icon })
        .addTo(layerGroup.current)
        .bindTooltip(`<b>${wp.name}</b><br>${wp.day}`, {
          permanent: true,
          direction: 'top',
          offset: [0, -10],
          className: 'route-tooltip'
        });
    });

    // Ajuster la vue
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Tracé temporaire en ligne droite (le temps du routing)
    const tempLine = L.polyline(latlngs, {
      color: route.color, weight: 2, opacity: 0.3, dashArray: '6 8'
    }).addTo(layerGroup.current);

    // Routing OSRM sur les vraies routes
    let cancelled = false;
    const fetchRoute = async () => {
      setRoutingLoading(true);
      setRoutingDistance(null);
      try {
        // OSRM attend lng,lat séparés par ;
        const coordStr = route.waypoints.map(wp => `${wp.coords[1]},${wp.coords[0]}`).join(';');
        const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const json = await res.json();

        if (cancelled) return;

        if (json.routes && json.routes[0]) {
          const geo = json.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          layerGroup.current.removeLayer(tempLine);

          // Ombre
          L.polyline(geo, { color: route.color, weight: 7, opacity: 0.2, lineJoin: 'round' }).addTo(layerGroup.current);
          // Tracé principal
          L.polyline(geo, { color: route.color, weight: 4, opacity: 0.95, lineJoin: 'round' }).addTo(layerGroup.current);

          setRoutingDistance(Math.round(json.routes[0].distance / 1000));
        }
      } catch (e) {
        // En cas d'échec, on garde la ligne droite
      } finally {
        if (!cancelled) setRoutingLoading(false);
      }
    };
    fetchRoute();

    return () => { cancelled = true; };

  }, [activeRoute, leafletReady, route]);

  const hotelPrice = data[route.hotelKey];
  const budgetMin = Math.round(hotelPrice[0] * 0.7 + 65);
  const budgetMax = Math.round(hotelPrice[1] * 0.7 + 85);

  return (
    <div className="min-h-screen bg-slate-950 p-3 md:p-8" style={{ fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        .route-tooltip {
          background: rgba(15,23,42,0.92) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          color: white !important;
          font-size: 10px !important;
          border-radius: 6px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
          padding: 3px 6px !important;
        }
        .route-tooltip::before { display: none !important; }
        .leaflet-container { background: #0f172a !important; border-radius: 12px; }
      `}</style>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-5 md:mb-8">
          <h1 className="text-3xl md:text-6xl font-black mb-1 md:mb-3 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
            WEEK END MOTO
          </h1>
          <p className="text-slate-400 text-sm md:text-lg">Au départ de Fréhel · 3 boucles · 5 week-ends</p>
        </div>

        {/* Week-end Selector */}
        <div className="bg-slate-900 rounded-2xl p-4 md:p-6 mb-4 md:mb-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Calendar className="text-slate-400" size={18} />
            <span className="text-slate-300 font-semibold text-sm md:text-base">Choisir le week-end</span>
          </div>
          <div className="flex md:grid md:grid-cols-5 gap-2 overflow-x-auto pb-2 md:pb-0 -mx-1 px-1 snap-x">
            {Object.entries(weekends).map(([key, wk]) => (
              <button
                key={key}
                onClick={() => setSelectedWeekend(key)}
                className={`flex-shrink-0 w-32 md:w-auto p-3 rounded-xl font-bold transition-all snap-start ${
                  selectedWeekend === key
                    ? 'bg-white text-slate-900 shadow-xl'
                    : 'bg-slate-800 text-slate-300 active:bg-slate-700'
                }`}
              >
                <div className="text-sm">{wk.label}</div>
                <div className={`text-xs mt-1 ${
                  wk.tone === 'best' ? 'text-green-500' : wk.tone === 'warn' ? 'text-amber-500' : 'text-slate-500'
                }`}>{wk.note}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Route Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4 md:mb-6">
          {Object.entries(routes).map(([key, r]) => (
            <button
              key={key}
              onClick={() => setActiveRoute(key)}
              className={`p-3 md:p-4 rounded-xl font-bold transition-all border-2 ${
                activeRoute === key ? 'shadow-xl' : 'opacity-60 active:opacity-100'
              }`}
              style={{
                backgroundColor: activeRoute === key ? r.color : '#1e293b',
                borderColor: r.color,
                color: activeRoute === key ? '#0f172a' : r.color
              }}
            >
              <div className="text-xs md:text-base leading-tight">
                <span className="md:hidden">{r.shortTitle}</span>
                <span className="hidden md:inline">{r.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-4 md:gap-6">
          {/* Map */}
          <div className="lg:col-span-3 bg-slate-900 rounded-2xl p-3 md:p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-lg md:text-2xl font-black" style={{ color: route.color }}>{route.title}</h2>
              <div className="flex gap-1.5 text-[10px] md:text-xs">
                <span className="px-2 py-1 rounded-full bg-red-500 text-white">● Départ</span>
                <span className="px-2 py-1 rounded-full text-white" style={{ backgroundColor: route.colorDark }}>● Nuit</span>
              </div>
            </div>
            <div ref={mapRef} className="h-[320px] md:h-[480px]" style={{ width: '100%', borderRadius: '12px' }} />
            {!leafletReady && (
              <div className="text-center text-slate-500 text-sm mt-2">Chargement de la carte…</div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 rounded-xl p-3 md:p-4 border border-slate-800">
                <Navigation size={16} style={{ color: route.color }} />
                <div className="text-xl md:text-2xl font-black text-white mt-1">
                  {routingLoading ? '…' : routingDistance ? `${routingDistance} km` : route.distance}
                </div>
                <div className="text-[10px] md:text-xs text-slate-500">
                  {routingDistance ? 'Distance réelle' : 'Distance estimée'}
                </div>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 md:p-4 border border-slate-800">
                <Clock size={16} style={{ color: route.color }} />
                <div className="text-xl md:text-2xl font-black text-white mt-1">{route.driveTime}</div>
                <div className="text-[10px] md:text-xs text-slate-500">Temps de route</div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={16} style={{ color: route.color }} />
                <span className="text-slate-300 font-semibold text-sm">Budget · {data.label}</span>
              </div>
              <div className="text-2xl md:text-3xl font-black text-white">{budgetMin}-{budgetMax}€<span className="text-sm text-slate-500 font-normal">/pers</span></div>
              <div className="text-xs text-slate-500 mt-1">{route.hotelName}: {hotelPrice[0]}-{hotelPrice[1]}€/nuit</div>
              {activeRoute === 'vendee' && selectedWeekend === '11-12-juil' && (
                <div className="mt-2 text-xs text-amber-400 bg-amber-400/10 rounded p-2">⚠️ Francofolies = tarifs gonflés</div>
              )}
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <h3 className="text-slate-300 font-semibold text-sm mb-3">Points forts</h3>
              <div className="space-y-2">
                {route.highlights.map((h, i) => (
                  <div key={i} className="text-sm text-slate-200">{h}</div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <h3 className="text-slate-300 font-semibold text-sm mb-3">Étapes de la boucle</h3>
              <div className="space-y-1">
                {route.waypoints.slice(0, -1).map((wp, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm py-1">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ 
                      backgroundColor: wp.type === 'start' || wp.type === 'end' ? '#ef4444' : wp.type === 'sleep' ? route.colorDark : route.color 
                    }} />
                    <span className="text-white font-medium">{wp.name}</span>
                    <span className="text-slate-500 text-xs ml-auto">{wp.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 md:mt-6 text-center text-slate-600 text-[10px] md:text-xs px-4">
          🏍 Tracés indicatifs · Tarifs estimés selon la saison · Réservation conseillée à l'avance
        </div>
      </div>
    </div>
  );
}