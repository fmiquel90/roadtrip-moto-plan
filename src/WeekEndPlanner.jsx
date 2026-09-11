import React from 'react';
import { MapPin, ExternalLink, Camera, Navigation, Clock, Download, Fuel, Phone, Timer, Utensils } from 'lucide-react';

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

/* ─── Data: Argoat, boucle journée au départ d'Hénansal ──────────────────────
 *
 * Argoat = le pays des bois en breton, par opposition à l'Armor, le pays de la
 * mer. C'est le sujet de la boucle : elle tourne le dos à la côte.
 *
 * Le rythme est la contrainte structurante : minimum 40-45 min de roulage entre
 * deux arrêts. D'où le petit nombre d'arrêts et les nombreuses traversées — les
 * lieux listés en `via` sont vus depuis la selle, on ne s'y arrête pas.
 * Distance et durée viennent de scripts/tomtom-scenic-route.mjs, calculées pour
 * un départ le samedi à 9h00 : sans departAt, TomTom estime pour l'heure du
 * calcul et le chiffre dérive dans la journée.
 */
const ROUTE = {
  title: 'Argoat',
  subtitle: 'Mont Bel-Air, Guerlédan, gorges du Poulancre & du Daoulas',
  color: '#34d399', colorDark: '#10b981',
  distance: '193 km', driveTime: '3h59', dayLength: '8h44',
  day: 'Samedi',
  files: [
    { label: 'MATIN - GPX', url: '/matin.gpx' },
    { label: 'APREM - GPX', url: '/aprem.gpx' },
  ],
  /* Horaires recalés sur les deux GPX MyDrive : distances mesurées sur la trace
   * elle-même, durées estimées au profil moto sinueux. Départ 8h30. */
  waypoints: [
    { name: 'Hénansal', type: 'start', time: '8h30', day: 'Départ', note: 'Réservoir plein' },
    { name: 'Mont Bel-Air', type: 'stop', time: '9h03', ride: '33 min', pause: '30 min',
      day: '26,7 km · panorama 339 m' },
    { name: 'Cascade de Bosméléac', type: 'stop', time: '10h13', ride: '40 min', pause: '40 min',
      day: '34,9 km · lac, barrage & aqueduc' },
    { name: 'Betty Food', type: 'lunch', time: '11h21', ride: '28 min', pause: '1h15',
      day: '20,3 km · déjeuner, Le Mané à Caurel' },
    { name: 'Gouarec', type: 'stop', time: '12h49', ride: '13 min', pause: '25 min',
      day: '11,7 km · bourg sur le Blavet' },
    { name: 'Abbaye de Bon-Repos', type: 'stop', time: '13h20', ride: '6 min', pause: '30 min',
      day: '5,3 km · ruines & Café de l’Abbaye' },
    { name: 'Les Forges des Salles', type: 'stop', time: '13h56', ride: '6 min', pause: '45 min',
      day: '3,3 km · village-usine · samedi 14h-18h' },
    { name: 'Quintin', type: 'fuel', time: '15h31', ride: '50 min', pause: '40 min',
      day: '41,7 km · cité de caractère · PLEIN' },
    { name: 'Hénansal', type: 'end', time: '17h14', ride: '63 min', day: '49,5 km · retour' },
  ],
  highlights: [
    '⛰️ Mont Bel-Air, 339 m — le toit de l’est du département',
    '💧 Cascade et barrage de Bosméléac, sur l’aqueduc',
    '🌊 Le lac de Guerlédan, rive nord',
    '🏛️ Abbaye de Bon-Repos, ruines cisterciennes sur le Blavet',
    '🔨 Les Forges des Salles, village-usine du XVIIIᵉ conservé en l’état',
    '🏘️ Quintin, cité de caractère et son château',
  ],
  abbeyWarning: "L'abbaye de Bon-Repos est donnée ouverte 14h-18h du dimanche au vendredi — le samedi manque. Vérifie au 02 96 24 82 20 : si elle ouvre, reprends 20 min sur les Forges.",
  lunch: [
    { name: 'Betty Food', town: '3 Le Mané, 22530 Caurel',
      hours: 'Samedi 11h — 23h', phone: '',
      note: 'Snack au bord du lac. Rapide, sans réservation, sans créneau de service à tenir.',
      query: 'Betty Food Caurel' },
    { name: "L'Embarcadère", town: 'Beau Rivage, 22530 Caurel',
      hours: 'Samedi 9h — minuit', phone: '02 96 28 52 64',
      note: 'À 680 m, au ponton des Vedettes de Guerlédan. Si tu veux t’asseoir.',
      query: "Restaurant l'Embarcadère Beau Rivage Caurel" },
    { name: "Cap'Tain Cook", town: '56 Rue Roc Hell, 22530 Caurel',
      hours: 'Samedi 9h — 22h', phone: '02 96 67 11 00',
      note: 'Repli, à 1,5 km.',
      query: "Cap'Tain Cook Caurel" },
  ],
  lunchWarning: "À éviter : l'Auberge de Guerlédan ne sert que de 12h à 13h. Il y a aussi La Dame du Lac à 90 m du point de déjeuner, en bord d'eau — mais la base la classe en bar et ne donne aucun horaire, à tenter au 06 63 43 24 24. Horaires déclaratifs — appelle pour réserver.",
  coffee: { name: "Café de l'Abbaye", town: 'Bon-Repos-sur-Blavet', phone: '02 96 24 91 06',
    hours: '10h — 19h en continu, 7j/7', note: 'À 179 m de l’abbaye : le café de 15h07.' },
  fuel: {
    name: 'Système U', town: 'Rue de la Corderie, 22800 Quintin',
    hours: 'Samedi 9h — 22h', at: 'km 143 (74 %) · 541 m du tracé',
    why: "Tu t’arrêtes 40 min à Quintin de toute façon. Il reste 50 km ensuite, et 193 km sur un plein ne pose aucun problème.",
    backup: "Plus tôt si tu préfères : Carrefour d’Uzel, km 54, à 90 m du tracé, samedi 8h-20h.",
    warning: "Piège : la TotalEnergies de Bon-Repos est à 205 m du tracé, juste à ton arrêt de 13h20 — mais elle ferme à 12h le samedi. L’Intermarché de Mûr-de-Bretagne, lui, n’est plus sur ce tracé : 4,6 km à l’écart.",
  },
  /* Galerie dans l'ordre de la journée. Chaque vignette a été regardée avant
   * d'être retenue : la première version puisait dans le fonds numérisé des
   * Archives départementales (AD22 / 16FI), c'est-à-dire des cartes postales
   * anciennes en noir et blanc. Ici, photos couleur uniquement. */
  images: [
    { url: `${WI}/6/6e/Street-art_%40_Moncontour.jpg/500px-Street-art_%40_Moncontour.jpg`, caption: 'Coccinelles peintes dans un mur', location: 'Moncontour' },
    { url: `${WI}/0/05/%C3%89tang_de_la_Touche_%28Tr%C3%A9bry%2C_22%29_-_001.jpg/500px-%C3%89tang_de_la_Touche_%28Tr%C3%A9bry%2C_22%29_-_001.jpg`, caption: 'Étang de la Touche', location: 'Trébry, sous le Mont Bel-Air' },
    { url: `${WI}/4/4f/Saint_Gilles_Vieux_March%C3%A9_05.JPG/500px-Saint_Gilles_Vieux_March%C3%A9_05.JPG`, caption: 'Le bourg fleuri', location: 'Saint-Gilles-Vieux-Marché' },
    { url: `${WI}/4/47/455_Lac_de_Guerl%C3%A9dan.jpg/500px-455_Lac_de_Guerl%C3%A9dan.jpg`, caption: 'Lac de Guerlédan depuis les rochers', location: 'Caurel' },
    { url: `${WI}/6/6f/Zone_d%27escalade_sur_le_lac_de_Guerl%C3%A9dan.jpg/500px-Zone_d%27escalade_sur_le_lac_de_Guerl%C3%A9dan.jpg`, caption: 'Falaise d’escalade sur le lac', location: 'Guerlédan' },
    { url: `${WI}/3/3f/Bretagne%2C_Les_Forges_des_Salles-2266.jpg/500px-Bretagne%2C_Les_Forges_des_Salles-2266.jpg`, caption: 'Hortensias et vélo rouillé', location: 'Les Forges des Salles' },
    { url: `${WI}/c/c2/Abbaye_Notre-Dame-de-Bon-Repos%2C_Saint-Gelven%2C_France.jpg/500px-Abbaye_Notre-Dame-de-Bon-Repos%2C_Saint-Gelven%2C_France.jpg`, caption: 'L’allée de l’abbaye', location: 'Bon-Repos, Saint-Gelven' },
    { url: `${WI}/0/09/451_Blavet_pr%C3%A8s_de_Bon_Repos.jpg/500px-451_Blavet_pr%C3%A8s_de_Bon_Repos.jpg`, caption: 'Le Blavet en contrebas', location: 'Bon-Repos' },
    { url: `${WI}/2/26/Panorama_quintin.jpg/500px-Panorama_quintin.jpg`, caption: 'Le château de Quintin', location: 'Quintin' },
  ],
};

/* ─── Helpers ────────────────────────────────────────────────── */
const isLunchWp = t => t === 'lunch';
const isEdgeWp  = t => t === 'start' || t === 'end';

const dotColor = (type, route) =>
  isEdgeWp(type) ? '#ef4444'
  : isLunchWp(type) ? route.color
  : type === 'fuel' ? '#f59e0b'
  : C.borderHi;

const Label = ({ children, style }) => (
  <div style={{ fontFamily:C.mono, fontSize:9, letterSpacing:'0.18em', color:C.muted, textTransform:'uppercase', marginBottom:8, ...style }}>
    {children}
  </div>
);

/* ─── Route Banner ──────────────────────────────────────────── */
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
          {[
            { val:route.distance,  lbl:'DISTANCE' },
            { val:route.driveTime, lbl:'ROULAGE' },
            { val:route.dayLength, lbl:'JOURNÉE' },
          ].map(({ val, lbl }, i) => (
            <React.Fragment key={lbl}>
              {i > 0 && <div style={{ width:1, height:32, background:C.border }} />}
              <div>
                <div style={{ fontFamily:C.mono, fontSize:'1.4rem', color:route.color, lineHeight:1 }}>{val}</div>
                <div style={{ fontFamily:C.mono, fontSize:8, letterSpacing:'0.18em', color:C.muted, marginTop:2 }}>{lbl}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Visual waypoints strip — la durée de roulage figure sur le lien, pas sur le point.
          paddingTop : overflowX:auto force le navigateur à rogner aussi verticalement,
          et le badge « plein » posé sur le connecteur dépasse de ~4 px au-dessus de la
          ligne des points. La marge haute lui laisse la place au lieu de le couper. */}
      <div style={{ overflowX:'auto', paddingTop:8, paddingBottom:4 }}>
        <div style={{ display:'flex', alignItems:'flex-start', minWidth:'max-content', gap:0 }}>
          {wps.map((wp, i) => {
            const isHi   = isLunchWp(wp.type);
            const dotCol = dotColor(wp.type, route);
            const isLast = i === wps.length - 1;
            const next   = wps[i + 1];
            return (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:0 }}>
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
                      color: isHi?C.bg:isEdgeWp(wp.type)?'#fff':route.color,
                      background: isHi?route.color:isEdgeWp(wp.type)?'#ef4444':`${route.color}18`,
                      padding:'3px 8px', borderRadius:6, lineHeight:1.3,
                    }}>
                      {wp.time}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                      fontSize:11, color:isHi?route.color:isEdgeWp(wp.type)?'#ef4444':C.text,
                      fontWeight: isHi?600:400, whiteSpace:'nowrap', lineHeight:1.2, marginTop:5 }}>
                      {isHi && <Utensils size={11} />}
                      {wp.name}
                    </div>
                    {wp.pause && (
                      <div style={{ fontFamily:C.mono, fontSize:9, color:C.muted, marginTop:3 }}>
                        pause {wp.pause}
                      </div>
                    )}
                  </div>
                </div>
                {!isLast && (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginTop:-2,
                    minWidth: next.fuelBefore ? 108 : 74 }}>
                    <div style={{ display:'flex', alignItems:'center', height:12 }}>
                      <div style={{ height:1.5, width: next.fuelBefore ? 30 : 52,
                        background:`linear-gradient(to right, ${dotCol}60, ${C.borderHi}60)` }} />
                      {next.fuelBefore && (
                        <div title={`${next.fuelBefore.name} · ${next.fuelBefore.at} · ${next.fuelBefore.hours}`}
                          style={{ display:'flex', alignItems:'center', gap:3, margin:'0 4px', padding:'2px 6px',
                            borderRadius:5, background:'#f59e0b1f', border:'1px solid #f59e0b55', color:'#f59e0b',
                            fontFamily:C.mono, fontSize:9, whiteSpace:'nowrap' }}>
                          <Fuel size={9} />plein
                        </div>
                      )}
                      <div style={{ height:1.5, width: next.fuelBefore ? 30 : 0,
                        background:`linear-gradient(to right, ${C.borderHi}60, ${C.borderHi}60)` }} />
                      <div style={{ width:3, height:3, borderTop:`1.5px solid ${C.borderHi}60`, borderRight:`1.5px solid ${C.borderHi}60`, transform:'rotate(45deg)', marginLeft:-2 }} />
                    </div>
                    <div style={{ fontFamily:C.mono, fontSize:9, color:route.color, opacity:.75, marginTop:3, whiteSpace:'nowrap' }}>
                      {next.ride}
                    </div>
                    {next.fuelBefore && (
                      <div style={{ fontFamily:C.mono, fontSize:8, color:'#f59e0b', opacity:.8, marginTop:2, whiteSpace:'nowrap' }}>
                        {next.fuelBefore.at}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTAs */}
      <div style={{ marginTop:20, display:'flex', gap:10, flexWrap:'wrap' }}>
        {route.files.map(f => (
          <a
            key={f.label}
            href={f.url}
            download
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
            <Download size={16} />
            {f.label}
          </a>
        ))}
      </div>
      <div style={{ marginTop:8, fontSize:10, color:C.muted, fontFamily:C.mono, letterSpacing:'0.1em', lineHeight:1.6 }}>
        DEUX FICHIERS GPX · MATIN PUIS APRÈS-MIDI, À CHARGER SÉPARÉMENT
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

/* ─── Bloc d'infos, partagé entre la sidebar desktop et le flux mobile ── */
const SidebarInfoBlock = ({ route }) => {
  const wps = route.waypoints;
  return (
    <>
      {/* Stats */}
      <div style={{ marginBottom:16 }}>
        <Label>Stats</Label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { icon:<Navigation size={12}/>, val:route.distance,  lbl:'Distance' },
            { icon:<Clock size={12}/>,      val:route.driveTime, lbl:'Roulage' },
          ].map(({ icon, val, lbl }) => (
            <div key={lbl} style={{ background:C.surface, borderLeft:`2px solid ${route.color}`, borderRadius:8, padding:'10px 12px' }}>
              <div style={{ color:route.color, marginBottom:4 }}>{icon}</div>
              <div style={{ fontFamily:C.mono, fontSize:'1.1rem', color:route.color, lineHeight:1 }}>{val}</div>
              <div style={{ fontFamily:C.mono, fontSize:8, letterSpacing:'0.15em', color:C.muted, marginTop:3 }}>{lbl.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rythme */}
      <div style={{ marginBottom:16 }}>
        <Label>Rythme</Label>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:'12px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6 }}>
            <Timer size={12} style={{ color:route.color }} />
            <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>8 sessions, très inégales</span>
          </div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {['33', '40', '28', '13', '6', '6', '50', '63'].map(m => (
              <span key={m} style={{ fontFamily:C.mono, fontSize:11, color:route.color,
                background:`${route.color}18`, padding:'2px 7px', borderRadius:5 }}>{m}′</span>
            ))}
          </div>
          <div style={{ fontSize:11, color:'#8899aa', marginTop:8, lineHeight:1.5 }}>
            Gouarec, Bon-Repos et les Forges des Salles sont à 6 et 13 min les uns des autres : cette portion
            forme un seul arrêt éclaté plutôt que trois sessions. Le reste du parcours tient en longs tronçons.
          </div>
        </div>
      </div>

      {/* Pause déjeuner */}
      <div style={{ marginBottom:16 }}>
        <Label>Déjeuner · Beau Rivage</Label>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {route.lunch.map((l, i) => (
            <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:'12px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{l.name}</span>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(l.query)}`} target="_blank" rel="noopener noreferrer"
                  style={{ color:route.color, display:'flex', alignItems:'center', flexShrink:0 }}>
                  <ExternalLink size={12} />
                </a>
              </div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2, fontFamily:C.mono }}>{l.town}</div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:6, flexWrap:'wrap' }}>
                <span style={{ fontFamily:C.mono, fontSize:10, color:route.color, background:`${route.color}18`, padding:'2px 7px', borderRadius:5 }}>
                  {l.hours}
                </span>
                {l.phone && (
                  <a href={`tel:${l.phone.replace(/\s/g, '')}`}
                    style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'#8899aa', textDecoration:'none' }}>
                    <Phone size={10} />{l.phone}
                  </a>
                )}
              </div>
              <div style={{ fontSize:11, color:'#8899aa', marginTop:6, lineHeight:1.5 }}>{l.note}</div>
            </div>
          ))}
          <div style={{ fontSize:11, color:'#c08a4a', lineHeight:1.5, padding:'0 2px' }}>
            ⚠ {route.lunchWarning}
          </div>
        </div>
      </div>

      {/* Café de l'après-midi */}
      <div style={{ marginBottom:16 }}>
        <Label>Café de l’après-midi</Label>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:'12px 14px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{route.coffee.name}</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:2, fontFamily:C.mono }}>{route.coffee.town}</div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:6, flexWrap:'wrap' }}>
            <span style={{ fontFamily:C.mono, fontSize:10, color:route.color, background:`${route.color}18`, padding:'2px 7px', borderRadius:5 }}>
              {route.coffee.hours}
            </span>
            <a href={`tel:${route.coffee.phone.replace(/\s/g, '')}`}
              style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'#8899aa', textDecoration:'none' }}>
              <Phone size={10} />{route.coffee.phone}
            </a>
          </div>
          <div style={{ fontSize:11, color:'#8899aa', marginTop:6, lineHeight:1.5 }}>{route.coffee.note}</div>
          <div style={{ fontSize:11, color:'#c08a4a', marginTop:8, lineHeight:1.5 }}>⚠ {route.abbeyWarning}</div>
        </div>
      </div>

      {/* Essence */}
      <div style={{ marginBottom:16 }}>
        <Label>Essence</Label>
        <div style={{ background:C.surface, borderLeft:'2px solid #f59e0b', borderRadius:9, padding:'12px 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <Fuel size={12} style={{ color:'#f59e0b' }} />
            <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{route.fuel.name}</span>
          </div>
          <div style={{ fontSize:10, color:C.muted, marginTop:3, fontFamily:C.mono }}>{route.fuel.town}</div>
          <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
            <span style={{ fontFamily:C.mono, fontSize:10, color:'#f59e0b', background:'#f59e0b18', padding:'2px 7px', borderRadius:5 }}>
              {route.fuel.hours}
            </span>
            <span style={{ fontFamily:C.mono, fontSize:10, color:'#f59e0b', background:'#f59e0b18', padding:'2px 7px', borderRadius:5 }}>
              {route.fuel.at}
            </span>
          </div>
          <div style={{ fontSize:11, color:'#8899aa', marginTop:8, lineHeight:1.5 }}>{route.fuel.why}</div>
          <div style={{ fontSize:11, color:'#8899aa', marginTop:6, lineHeight:1.5 }}>{route.fuel.backup}</div>
          <div style={{ fontSize:11, color:'#c08a4a', marginTop:6, lineHeight:1.5 }}>⚠ {route.fuel.warning}</div>
        </div>
      </div>

      {/* Highlights */}
      <div style={{ marginBottom:16 }}>
        <Label>Points forts</Label>
        {route.highlights.map((h,i) => (
          <div key={i} style={{ fontSize:12, color:'#8899aa', marginBottom:6, lineHeight:1.5 }}>{h}</div>
        ))}
      </div>

      {/* Étapes */}
      <div style={{ marginBottom:16 }}>
        <Label>Étapes</Label>
        {wps.map((wp,i) => {
          const isHi = isLunchWp(wp.type);
          return (
            <div key={i} style={{ display:'flex', gap:10 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', marginTop:5, flexShrink:0,
                  background: dotColor(wp.type, route),
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
                <div style={{ fontFamily:C.mono, fontSize:9, color:C.muted, marginTop:3 }}>
                  {wp.ride ? `${wp.ride} de roulage · ` : ''}{wp.day}
                </div>
                {wp.via?.length > 0 && (
                  <div style={{ fontSize:10, color:C.muted, marginTop:4, fontStyle:'italic', lineHeight:1.5 }}>
                    en traversée : {wp.via.join(', ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTAs */}
      {route.files.map(f => (
        <a key={f.label} href={f.url} download
          style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
            width:'100%', padding:'12px 16px', borderRadius:10, background:route.color, color:C.bg,
            fontFamily:C.sans, fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none',
            boxShadow:`0 2px 16px ${route.color}40`, marginBottom:8, transition:'opacity 0.2s' }}
          onMouseEnter={e=>e.currentTarget.style.opacity='.82'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          <Download size={14} />
          {f.label}
        </a>
      ))}
    </>
  );
};

/* ─── Main export ────────────────────────────────────────────── */
export default function WeekEndPlanner() {
  const route = ROUTE;

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
          <div style={{ marginBottom:22, paddingBottom:18, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:C.display, fontSize:'2.5rem', lineHeight:0.88, color:C.text, letterSpacing:'0.03em' }}>
              AR<br/>GOAT
            </div>
            <div style={{ fontFamily:C.mono, fontSize:9, letterSpacing:'0.2em', color:C.muted, marginTop:10, lineHeight:1.8 }}>
              {route.day.toUpperCase()} · AU DÉPART D’HÉNANSAL
            </div>
          </div>

          <SidebarInfoBlock route={route} />
        </aside>

        {/* ── MAIN ──────────────────────────────────────────── */}
        <main className="main-scroll" style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>

          {/* Mobile header */}
          <div className="mobile-only" style={{ padding:'18px 18px 0' }}>
            <div style={{ fontFamily:C.display, fontSize:'2.2rem', lineHeight:0.9, color:C.text }}>
              ARGOAT · LE PAYS DES BOIS
            </div>
            <div style={{ fontFamily:C.mono, fontSize:9, letterSpacing:'0.18em', color:C.muted, marginTop:7 }}>
              {route.day.toUpperCase()} · AU DÉPART D’HÉNANSAL
            </div>
          </div>

          <RouteBanner route={route} />

          {/* Mobile info block */}
          <div className="mobile-only" style={{ padding:'16px 18px 0' }}>
            <SidebarInfoBlock route={route} />
          </div>

          <Gallery route={route} />

          <div style={{ padding:'0 20px 20px', fontSize:9, color:C.faint, fontFamily:C.mono, letterSpacing:'0.12em', lineHeight:1.8 }}>
            TOMTOM MOTORCYCLE · THRILLING · HILLINESS HIGH · WINDINGNESS HIGH · SANS TRAFIC<br />
            DISTANCES MESURÉES SUR LA TRACE · DURÉES ESTIMÉES · DÉPART SAMEDI 8H30<br />
            HORAIRES DÉCLARATIFS — À CONFIRMER PAR TÉLÉPHONE
          </div>
        </main>
      </div>
    </div>
  );
}
