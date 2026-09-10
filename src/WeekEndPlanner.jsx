import React from 'react';
import { MapPin, ExternalLink, Camera, Navigation, Clock, Map, Download } from 'lucide-react';

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

/* ─── Data: Côte de Granit Rose, boucle journée au départ d'Hénansal ── */
const ROUTE = {
  title: 'Côte de Granit Rose',
  subtitle: "Binic, Perros-Guirec, Ploumanac'h & Trégastel",
  color: '#fb7185', colorDark: '#f43f5e',
  distance: '263 km', driveTime: '6h42',
  googleMapsUrl: 'https://www.google.com/maps/dir/48.54098,-2.43309/48.48887,-2.69472/48.60023,-2.82587/48.71353,-3.0221/48.79006,-3.04907/48.77542,-3.29324/48.8317,-3.48334/48.73392,-3.4332/48.62634,-3.16895/48.54406,-2.96631/48.49494,-2.71581/48.54098,-2.43309',
  gpxUrl: '/granit-rose.gpx',
  waypoints: [
    { name: 'Hénansal',          type: 'start', time: '9h00',  day: 'Départ' },
    { name: 'Binic',             type: 'stop',  time: '~10h15', day: 'Matin' },
    { name: "Pointe de l'Arcouest", type: 'stop', time: '~11h25', day: 'Matin' },
    { name: 'Pointe du Château', type: 'stop',  time: '~12h55', day: 'Matin' },
    { name: "Ploumanac'h",       type: 'lunch', time: '13h10–14h25', day: 'Déjeuner' },
    { name: 'Station-service',   type: 'stop',  time: '~14h35', day: 'Ravitaillement' },
    { name: 'Île Renote',        type: 'stop',  time: '~14h45', day: 'Après-midi' },
    { name: 'Guingamp',          type: 'stop',  time: '~16h20', day: 'Après-midi' },
    { name: 'Hénansal',          type: 'end',   time: '~18h15', day: 'Retour' },
  ],
  highlights: [
    '🌸 Rochers de granit rose, Île Renote',
    '⛵ Port de Binic, mise en jambes côtière',
    "🏝️ Vue sur l'archipel de Bréhat, Pointe de l'Arcouest",
    '🗿 Chapeau de Napoléon, Pointe du Château',
    "🗼 Ploumanac'h & son phare, pause déjeuner",
  ],
  lunch: [
    { name: 'Crêperie du Ranolien', town: "Ploumanac'h, camping Le Ranolien", note: 'Galettes & crêpes, petit budget (~9€/pers), 4.6-4.7/5', query: "Crêperie du Ranolien Ploumanac'h", photo: 'https://img02.restaurantguru.com/ceab-Creperie-du-Ranolien-Perros-Guirec-meals.jpg' },
    { name: 'Le Bistrot du Port', town: "Port de Ploumanac'h", note: 'Crêperie simple, vue sur le port, prix très raisonnables', query: "Crêperie Le Bistrot du Port Ploumanac'h", photo: 'https://img02.restaurantguru.com/c729-Creperie-Le-Bistrot-du-Port-Perros-Guirec-exterior.jpg' },
    { name: 'Le Mao', town: "Ploumanac'h", note: 'Crêpes & fruits de mer, bon rapport qualité-prix, moules-frites ~8€', query: "Restaurant Le Mao Ploumanac'h", photo: 'https://img02.restaurantguru.com/c2f5-Restaurant-Le-Mao-panna-cotta.jpg' },
  ],
  images: [
    { url: `${WI}/c/c0/Port_de_Ploum_2.JPG/330px-Port_de_Ploum_2.JPG`, caption: "Port de Ploumanac'h", location: "Ploumanac'h" },
    { url: `${WI}/8/8b/Perros-Guirec_-_La_C%C3%B4te_de_granit_rose_et_le_phare_de_Ploumanac%27h_-_Juin_2005.jpg/330px-Perros-Guirec_-_La_C%C3%B4te_de_granit_rose_et_le_phare_de_Ploumanac%27h_-_Juin_2005.jpg`, caption: 'Côte de granit rose & phare', location: 'Perros-Guirec' },
    { url: `${WI}/a/ae/France_Cotes_d_Armor_Cote_de_granit_rose_04.jpg/330px-France_Cotes_d_Armor_Cote_de_granit_rose_04.jpg`, caption: 'Rochers de granit rose', location: "Côtes-d'Armor" },
    { url: `${WI}/7/73/Brehat.jpg/330px-Brehat.jpg`, caption: "Vue sur l'archipel de Bréhat", location: "Pointe de l'Arcouest" },
    { url: `${WI}/1/12/Binic_-_Avant_port_%C3%A0_marr%C3%A9e_basse.jpg/330px-Binic_-_Avant_port_%C3%A0_marr%C3%A9e_basse.jpg`, caption: 'Avant-port de Binic à marée basse', location: 'Binic' },
    { url: `${WI}/4/4e/PSIMG_4128.JPG/330px-PSIMG_4128.JPG`, caption: "Rochers de l'Île Renote", location: 'Trégastel' },
    { url: `${WI}/f/f3/France-Perros-Guirec-sentier_littoral.JPG/330px-France-Perros-Guirec-sentier_littoral.JPG`, caption: 'Sentier littoral', location: 'Perros-Guirec' },
  ],
};

/* ─── Helpers ────────────────────────────────────────────────── */
const isLunchWp = t => t === 'lunch';

const Label = ({ children, style }) => (
  <div style={{ fontFamily:C.mono, fontSize:9, letterSpacing:'0.18em', color:C.muted, textTransform:'uppercase', marginBottom:8, ...style }}>
    {children}
  </div>
);

/* ─── Route Banner (replaces map) ───────────────────────────── */
const RouteBanner = ({ route }) => {
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
            const isHi    = isLunchWp(wp.type);
            const dotCol  = (isStart||isEnd) ? '#ef4444' : isHi ? route.color : C.borderHi;
            const isLast  = i === wps.length-1;
            return (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:0 }}>
                {/* Dot + label */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                  <div style={{
                    width: isHi?11:8, height: isHi?11:8, borderRadius:'50%',
                    background:dotCol, marginTop:2, flexShrink:0,
                    boxShadow: isHi?`0 0 10px ${route.color}90`:'none',
                    border: isHi?`2px solid ${route.color}60`:'none',
                  }} />
                  <div style={{ textAlign:'center' }}>
                    <div style={{
                      fontFamily:C.mono, fontSize:12, fontWeight:800, whiteSpace:'nowrap',
                      color: isHi?C.bg:(isStart||isEnd)?'#fff':route.color,
                      background: isHi?route.color:(isStart||isEnd)?'#ef4444':`${route.color}18`,
                      padding:'3px 8px', borderRadius:6, lineHeight:1.3,
                    }}>
                      {wp.time}
                    </div>
                    <div style={{ fontSize:11, color:isHi?route.color:(isStart||isEnd)?'#ef4444':C.text,
                      fontWeight: isHi?600:400, whiteSpace:'nowrap', lineHeight:1.2, marginTop:5 }}>
                      {wp.name}
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
      <div style={{ marginTop:20, display:'flex', gap:10, flexWrap:'wrap' }}>
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
        <a
          href={route.gpxUrl}
          download
          style={{
            display:'inline-flex', alignItems:'center', gap:10,
            padding:'13px 22px', borderRadius:12,
            background:'transparent', color:route.color,
            border:`1.5px solid ${route.color}60`,
            fontFamily:C.sans, fontSize:14, fontWeight:700,
            cursor:'pointer', textDecoration:'none',
            transition:'all 0.2s',
          }}
          onMouseEnter={e=>{ e.currentTarget.style.background=`${route.color}14`; }}
          onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}
        >
          <Download size={16} />
          Télécharger la trace GPX
        </a>
      </div>
      <div style={{ marginTop:8, fontSize:10, color:C.muted, fontFamily:C.mono, letterSpacing:'0.1em' }}>
        NAVIGATION GPS COMPLÈTE · TOUTES ÉTAPES INCLUSES
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

/* ─── Main export ────────────────────────────────────────────── */
export default function WeekEndPlanner() {
  const route = ROUTE;
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

      {/* Pause déjeuner */}
      <div style={{ marginBottom:16 }}>
        <Label>Pause déjeuner</Label>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {route.lunch.map((l, i) => (
            <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:'12px 14px', display:'flex', gap:10 }}>
              {l.photo && (
                <img src={l.photo} alt={l.name} loading="lazy"
                  style={{ width:56, height:56, borderRadius:7, objectFit:'cover', flexShrink:0, background:C.faint }}
                  onError={e => { e.target.style.display='none'; }} />
              )}
              <div style={{ minWidth:0, flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{l.name}</span>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(l.query)}`} target="_blank" rel="noopener noreferrer"
                    style={{ color:route.color, display:'flex', alignItems:'center', flexShrink:0 }}>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <div style={{ fontSize:10, color:C.muted, marginTop:2, fontFamily:C.mono }}>{l.town}</div>
                <div style={{ fontSize:11, color:'#8899aa', marginTop:4 }}>{l.note}</div>
              </div>
            </div>
          ))}
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
          const isHi   = isLunchWp(wp.type);
          const isEdge = wp.type==='start';
          return (
            <div key={i} style={{ display:'flex', gap:10 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', marginTop:5, flexShrink:0,
                  background: isEdge?'#ef4444':isHi?route.color:C.borderHi,
                  boxShadow: isHi?`0 0 8px ${route.color}80`:'none' }} />
                {i<wps.length-1 && <div style={{ width:1, flex:1, minHeight:14, background:C.border, marginTop:2 }} />}
              </div>
              <div style={{ paddingBottom:12, flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                  <div style={{ fontSize:13, color:C.text, fontWeight:isHi?600:400 }}>{wp.name}</div>
                  <div style={{
                    fontFamily:C.mono, fontSize:11, fontWeight:800, whiteSpace:'nowrap',
                    color: isHi?C.bg:route.color, background: isHi?route.color:`${route.color}18`,
                    padding:'2px 7px', borderRadius:5,
                  }}>
                    {wp.time}
                  </div>
                </div>
                <div style={{ fontFamily:C.mono, fontSize:9, color:C.muted, marginTop:3 }}>{wp.day}</div>
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
      <a href={route.gpxUrl} download
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          width:'100%', padding:'12px 16px', borderRadius:10, background:'transparent', color:route.color,
          border:`1.5px solid ${route.color}60`,
          fontFamily:C.sans, fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none',
          marginTop:8, transition:'background 0.2s' }}
        onMouseEnter={e=>e.currentTarget.style.background=`${route.color}14`}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <Download size={14} />
        Trace GPX
      </a>
    </>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:C.sans, color:C.text }}>
      <style>{`
        * { box-sizing:border-box; }
        .gallery-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
        .gallery-card:hover img { transform:scale(1.08); }
        @media (min-width:768px)  { .gallery-grid { grid-template-columns:repeat(3,1fr); gap:10px; } }
        @media (min-width:1024px) {
          .gallery-grid { grid-template-columns:repeat(3,1fr); gap:10px; }
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
              GRANIT<br/>ROSE
            </div>
            <div style={{ fontFamily:C.mono, fontSize:9, letterSpacing:'0.2em', color:C.muted, marginTop:10 }}>
              BOUCLE MOTO · AU DÉPART D'HÉNANSAL
            </div>
          </div>

          <SidebarInfoBlock />
        </aside>

        {/* ── MAIN ──────────────────────────────────────────── */}
        <main className="main-scroll" style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>

          {/* Mobile header */}
          <div className="mobile-only" style={{ padding:'18px 18px 0' }}>
            <div style={{ fontFamily:C.display, fontSize:'2.2rem', lineHeight:0.9, color:C.text }}>
              CÔTE DE GRANIT ROSE
            </div>
            <div style={{ fontFamily:C.mono, fontSize:9, letterSpacing:'0.18em', color:C.muted, marginTop:7 }}>
              BOUCLE MOTO · AU DÉPART D'HÉNANSAL
            </div>
          </div>

          {/* ── Route Banner (replaces map) ── */}
          <RouteBanner route={route} />

          {/* Mobile info block */}
          <div className="mobile-only" style={{ padding:'16px 18px 0' }}>
            <SidebarInfoBlock />
          </div>

          {/* ── Gallery ── */}
          <Gallery route={route} />

          <div style={{ padding:'0 20px 20px', fontSize:9, color:C.faint, fontFamily:C.mono, letterSpacing:'0.12em' }}>
            TRACÉ INDICATIF · DISTANCES ESTIMÉES
          </div>
        </main>
      </div>
    </div>
  );
}
