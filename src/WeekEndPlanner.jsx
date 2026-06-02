import React, { useState } from 'react';
import { MapPin, ExternalLink, Camera, Navigation, Clock, Wallet, Map } from 'lucide-react';

/* ─── Design tokens ─────────────────────────────────────────── */
const C = {
  bg:      '#07090d',
  sidebar: '#050709',
  surface: '#0d1117',
  border:  '#161d28',
  borderHi:'#1f2e3f',
  text:    '#c4cfd8',
  muted:   '#3d5263',
  faint:   '#111a25',
  mono:    "'Syne Mono', monospace",
  display: "'Bebas Neue', sans-serif",
  sans:    "'Outfit', sans-serif",
};

/* Wikipedia Commons base */
const WI = 'https://upload.wikimedia.org/wikipedia/commons/thumb';

/* ─── Data ───────────────────────────────────────────────────── */
const weekends = {
  '4-5-juil':  { label:'4–5 Juil',   season:'Début saison',  bayeux:[80,90],  vannes:[90,110],  rochelle:[100,130], huelgoat:[70,110],  note:'✅ Bons prix',   tone:'good' },
  '11-12-juil':{ label:'11–12 Juil', season:'Francofolies',  bayeux:[85,100], vannes:[100,120], rochelle:[140,180], huelgoat:[80,120],  note:'⚠️ Cher',         tone:'warn' },
  '18-19-juil':{ label:'18–19 Juil', season:'Pic estival',   bayeux:[90,110], vannes:[110,130], rochelle:[120,150], huelgoat:[90,130],  note:'⚠️ Touristique',  tone:'warn' },
  '22-23-aou': { label:'22–23 Août', season:'Post-estival',  bayeux:[75,90],  vannes:[85,100],  rochelle:[95,120],  huelgoat:[75,110],  note:'✅ Bons prix',   tone:'good' },
  '12-13-sep': { label:'12–13 Sep',  season:'Basse saison',  bayeux:[55,70],  vannes:[60,75],   rochelle:[70,90],   huelgoat:[55,75],   note:'✅✅ Top prix',  tone:'best' },
};

const routes = {
  morbihan: {
    title:'Golfe du Morbihan', shortTitle:'Morbihan',
    subtitle:'Côte bretonne authentique',
    color:'#22d3ee', colorDark:'#06b6d4',
    distance:'320 km', driveTime:'7h30',
    hotelKey:'vannes', hotelName:'Vannes centre',
    googleMapsUrl:'https://www.google.com/maps/dir/Cap+Frehel+22240/Dinan+22100/Vannes+56000/Carnac+56340/Auray+56400/Cap+Frehel+22240',
    waypoints:[
      { name:'Fréhel',  type:'start', day:'Départ' },
      { name:'Dinan',   type:'stop',  day:'Sam midi' },
      { name:'Vannes',  type:'sleep', day:'Sam soir' },
      { name:'Carnac',  type:'stop',  day:'Dim matin' },
      { name:'Auray',   type:'stop',  day:'Dim midi' },
      { name:'Fréhel',  type:'end',   day:'Dim soir' },
    ],
    highlights:['🌊 Côte bretonne & golfe sauvage','🏍️ Routes D768/D34 sinueuses','⚓ Ferry possible vers les îles','🏛 Menhirs de Carnac (UNESCO)'],
    images:[
      { url:`${WI}/4/4c/Cromlech_d%27Er_Lannic_et_cairn_de_Gavrinis_par_drone_-_vue_2.jpg/330px-Cromlech_d%27Er_Lannic_et_cairn_de_Gavrinis_par_drone_-_vue_2.jpg`, caption:'Golfe du Morbihan', location:'Vue drone' },
      { url:`${WI}/a/a3/4748.1099_Menhire%2C_bis_zu_4_Meter_hoch%2C_von_OstnachWest_in_1167_Meter_Langen_Alignements_%28Granit-Steinreihen%29_in_einem_Halbkreis_endend_Le_M%C3%A9nec%2C_Carnac%2C_Departement_Morbihan%2C_Bretagne_Steffen_Heilfort.jpg/330px-thumbnail.jpg`, caption:'Menhirs de Carnac', location:'Carnac' },
      { url:`${WI}/6/65/Pointe_de_Pen-Hir.JPG/330px-Pointe_de_Pen-Hir.JPG`, caption:'Pointe de Pen-Hir', location:'Crozon, Finistère' },
      { url:`${WI}/1/1a/Dinan_Saint-Sauveur_vue_des_remparts.jpg/330px-Dinan_Saint-Sauveur_vue_des_remparts.jpg`, caption:'Remparts de Dinan', location:'Dinan' },
    ],
  },
  vendee: {
    title:'Vendée Côtière', shortTitle:'Vendée',
    subtitle:'La Rochelle & atlantique',
    color:'#fbbf24', colorDark:'#f59e0b',
    distance:'440 km', driveTime:'8h30',
    hotelKey:'rochelle', hotelName:'La Rochelle',
    googleMapsUrl:'https://www.google.com/maps/dir/Cap+Frehel+22240/Vannes+56000/La+Rochelle+17000/Ile+de+Re+17000/Fontenay-le-Comte+85200/Cap+Frehel+22240',
    waypoints:[
      { name:'Fréhel',            type:'start', day:'Départ' },
      { name:'Vannes',            type:'stop',  day:'Sam midi' },
      { name:'La Rochelle',       type:'sleep', day:'Sam soir' },
      { name:'Île de Ré',         type:'stop',  day:'Dim matin' },
      { name:'Fontenay-le-Comte', type:'stop',  day:'Dim aprem' },
      { name:'Fréhel',            type:'end',   day:'Dim soir' },
    ],
    highlights:['🌅 Plages longues & sauvages','🏰 La Rochelle portuaire','🌉 Île de Ré & son pont','🏍️ Routes intérieur + côte'],
    images:[
      { url:`${WI}/d/d8/Ile-de-Re_vue_du_ciel.JPG/330px-Ile-de-Re_vue_du_ciel.JPG`, caption:'Île de Ré', location:'Vue aérienne' },
      { url:`${WI}/2/22/Entree_vieux_port_La_Rochelle.JPG/330px-Entree_vieux_port_La_Rochelle.JPG`, caption:'Vieux-Port', location:'La Rochelle' },
      { url:`${WI}/d/d4/MaraisPoitevin.jpg/330px-MaraisPoitevin.jpg`, caption:'Marais Poitevin', location:'Marais Poitevin' },
      { url:`${WI}/4/40/Noirmoutier_Island_SPOT_1275.jpg/330px-Noirmoutier_Island_SPOT_1275.jpg`, caption:'Île de Noirmoutier', location:'Vendée' },
    ],
  },
  normandie: {
    title:'Normandie D-Day', shortTitle:'Normandie',
    subtitle:'Bayeux & route D514',
    color:'#34d399', colorDark:'#10b981',
    distance:'330 km', driveTime:'7h30',
    hotelKey:'bayeux', hotelName:'ibis budget Bayeux',
    googleMapsUrl:'https://www.google.com/maps/dir/Cap+Frehel+22240/Bayeux+14400/Colleville-sur-Mer+14710/Omaha+Beach/Vierville-sur-Mer+14710/Cap+Frehel+22240',
    waypoints:[
      { name:'Fréhel',          type:'start', day:'Départ' },
      { name:'Bayeux',          type:'sleep', day:'Sam soir' },
      { name:'Cimetière US',    type:'stop',  day:'Dim matin' },
      { name:'Omaha Beach',     type:'stop',  day:'Dim matin' },
      { name:'Vierville-s-Mer', type:'stop',  day:'Dim midi' },
      { name:'Fréhel',          type:'end',   day:'Dim soir' },
    ],
    highlights:['🛣 Route D514 légendaire','🪦 Cimetière américain émouvant','🌊 Omaha Beach historique','💰 Meilleur rapport qualité/prix'],
    images:[
      { url:`${WI}/7/75/Seconde-guerre-mondiale-debarquement-LCVP-6juin1944.jpg/330px-Seconde-guerre-mondiale-debarquement-LCVP-6juin1944.jpg`, caption:'Débarquement du 6 juin', location:'Omaha Beach' },
      { url:`${WI}/6/60/Normandy_American_Cemetery.png/330px-Normandy_American_Cemetery.png`, caption:'Cimetière Américain', location:'Colleville-sur-Mer' },
      { url:`${WI}/9/9b/Bayeux_centre.jpg/330px-Bayeux_centre.jpg`, caption:'Centre de Bayeux', location:'Bayeux' },
      { url:`${WI}/4/4f/Pointeduhoc1.jpg/330px-Pointeduhoc1.jpg`, caption:'Pointe du Hoc', location:'Cricqueville-en-Bessin' },
    ],
  },
  montsArree: {
    title:"Monts d'Arrée", shortTitle:"Arrée",
    subtitle:'Landes sauvages & chaos celtique',
    color:'#c084fc', colorDark:'#a855f7',
    distance:'460 km', driveTime:'9h00',
    hotelKey:'huelgoat', hotelName:'Huelgoat / Carhaix',
    googleMapsUrl:'https://www.google.com/maps/dir/Cap+Frehel+22240/Corlay+22320/Huelgoat+29690/Brasparts+29190/Morlaix+29600/Cap+Frehel+22240',
    waypoints:[
      { name:'Fréhel',    type:'start', day:'Départ' },
      { name:'Corlay',    type:'stop',  day:'Sam midi' },
      { name:'Huelgoat',  type:'sleep', day:'Sam soir' },
      { name:'Brasparts', type:'stop',  day:'Dim matin' },
      { name:'Morlaix',   type:'stop',  day:'Dim midi' },
      { name:'Fréhel',    type:'end',   day:'Dim soir' },
    ],
    highlights:["🌿 Landes bretonnes immenses & sauvages","🧗 Chaos granitique de Huelgoat","🌫️ Yeun Elez, la « Porte de l'Enfer »","⛪ Enclos paroissiaux du Finistère (D785)"],
    images:[
      { url:`${WI}/e/ec/Landes_de_Bretagne.jpg/330px-Landes_de_Bretagne.jpg`, caption:'Landes de Bretagne', location:"Monts d'Arrée" },
      { url:`${WI}/d/dc/Huelgoat_Chaos_mill.jpg/330px-Huelgoat_Chaos_mill.jpg`, caption:'Chaos du Moulin', location:'Huelgoat' },
      { url:`${WI}/0/0c/1_Thegonnec_C.jpg/330px-1_Thegonnec_C.jpg`, caption:'Enclos paroissial', location:'Saint-Thégonnec' },
      { url:`${WI}/7/72/Vue_de_Morlaix.JPG/330px-Vue_de_Morlaix.JPG`, caption:'Viaduc de Morlaix', location:'Morlaix' },
    ],
  },
};

/* ─── Helpers ────────────────────────────────────────────────── */
const noteColor = t => t==='best'?'#22c55e':t==='warn'?'#f59e0b':'#3d5263';

const Label = ({ children, style }) => (
  <div style={{ fontFamily:C.mono, fontSize:9, letterSpacing:'0.18em', color:C.muted, textTransform:'uppercase', marginBottom:8, ...style }}>
    {children}
  </div>
);

/* ─── Route Banner (replaces map) ───────────────────────────── */
const RouteBanner = ({ route, data }) => {
  const wps = route.waypoints;
  return (
    <div style={{
      background:`linear-gradient(160deg, ${route.color}12 0%, ${C.faint} 60%, ${C.bg} 100%)`,
      borderBottom:`1px solid ${C.border}`,
      padding:'28px 24px 24px',
    }}>
      {/* Route name + stats */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontFamily:C.display, fontSize:'clamp(2rem, 4vw, 3.2rem)', color:route.color,
            lineHeight:1, letterSpacing:'0.04em', textShadow:`0 0 40px ${route.color}40` }}>
            {route.title}
          </div>
          <div style={{ fontSize:12, color:'#7a8fa0', marginTop:4, fontFamily:C.sans }}>{route.subtitle}</div>
        </div>
        <div style={{ display:'flex', gap:16, alignItems:'center', flexShrink:0 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:C.mono, fontSize:'1.4rem', color:route.color, lineHeight:1 }}>
              {route.distance}
            </div>
            <div style={{ fontFamily:C.mono, fontSize:8, letterSpacing:'0.18em', color:C.muted, marginTop:2 }}>DISTANCE</div>
          </div>
          <div style={{ width:1, height:32, background:C.border }} />
          <div>
            <div style={{ fontFamily:C.mono, fontSize:'1.4rem', color:route.color, lineHeight:1 }}>
              {route.driveTime}
            </div>
            <div style={{ fontFamily:C.mono, fontSize:8, letterSpacing:'0.18em', color:C.muted, marginTop:2 }}>DURÉE</div>
          </div>
        </div>
      </div>

      {/* Visual waypoints strip */}
      <div style={{ overflowX:'auto', paddingBottom:4 }}>
        <div style={{ display:'flex', alignItems:'flex-start', minWidth:'max-content', gap:0 }}>
          {wps.map((wp, i) => {
            const isStart = wp.type==='start';
            const isEnd   = wp.type==='end';
            const isSleep = wp.type==='sleep';
            const dotCol  = (isStart||isEnd) ? '#ef4444' : isSleep ? route.color : C.borderHi;
            const isLast  = i === wps.length-1;
            return (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:0 }}>
                {/* Dot + label */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{
                    width: isSleep?11:8, height: isSleep?11:8, borderRadius:'50%',
                    background:dotCol, marginTop:2, flexShrink:0,
                    boxShadow: isSleep?`0 0 10px ${route.color}90`:'none',
                    border: isSleep?`2px solid ${route.color}60`:'none',
                  }} />
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:10, color: isSleep?route.color:(isStart||isEnd)?'#ef4444':C.text,
                      fontWeight: isSleep?600:400, whiteSpace:'nowrap', lineHeight:1.2 }}>
                      {wp.name}
                    </div>
                    <div style={{ fontFamily:C.mono, fontSize:8, color:C.muted, marginTop:2, whiteSpace:'nowrap' }}>
                      {wp.day}
                    </div>
                  </div>
                </div>
                {/* Connector line */}
                {!isLast && (
                  <div style={{ display:'flex', alignItems:'center', height:10, marginTop:3, marginLeft:-1 }}>
                    <div style={{ height:1.5, width:40, background:`linear-gradient(to right, ${dotCol}60, ${C.borderHi}60)` }} />
                    <div style={{ width:3, height:3, borderTop:`1.5px solid ${C.borderHi}60`, borderRight:`1.5px solid ${C.borderHi}60`, transform:'rotate(45deg)', marginLeft:-2 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Maps CTA */}
      <div style={{ marginTop:20 }}>
        <a
          href={route.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:'inline-flex', alignItems:'center', gap:10,
            padding:'13px 22px', borderRadius:12,
            background:route.color, color:C.bg,
            fontFamily:C.sans, fontSize:14, fontWeight:700,
            cursor:'pointer', textDecoration:'none',
            boxShadow:`0 4px 24px ${route.color}50`,
            transition:'all 0.2s',
          }}
          onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 6px 32px ${route.color}70`; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 4px 24px ${route.color}50`; }}
        >
          <Map size={16} />
          Ouvrir l'itinéraire dans Google Maps
          <ExternalLink size={13} style={{ opacity:0.7 }} />
        </a>
        <div style={{ marginTop:8, fontSize:10, color:C.muted, fontFamily:C.mono, letterSpacing:'0.1em' }}>
          NAVIGATION GPS COMPLÈTE · TOUTES ÉTAPES INCLUSES
        </div>
      </div>
    </div>
  );
};

/* ─── Gallery ────────────────────────────────────────────────── */
const Gallery = ({ route }) => (
  <div style={{ padding:'20px 20px 28px' }}>
    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
      <Camera size={11} style={{ color:C.muted }} />
      <Label style={{ marginBottom:0 }}>Ce que vous verrez</Label>
    </div>
    <div className="gallery-grid">
      {route.images.map((img, i) => (
        <div key={i} className="gallery-card"
          style={{ position:'relative', borderRadius:10, overflow:'hidden', aspectRatio:'4/3', background:`${route.color}15` }}>
          <img
            src={img.url}
            alt={img.caption}
            loading="lazy"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.6s ease' }}
            onError={e => { e.target.style.display='none'; }}
          />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,.78) 0%, rgba(0,0,0,.15) 50%, transparent 100%)' }} />
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'10px 12px' }}>
            <div style={{ fontSize:11, fontWeight:600, color:'#fff', lineHeight:1.3 }}>{img.caption}</div>
            <div style={{ display:'flex', alignItems:'center', gap:3, marginTop:3 }}>
              <MapPin size={8} style={{ color:'#7a8fa0' }} />
              <span style={{ fontSize:9, color:'#7a8fa0', fontFamily:C.mono }}>{img.location}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Sidebar pieces ─────────────────────────────────────────── */
const RouteBtn = ({ rKey, r, active, onClick, mobile }) => (
  <button onClick={() => onClick(rKey)} style={{
    textAlign:'left', cursor:'pointer', transition:'all 0.18s',
    borderRadius:mobile?10:7, width:'100%',
    padding: mobile ? '10px 12px' : '9px 12px',
    borderLeft: mobile ? undefined : `3px solid ${active?r.color:C.border}`,
    border: mobile ? `1px solid ${active?r.color:C.border}` : undefined,
    background: active ? `${r.color}14` : 'transparent',
  }}>
    <div style={{ fontFamily:C.display, fontSize:'0.95rem', letterSpacing:'0.06em',
      color:active?r.color:C.muted, lineHeight:1 }}>
      {mobile ? r.shortTitle : r.title}
    </div>
    <div style={{ fontFamily:C.mono, fontSize:9, color:active?`${r.color}65`:C.faint, marginTop:3 }}>
      {r.distance} · {r.driveTime}
    </div>
  </button>
);

const WeekendBtn = ({ wKey, wk, active, onClick, compact }) => (
  <button onClick={() => onClick(wKey)} style={{
    cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap', textAlign:'left',
    padding: compact ? '5px 9px' : '7px 12px', borderRadius:7, flexShrink:0,
    background: active ? C.borderHi : 'transparent',
    border: `1px solid ${active?C.borderHi:C.faint}`,
    width: compact ? undefined : '100%',
    display: compact ? undefined : 'flex', alignItems:'center', justifyContent:'space-between', gap:6,
  }}>
    <span style={{ fontFamily:C.mono, fontSize:compact?'0.6rem':'0.67rem', color:active?C.text:C.muted }}>
      {compact ? wk.label : `${wk.label} · ${wk.season}`}
    </span>
    {compact && <div style={{ fontSize:9, color:noteColor(wk.tone), marginTop:1 }}>{wk.note}</div>}
    {!compact && <span style={{ fontSize:10, color:noteColor(wk.tone) }}>{wk.note}</span>}
  </button>
);

/* ─── Main export ────────────────────────────────────────────── */
export default function WeekEndPlanner() {
  const [selectedWeekend, setSelectedWeekend] = useState('11-12-juil');
  const [activeRoute,     setActiveRoute]     = useState('morbihan');

  const data  = weekends[selectedWeekend];
  const route = routes[activeRoute];
  const hp    = data[route.hotelKey];
  const bMin  = Math.round(hp[0] * 0.7 + 65);
  const bMax  = Math.round(hp[1] * 0.7 + 85);

  const wps = route.waypoints.slice(0, -1);

  const SidebarInfoBlock = () => (
    <>
      {/* Stats */}
      <div style={{ marginBottom:16 }}>
        <Label>Stats</Label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { icon:<Navigation size={12}/>, val:route.distance, lbl:'Distance' },
            { icon:<Clock size={12}/>,      val:route.driveTime, lbl:'Durée' },
          ].map(({ icon, val, lbl }) => (
            <div key={lbl} style={{ background:C.surface, borderLeft:`2px solid ${route.color}`, borderRadius:8, padding:'10px 12px' }}>
              <div style={{ color:route.color, marginBottom:4 }}>{icon}</div>
              <div style={{ fontFamily:C.mono, fontSize:'1.1rem', color:route.color, lineHeight:1 }}>{val}</div>
              <div style={{ fontFamily:C.mono, fontSize:8, letterSpacing:'0.15em', color:C.muted, marginTop:3 }}>{lbl.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div style={{ marginBottom:16 }}>
        <Label>Budget · {data.label}</Label>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:'12px 14px' }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
            <span style={{ fontFamily:C.mono, fontSize:'1.5rem', color:C.text }}>{bMin}–{bMax}€</span>
            <span style={{ fontSize:11, color:C.muted }}>/pers</span>
          </div>
          <div style={{ fontSize:10, color:C.muted, marginTop:3 }}>{route.hotelName} · {hp[0]}–{hp[1]}€/nuit</div>
          <div style={{ fontSize:10, color:C.faint, marginTop:2 }}>Chambre + carburant + repas</div>
          {activeRoute==='vendee' && selectedWeekend==='11-12-juil' && (
            <div style={{ marginTop:8, fontSize:10, padding:'4px 8px', borderRadius:5, background:'#f59e0b18', color:'#f59e0b' }}>
              ⚠ Francofolies — tarifs majorés
            </div>
          )}
        </div>
      </div>

      {/* Highlights */}
      <div style={{ marginBottom:16 }}>
        <Label>Points forts</Label>
        {route.highlights.map((h,i) => (
          <div key={i} style={{ fontSize:12, color:'#8899aa', marginBottom:6 }}>{h}</div>
        ))}
      </div>

      {/* Waypoints */}
      <div style={{ marginBottom:20 }}>
        <Label>Étapes</Label>
        {wps.map((wp,i) => {
          const isSleep = wp.type==='sleep';
          const isEdge  = wp.type==='start';
          return (
            <div key={i} style={{ display:'flex', gap:10 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', marginTop:5, flexShrink:0,
                  background: isEdge?'#ef4444':isSleep?route.color:C.borderHi,
                  boxShadow: isSleep?`0 0 8px ${route.color}80`:'none' }} />
                {i<wps.length-1 && <div style={{ width:1, flex:1, minHeight:14, background:C.border, marginTop:2 }} />}
              </div>
              <div style={{ paddingBottom:12 }}>
                <div style={{ fontSize:12, color:C.text }}>{wp.name}</div>
                <div style={{ fontFamily:C.mono, fontSize:9, color:C.muted, marginTop:1 }}>{wp.day}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Google Maps CTA */}
      <a href={route.googleMapsUrl} target="_blank" rel="noopener noreferrer"
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          width:'100%', padding:'12px 16px', borderRadius:10, background:route.color, color:C.bg,
          fontFamily:C.sans, fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none',
          boxShadow:`0 2px 16px ${route.color}40`, transition:'opacity 0.2s' }}
        onMouseEnter={e=>e.currentTarget.style.opacity='.82'}
        onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
        <Map size={14} />
        Voir sur Google Maps
        <ExternalLink size={12} style={{ opacity:0.7 }} />
      </a>
    </>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:C.sans, color:C.text }}>
      <style>{`
        * { box-sizing:border-box; }
        .gallery-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
        .gallery-card:hover img { transform:scale(1.08); }
        @media (min-width:1024px) {
          .gallery-grid { grid-template-columns:repeat(4,1fr); gap:10px; }
          .lg-sidebar  { display:flex !important; }
          .mobile-only { display:none !important; }
          .main-scroll { height:100vh; overflow-y:auto; }
        }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:${C.bg}; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:2px; }
      `}</style>

      <div style={{ display:'flex', minHeight:'100vh' }}>

        {/* ── SIDEBAR (desktop only) ─────────────────────────── */}
        <aside className="lg-sidebar" style={{
          display:'none', width:300, flexShrink:0, flexDirection:'column',
          background:C.sidebar, borderRight:`1px solid ${C.border}`,
          position:'sticky', top:0, height:'100vh', overflowY:'auto',
          padding:'22px 18px',
        }}>
          {/* Title */}
          <div style={{ marginBottom:22, paddingBottom:18, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:C.display, fontSize:'2.5rem', lineHeight:0.88, color:C.text, letterSpacing:'0.03em' }}>
              WEEK<br/>END<br/>MOTO
            </div>
            <div style={{ fontFamily:C.mono, fontSize:9, letterSpacing:'0.2em', color:C.muted, marginTop:10 }}>
              AU DÉPART DE FRÉHEL
            </div>
          </div>

          <div style={{ marginBottom:18 }}>
            <Label>Itinéraire</Label>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {Object.entries(routes).map(([k,r]) =>
                <RouteBtn key={k} rKey={k} r={r} active={activeRoute===k} onClick={setActiveRoute} mobile={false}/>
              )}
            </div>
          </div>

          <div style={{ marginBottom:18 }}>
            <Label>Date du week-end</Label>
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              {Object.entries(weekends).map(([k,wk]) =>
                <WeekendBtn key={k} wKey={k} wk={wk} active={selectedWeekend===k} onClick={setSelectedWeekend} compact={false}/>
              )}
            </div>
          </div>

          <SidebarInfoBlock />
        </aside>

        {/* ── MAIN ──────────────────────────────────────────── */}
        <main className="main-scroll" style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>

          {/* Mobile header */}
          <div className="mobile-only" style={{ padding:'18px 18px 0' }}>
            <div style={{ fontFamily:C.display, fontSize:'2.2rem', lineHeight:0.9, color:C.text }}>
              WEEK END MOTO
            </div>
            <div style={{ fontFamily:C.mono, fontSize:9, letterSpacing:'0.18em', color:C.muted, marginTop:7 }}>
              AU DÉPART DE FRÉHEL · 4 BOUCLES
            </div>
          </div>

          {/* Mobile: route selector */}
          <div className="mobile-only" style={{ padding:'14px 18px 0' }}>
            <Label>Itinéraire</Label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {Object.entries(routes).map(([k,r]) =>
                <RouteBtn key={k} rKey={k} r={r} active={activeRoute===k} onClick={setActiveRoute} mobile={true}/>
              )}
            </div>
          </div>

          {/* Mobile: weekend selector */}
          <div className="mobile-only" style={{ padding:'12px 18px 0', position:'relative' }}>
            <Label>Week-end</Label>
            <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
              {Object.entries(weekends).map(([k,wk]) =>
                <WeekendBtn key={k} wKey={k} wk={wk} active={selectedWeekend===k} onClick={setSelectedWeekend} compact={true}/>
              )}
            </div>
          </div>

          {/* ── Route Banner (replaces map) ── */}
          <RouteBanner route={route} data={data} />

          {/* Mobile info block */}
          <div className="mobile-only" style={{ padding:'16px 18px 0' }}>
            <SidebarInfoBlock />
          </div>

          {/* ── Gallery ── */}
          <Gallery route={route} />

          <div style={{ padding:'0 20px 20px', fontSize:9, color:C.faint, fontFamily:C.mono, letterSpacing:'0.12em' }}>
            TRACÉS INDICATIFS · TARIFS ESTIMÉS · RÉSERVATION CONSEILLÉE
          </div>
        </main>
      </div>
    </div>
  );
}
