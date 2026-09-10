import React from 'react';
import { MapPin, ExternalLink, Camera, Navigation, Clock, Map, Download, Fuel, Phone, Timer, Utensils } from 'lucide-react';

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
  distance: '229 km', driveTime: '5h23', dayLength: '9h08',
  day: 'Samedi',
  googleMapsUrl: 'https://www.google.com/maps/dir/48.5409784,-2.4330858/48.3506,-2.5498/48.3002,-2.9012/48.206,-3.047/48.1996,-3.1268/48.2128,-3.1282/48.4033,-2.91/48.5409784,-2.4330858',
  gpxUrl: '/trace.gpx',
  waypoints: [
    { name: 'Hénansal', type: 'start', time: '9h00', day: 'Départ', note: 'Réservoir plein' },
    { name: 'Mont Bel-Air', type: 'stop', time: '9h43', ride: '43 min', pause: '25 min',
      day: 'Panorama, 339 m', via: ['Moncontour'] },
    { name: 'Cascade de Bosméléac', type: 'stop', time: '11h01', ride: '53 min', pause: '25 min',
      day: 'Lac, barrage & aqueduc', via: ['Le Quillio'] },
    { name: "L'Embarcadère", type: 'lunch', time: '12h11', ride: '45 min', pause: '1h15',
      day: 'Déjeuner · Beau Rivage, Caurel', via: ['Saint-Martin-des-Prés', 'Gorges du Poulancre'] },
    { name: 'Les Forges des Salles', type: 'stop', time: '14h17', ride: '51 min', pause: '40 min',
      day: 'Village-usine du XVIIIᵉ · samedi 14h-18h',
      // Arrêt technique 6 km après le déjeuner : pas une étape du rythme, mais il
      // doit se voir sur la frise, sinon on croit qu'il n'y a pas de plein prévu.
      fuelBefore: { name: 'Intermarché Mûr-de-Bretagne', at: 'km 114', hours: 'sam 9h-19h' },
      via: ['Écluse de Guerlédan', 'Anse de Sordan'] },
    { name: 'Abbaye de Bon-Repos', type: 'stop', time: '15h07', ride: '10 min', pause: '20 min',
      day: 'Ruines & Café de l’Abbaye, 4 km plus loin' },
    { name: 'Quintin', type: 'stop', time: '16h28', ride: '61 min', pause: '40 min',
      day: 'Cité de caractère · station de repli', via: ['Gorges du Daoulas', 'Saint-Nicolas-du-Pélem', 'Le Haut-Corlay'] },
    { name: 'Hénansal', type: 'end', time: '18h09', ride: '61 min', day: 'Retour' },
  ],
  highlights: [
    '⛰️ Mont Bel-Air, 339 m — le toit de l’est du département',
    '💧 Cascade et barrage de Bosméléac, sur l’aqueduc',
    '🌊 Tour complet du lac de Guerlédan, rives nord et sud',
    '🔨 Les Forges des Salles, village-usine du XVIIIᵉ conservé en l’état',
    '🏛️ Abbaye de Bon-Repos, ruines cisterciennes sur le Blavet',
    '🪨 Gorges du Daoulas — barres de schiste dressées, 7 km de D44',
  ],
  abbeyWarning: "L'abbaye de Bon-Repos est donnée ouverte 14h-18h du dimanche au vendredi — le samedi manque. Vérifie au 02 96 24 82 20 : si elle ouvre, reprends 20 min sur les Forges.",
  roads: [
    { name: 'Voies communales', km: '81,3 km' },
    { name: 'D28', km: '28,7 km' },
    { name: 'D768', km: '22,1 km' },
    { name: 'D35', km: '18,4 km' },
    { name: 'D14', km: '8,9 km' },
    { name: 'D44 (gorges du Daoulas)', km: '5,8 km' },
  ],
  lunch: [
    { name: "L'Embarcadère", town: 'Beau Rivage, 22530 Caurel',
      hours: 'Samedi 9h — minuit', phone: '02 96 28 52 64',
      note: 'Au ponton des Vedettes de Guerlédan, les pieds dans le lac. Service continu.',
      query: "Restaurant l'Embarcadère Beau Rivage Caurel" },
    { name: "Cap'Tain Cook", town: '56 Rue Roc Hell, 22530 Caurel',
      hours: 'Samedi 9h — 22h', phone: '02 96 67 11 00',
      note: 'Sans façon, à 1,5 km du ponton.',
      query: "Cap'Tain Cook Caurel" },
    { name: 'Betty Food', town: '3 Le Mané, 22530 Caurel',
      hours: 'Samedi 11h — 23h', phone: '',
      note: 'Snack, à 680 m. Si tu veux expédier le déjeuner et rouler plus.',
      query: 'Betty Food Caurel' },
  ],
  lunchWarning: "À éviter : l'Auberge de Guerlédan ne sert que de 12h à 13h. Il y a aussi La Dame du Lac à 90 m du point de déjeuner, en bord d'eau — mais la base la classe en bar et ne donne aucun horaire, à tenter au 06 63 43 24 24. Horaires déclaratifs — appelle pour réserver.",
  coffee: { name: "Café de l'Abbaye", town: 'Bon-Repos-sur-Blavet', phone: '02 96 24 91 06',
    hours: '10h — 19h en continu, 7j/7', note: 'À 179 m de l’abbaye : le café de 15h07.' },
  fuel: {
    name: 'Intermarché', town: '5 Rue de Pontivy, 22530 Guerlédan (Mûr-de-Bretagne)',
    hours: 'Samedi 9h — 19h, 7j/7', at: 'km 114 (50 %) · 980 m du tracé',
    why: "6 km après le déjeuner, en tout début de session : tu sors de table, tu fais le plein, il te reste 111 km. Le crochet coûte 2 km aller-retour.",
    backup: "Repli : Système U de Quintin (km 177, samedi 9h-22h, 545 m du tracé) — tu y es arrêté 40 min de toute façon.",
    warning: "Deux stations idéalement placées mais inutilisables ce jour-là : la TotalEnergies de Bon-Repos (22 m du tracé, mais samedi 9h-12h et on y passe vers 15h) et le Carrefour de Corlay (212 m du tracé, fermé le samedi).",
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

      {/* Visual waypoints strip — la durée de roulage figure sur le lien, pas sur le point */}
      <div style={{ overflowX:'auto', paddingBottom:4 }}>
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
        <a
          href={route.gpxUrl}
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
          Télécharger la trace GPX
        </a>
        <a
          href={route.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
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
          <Map size={16} />
          Aperçu Google Maps
          <ExternalLink size={13} style={{ opacity:0.7 }} />
        </a>
      </div>
      <div style={{ marginTop:8, fontSize:10, color:C.muted, fontFamily:C.mono, letterSpacing:'0.1em', lineHeight:1.6 }}>
        GPX = NAVIGATION · 12 REPÈRES (8 ÉTAPES, 2 STATIONS, 2 RESTOS DE REPLI)<br />
        HORAIRES ET TÉLÉPHONES DANS LA DESCRIPTION DE CHAQUE POINT<br />
        ITINÉRAIRE 120 POINTS, TRACE 1103 POINTS<br />
        GOOGLE MAPS = APERÇU SEULEMENT · IL RECALCULE ENTRE LES ÉTAPES
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
            <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>6 sessions, aucune sous 43 min</span>
          </div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {['43', '53', '45', '51', '61', '61'].map(m => (
              <span key={m} style={{ fontFamily:C.mono, fontSize:11, color:route.color,
                background:`${route.color}18`, padding:'2px 7px', borderRadius:5 }}>{m}′</span>
            ))}
          </div>
          <div style={{ fontSize:11, color:'#8899aa', marginTop:8, lineHeight:1.5 }}>
            Les lieux traversés sont vus depuis la selle : s’y arrêter ferait tomber les sessions sous 40 min.
            Les 4 km entre les Forges des Salles et Bon-Repos sont un déplacement interne à l’arrêt, pas une session.
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

      {/* Routes empruntées */}
      <div style={{ marginBottom:20 }}>
        <Label>Routes empruntées</Label>
        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
          {route.roads.map(r => (
            <span key={r.name} style={{ fontFamily:C.mono, fontSize:10, color:'#8899aa',
              background:C.surface, border:`1px solid ${C.border}`, padding:'3px 8px', borderRadius:5 }}>
              {r.name} · {r.km}
            </span>
          ))}
        </div>
        <div style={{ fontSize:11, color:'#8899aa', marginTop:8, lineHeight:1.5 }}>
          Aucune voie rapide, pas même les 400 m de D767 qui subsistaient : l'anti-recouvrement les a fait disparaître.
        </div>
      </div>

      {/* CTAs */}
      <a href={route.gpxUrl} download
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          width:'100%', padding:'12px 16px', borderRadius:10, background:route.color, color:C.bg,
          fontFamily:C.sans, fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none',
          boxShadow:`0 2px 16px ${route.color}40`, transition:'opacity 0.2s' }}
        onMouseEnter={e=>e.currentTarget.style.opacity='.82'}
        onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
        <Download size={14} />
        Trace GPX
      </a>
      <a href={route.googleMapsUrl} target="_blank" rel="noopener noreferrer"
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          width:'100%', padding:'12px 16px', borderRadius:10, background:'transparent', color:route.color,
          border:`1.5px solid ${route.color}60`,
          fontFamily:C.sans, fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none',
          marginTop:8, transition:'background 0.2s' }}
        onMouseEnter={e=>e.currentTarget.style.background=`${route.color}14`}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <Map size={14} />
        Aperçu Google Maps
        <ExternalLink size={12} style={{ opacity:0.7 }} />
      </a>
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
            DURÉES CALCULÉES POUR UN DÉPART LE SAMEDI À 9H00 (departAt)<br />
            HORAIRES DÉCLARATIFS — À CONFIRMER PAR TÉLÉPHONE
          </div>
        </main>
      </div>
    </div>
  );
}
