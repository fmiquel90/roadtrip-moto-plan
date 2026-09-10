import { writeFileSync } from 'node:fs';

const API_KEY = process.env.TOMTOM_API_KEY;
if (!API_KEY) {
  console.error('Missing TOMTOM_API_KEY. Run with: node --env-file=.env scripts/tomtom-scenic-route.mjs');
  process.exit(1);
}

// Boucle "Argoat", au départ d'Hénansal, dans l'ordre de passage.
// Argoat = le pays des bois, par opposition à l'Armor, le pays de la mer : c'est
// exactement le sujet de cette boucle, qui tourne le dos à la côte.
//
// Coordonnées saisies en dur plutôt que résolues par recherche POI : la recherche
// floue s'était déjà trompée de site (une "Pointe du Château" à Perros-Guirec avait
// renvoyé le Chapeau de Napoléon, à 30 km du vrai lieu). Chaque point ci-dessous a
// été vérifié individuellement contre sa position attendue.
//
// role:
//   'stop'  -> arrêt réel, apparaît comme étape dans le GPX et le lien Google Maps
//   'lunch' -> le déjeuner
//   'fuel'  -> le plein
//   'shape' -> point de passage qui force le tracé sans être une étape
//
// Le rythme vise 40 à 60 min de roulage entre deux arrêts réels : les 'shape'
// servent justement à allonger les sessions sans multiplier les arrêts.
// `desc` part dans le GPX : c'est ce que le GPS affiche quand on sélectionne le
// point. Horaire, durée, téléphone — de quoi décider sans sortir le portable.
// `sym` est le nom d'icône Garmin, le jeu que la plupart des appareils
// reconnaissent ; ceux qui ne le connaissent pas retombent sur l'icône par défaut.
const STOPS = [
  { name: '01 DEPART - Henansal',       lat: 48.5409784, lon: -2.4330858, role: 'stop',  sym: 'Flag, Green',
    desc: '9h00 · réservoir plein la veille' },
  { name: 'Moncontour',              lat: 48.3611,    lon: -2.6326,    role: 'shape' },
  { name: '02 Mont Bel-Air',            lat: 48.3506,    lon: -2.5498,    role: 'stop',  sym: 'Summit',
    desc: '9h43 · arrêt 25 min · panorama 339 m, aucun commerce' },
  { name: 'Le Quillio',              lat: 48.2407,    lon: -2.8825,    role: 'shape' },
  { name: '03 Cascade de Bosmeleac',    lat: 48.3002,    lon: -2.9012,    role: 'stop',  sym: 'Scenic Area',
    desc: '11h01 · arrêt 25 min · lac, barrage et aqueduc, aucun commerce' },
  // Sans ce crochet, la descente vers le lac ne fait que 34 min et la session
  // d'avant-déjeuner tombe sous les 40 min voulues. Il coûte 5 km pour 10 min.
  { name: 'Saint-Martin-des-Prés',   lat: 48.3060,    lon: -2.9600,    role: 'shape' },
  { name: 'Gorges du Poulancre',     lat: 48.2539,    lon: -3.0070,    role: 'shape' },
  // Coordonnées du restaurant lui-même, pas du lieu-dit : le GPS doit amener
  // devant la porte.
  { name: "04 DEJEUNER - L'Embarcadere", lat: 48.20593, lon: -3.04854,    role: 'lunch', sym: 'Restaurant',
    desc: '12h11 · 1h15 · Beau Rivage, Caurel · 02 96 28 52 64 · samedi 9h-minuit, service continu' },
  { name: 'Écluse de Guerlédan',     lat: 48.1900,    lon: -3.0174,    role: 'shape' },
  { name: 'Anse de Sordan',          lat: 48.2023,    lon: -3.0679,    role: 'shape' },
  // Les Forges des Salles ouvre le samedi 14h-18h, l'abbaye de Bon-Repos non
  // (TomTom lui donne jeu/ven/dim/lun/mar/mer, pas samedi). Le vrai arrêt de
  // l'après-midi est donc ici, et l'abbaye 4 km plus loin n'est qu'un crochet.
  { name: '05 Forges des Salles',   lat: 48.1996,    lon: -3.1268,    role: 'stop',  sym: 'Museum',
    desc: '14h17 · arrêt 40 min · village-usine du XVIIIe · samedi 14h-18h · 07 83 14 70 63' },
  { name: '06 Abbaye de Bon-Repos',     lat: 48.2128,    lon: -3.1282,    role: 'stop',  sym: 'Church',
    desc: "15h07 · arrêt 20 min · ruines · Café de l'Abbaye 10h-19h 7j/7 · visite peut-être fermée le samedi, 02 96 24 82 20" },
  { name: 'Gorges du Daoulas',       lat: 48.2270,    lon: -3.1230,    role: 'shape' },
  { name: 'Saint-Nicolas-du-Pélem',  lat: 48.3154,    lon: -3.1599,    role: 'shape' },
  { name: 'Le Haut-Corlay',          lat: 48.3217,    lon: -3.0564,    role: 'shape' },
  { name: '07 Quintin',                 lat: 48.4033,    lon: -2.9100,    role: 'stop',  sym: 'City (Small)',
    desc: '16h28 · arrêt 40 min · cité de caractère · station U de repli à 545 m' },
  { name: '08 ARRIVEE - Henansal',       lat: 48.5409784, lon: -2.4330858, role: 'stop',  sym: 'Flag, Red',
    desc: '18h09 · 229 km, 5h23 de roulage' },
];

// Repères posés sur la carte du GPS sans entrer dans le calcul d'itinéraire.
// La station principale est à 980 m du tracé : en faire un point de passage
// obligerait TomTom à recomposer toute la branche pour y aller (l'essai
// précédent ramenait 7 km de D767). En simple <wpt>, elle s'affiche sur le GPS
// et le tracé ne bouge pas — le crochet de 2 km se fait à vue.
// Les solutions de repli sont là pour le jour où le premier choix est fermé
// ou complet : mieux vaut les avoir dans l'appareil que sur un bout de papier.
const MARKERS = [
  { name: '04 PLEIN - Intermarche Mur-de-Bretagne', lat: 48.1985, lon: -2.9871, role: 'fuel', sym: 'Gas Station',
    desc: 'samedi 9h-19h, ouvert 7j/7 · 980 m du tracé, crochet de 2 km A/R' },
  { name: '07 PLEIN secours - Systeme U Quintin', lat: 48.4081, lon: -2.9187, role: 'fuel', backup: true, sym: 'Gas Station',
    desc: 'samedi 9h-22h · à éviter : Bon-Repos ferme à 12h le samedi, Corlay est fermé' },
  { name: "04 option RESTO - Cap Tain Cook",  lat: 48.21630, lon: -3.03703, role: 'food', sym: 'Restaurant',
    desc: 'Caurel · samedi 9h-22h · 02 96 67 11 00' },
  { name: '04 option RESTO - Betty Food snack',     lat: 48.21180, lon: -3.04990, role: 'food', sym: 'Fast Food',
    desc: 'Caurel · snack · samedi 11h-23h' },
];

const ROUTE_NAME = 'Argoat — Guerlédan & gorges du Daoulas';
const GPX_OUTPUT_PATH = new URL('../public/trace.gpx', import.meta.url);
const ITN_OUTPUT_PATH = new URL('../public/trace.itn', import.meta.url);

// Le .itn est le format d'itinéraire propre à TomTom. Son intérêt ici : il
// distingue les points de PASSAGE des points d'ARRÊT, ce que le GPX ne sait pas
// faire. On peut donc y mettre les points de forme qui tiennent le tracé sans
// qu'ils polluent la liste des étapes, et n'annoncer que les vrais arrêts.
//
// Une ligne par point : longitude|latitude|libellé|indicateur|
// Les coordonnées sont des entiers, en degrés multipliés par 100000.
const ITN_FLAG = { departure: 0, stop: 1, via: 2, destination: 3 };

// Plafond du .itn. Les TomTom anciens s'arrêtaient à 48 points ; les récents
// acceptent nettement plus. À baisser si l'appareil refuse le fichier.
const ITN_MAX_POINTS = 100;

// 'high' sur les deux : sur ce même tracé, passer de 'normal' à 'high' rallonge
// nettement la part de voies communales sans coûter de temps.
const HILLINESS = 'high';
const WINDINGNESS = 'high';

// Date et heure réelles du départ. Sans ce paramètre, TomTom calcule pour
// l'instant présent : la même requête rendait 4h59 en fin de matinée et 5h29
// plus tôt dans la journée, parce que le modèle de vitesses dépend de l'heure.
// À mettre à jour si la sortie change de date.
const DEPART_AT = '2026-09-12T09:00:00+02:00';   // samedi 9h00

// Tolérance de simplification de la trace, en mètres. La trace brute fait plusieurs
// milliers de points ; un GPS moto n'en a pas besoin d'autant pour suivre la route.
const TRACK_TOLERANCE_M = 12;

// Points de forme du <rte>. Entre deux points de forme, le GPS recalcule avec son
// propre profil : trop espacés, il quitte le tracé. Mesuré sur la version à 40
// points répartis à l'index, 19 segments sur 39 divergeaient, jusqu'à 1,5 km.
// D'où deux règles : un point juste après chaque intersection où l'on tourne (là
// où un recalcul peut partir ailleurs), et du remplissage pour qu'aucun trou ne
// dépasse MAX_GAP_M sur les longues portions sans intersection.
const MAX_GAP_M = 2500;
const TURN_OFFSET_M = 120;   // on pose le point APRÈS le virage, pas dessus :
                             // sur l'intersection même, le GPS peut l'accrocher
                             // à la mauvaise branche.
// Plafond : au-delà, certains GPS refusent l'itinéraire. À baisser si le tien râle.
const MAX_SHAPING_POINTS = 120;

// Que met-on dans le <rte> ? Trois essais successifs sur plan.tomtom.com ont
// tranché la question :
//
//   'shaping' — les 120 points de forme. Le GPS ne peut plus recalculer par
//               ailleurs, mais un planificateur les liste comme autant
//               d'étapes : « 118 steps » numérotées, illisible.
//   'none'    — pas de <rte> du tout. Trace propre, mais plan.tomtom.com
//               ignore aussi les <wpt> : plus aucun arrêt nulle part.
//   'stops'   — le <rte> ne contient que les 10 arrêts. Ils apparaissent bien
//               comme étapes, mais l'outil recalcule le chemin entre eux :
//               mesuré, les 9 segments divergent, jusqu'à 7,9 km d'écart. Ce
//               n'est plus la même balade. Écarté.
//
// Aucun des trois ne donne à la fois la fidélité du tracé et des arrêts nommés
// sur ce planificateur-là, parce qu'il nomme les étapes par leur adresse et
// ignore les <wpt>. On garde donc 'none', qui est le format le plus portable :
// une trace exacte que tous les outils dessinent pareil, et 12 points nommés
// que la plupart affichent. plan.tomtom.com est l'exception qui les ignore.
const ROUTE_MODE = 'none';

function isRealStop(role) {
  return role !== 'shape';
}

async function calculateRoute() {
  const locations = STOPS.map(s => `${s.lat},${s.lon}`).join(':');
  const url = `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json` +
    `?key=${API_KEY}&travelMode=motorcycle&routeType=thrilling` +
    `&hilliness=${HILLINESS}&windingness=${WINDINGNESS}` +
    // traffic=false pour ignorer le trafic live, departAt pour que le modèle de
    // vitesses soit celui du samedi matin et non celui de l'heure du calcul.
    `&traffic=false&departAt=${encodeURIComponent(DEPART_AT)}` +
    // alreadyUsedRoads : la boucle repassait sur 10 % de son propre tracé —
    // 13 km entre Hénansal et Lamballe et 16 km autour du Mont Bel-Air, à l'aller
    // comme au retour. Sur ces portions le GPS ne peut pas deviner quel passage
    // est visé et coupe la boucle. Cette option ramène le recouvrement à 0,8 %.
    `&avoid=alreadyUsedRoads` +
    `&instructionsType=text&language=fr-FR`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Routing failed: ${res.status} ${await res.text()}`);
  return (await res.json()).routes[0];
}

// Douglas-Peucker sur la distance perpendiculaire.
// Les longitudes sont remises à l'échelle par cos(latitude) : à 48°N un degré de
// longitude vaut ~74 km contre ~111 km pour un degré de latitude. Sans cette
// correction la tolérance valait en réalité ~18 m est-ouest pour 12 m nord-sud,
// et la trace coupait les virages davantage dans un sens que dans l'autre.
function simplify(points, toleranceM) {
  if (points.length < 3) return points;
  const tol = toleranceM / 111320;
  const midLat = points[Math.floor(points.length / 2)].latitude;
  const kx = Math.cos(midLat * Math.PI / 180);

  const perpendicular = (p, a, b) => {
    const dx = (b.longitude - a.longitude) * kx, dy = b.latitude - a.latitude;
    const px = (p.longitude - a.longitude) * kx, py = p.latitude - a.latitude;
    if (dx === 0 && dy === 0) return Math.hypot(px, py);
    const t = (px * dx + py * dy) / (dx * dx + dy * dy);
    const c = Math.max(0, Math.min(1, t));
    return Math.hypot(px - c * dx, py - c * dy);
  };

  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxDist = 0, index = -1;
    for (let i = first + 1; i < last; i++) {
      const d = perpendicular(points[i], points[first], points[last]);
      if (d > maxDist) { maxDist = d; index = i; }
    }
    if (maxDist > tol && index !== -1) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

const EARTH_R = 6371000;
function metres(a, b) {
  const r = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * r, dLon = (b.longitude - a.longitude) * r;
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * r) * Math.cos(b.latitude * r) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
}

function cumulative(points) {
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum[i] = cum[i - 1] + metres(points[i - 1], points[i]);
  return cum;
}

// Les points de forme sont posés sur la géométrie brute, pas sur la trace
// simplifiée : ils doivent tomber exactement sur la route, pas sur une corde.
function buildShapingPoints(route, rawPoints) {
  const cum = cumulative(rawPoints);
  const total = cum[cum.length - 1];
  const at = offset => {
    const target = Math.max(0, Math.min(total, offset));
    let lo = 0, hi = cum.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < target) lo = mid + 1; else hi = mid; }
    return lo;
  };

  // Obligatoires : les extrémités et un point après chaque intersection où l'on
  // tourne. Ce sont les endroits où un recalcul peut partir sur une autre route.
  const must = new Set([0, total]);
  for (const ins of route.guidance?.instructions ?? []) {
    if (!/TURN|ROUNDABOUT|KEEP|BEAR|FORK|EXIT/i.test(ins.maneuver ?? '')) continue;
    const o = ins.routeOffsetInMeters + TURN_OFFSET_M;
    if (o > 0 && o < total) must.add(o);
  }

  let chosen = [...must].sort((a, b) => a - b);
  const turnCount = chosen.length;

  // 1. Combler : aucun trou au-dessus de MAX_GAP_M, y compris sur les longues
  //    portions sans intersection — le GPS peut aussi filer par une parallèle
  //    plus directe sans qu'aucun virage ne figure dans le guidage.
  for (let i = 1; i < chosen.length; i++) {
    const gap = chosen[i] - chosen[i - 1];
    if (gap <= MAX_GAP_M) continue;
    const n = Math.ceil(gap / MAX_GAP_M);
    const inserts = Array.from({ length: n - 1 }, (_, k) => chosen[i - 1] + (gap * (k + 1)) / n);
    chosen.splice(i, 0, ...inserts);
    i += inserts.length;
  }

  // 2. Éclaircir jusqu'au plafond en retirant à chaque tour le point le plus
  //    redondant — celui dont la suppression laisse le plus petit trou. Un
  //    éclaircissage régulier (un point sur N) ferait l'inverse : les virages
  //    étant groupés dans les portions sinueuses, il viderait les lignes droites.
  while (chosen.length > MAX_SHAPING_POINTS) {
    let victim = -1, smallest = Infinity;
    for (let i = 1; i < chosen.length - 1; i++) {
      const resulting = chosen[i + 1] - chosen[i - 1];
      if (resulting < smallest) { smallest = resulting; victim = i; }
    }
    chosen.splice(victim, 1);
  }

  return { points: chosen.map(o => rawPoints[at(o)]), offsets: chosen, total, turnCount };
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h${String(m).padStart(2, '0')}`;
}

function reportLegs(route) {
  console.log('\nDétail par tronçon (cumul de roulage entre arrêts réels) :');
  let cumulativeM = 0;
  let sinceStopS = 0;
  route.legs.forEach((leg, i) => {
    const to = STOPS[i + 1];
    cumulativeM += leg.summary.lengthInMeters;
    sinceStopS += leg.summary.travelTimeInSeconds;
    const km = Math.round(leg.summary.lengthInMeters / 1000);
    const min = Math.round(leg.summary.travelTimeInSeconds / 60);
    const marker = isRealStop(to.role) ? '●' : '·';
    let line = `  ${marker} ${to.name.padEnd(28)} +${String(km).padStart(3)}km ${String(min).padStart(3)}min` +
      `   cumul ${String(Math.round(cumulativeM / 1000)).padStart(3)}km`;
    if (isRealStop(to.role)) {
      line += `   << session de ${Math.round(sinceStopS / 60)} min`;
      sinceStopS = 0;
    }
    console.log(line);
  });
}

function reportRoads(route) {
  const instructions = route.guidance?.instructions ?? [];
  const total = route.summary.lengthInMeters;
  const byRoad = {};
  instructions.forEach((ins, i) => {
    const start = ins.routeOffsetInMeters;
    const end = i + 1 < instructions.length ? instructions[i + 1].routeOffsetInMeters : total;
    const key = ins.roadNumbers?.[0] ?? 'voies communales';
    byRoad[key] = (byRoad[key] ?? 0) + (end - start);
  });
  const top = Object.entries(byRoad)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([road, m]) => `${road} ${(m / 1000).toFixed(1)}km`);
  console.log('\nRoutes les plus empruntées :', top.join(', '));

  // Garde-fou : ces axes sont les voies rapides du secteur, on ne veut pas les voir.
  const fastRoads = ['N12', 'N164', 'D700', 'D712', 'D767', 'E50'];
  const found = fastRoads.filter(r => byRoad[r]).map(r => `${r} ${(byRoad[r] / 1000).toFixed(1)}km`);
  console.log(found.length ? `⚠ Voies rapides sur le tracé : ${found.join(', ')}` : '✓ Aucune voie rapide sur le tracé');
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function waypointXml(s) {
  const parts = [`<name>${esc(s.name)}</name>`];
  if (s.desc) parts.push(`<desc>${esc(s.desc)}</desc>`, `<cmt>${esc(s.desc)}</cmt>`);
  if (s.sym) parts.push(`<sym>${esc(s.sym)}</sym>`);
  parts.push(`<type>${s.role}</type>`);
  return `  <wpt lat="${s.lat}" lon="${s.lon}">${parts.join('')}</wpt>`;
}

// Position d'un point le long du parcours, en km. Sert à trier les repères et à
// afficher le kilométrage : un GPS qui liste les <wpt> les rend dans l'ordre du
// fichier, donc ranger le fichier dans l'ordre de la route rend la liste lisible
// sans aucun réglage sur l'appareil.
function alongTrack(point, trackPoints, cum) {
  let best = Infinity, at = 0;
  for (let i = 0; i < trackPoints.length; i++) {
    const d = metres({ latitude: point.lat, longitude: point.lon }, trackPoints[i]);
    if (d < best) { best = d; at = cum[i]; }
  }
  return at / 1000;
}

function orderedWaypoints(trackPoints) {
  const cum = cumulative(trackPoints);
  const all = [...STOPS.filter(s => isRealStop(s.role)), ...MARKERS]
    .map(s => ({ ...s, km: alongTrack(s, trackPoints, cum) }));

  // Le retour tombe au même endroit que le départ : sans ça il remonterait en tête.
  const last = all.find(s => s.name.startsWith('08 '));
  if (last) last.km = cum[cum.length - 1] / 1000;

  all.sort((a, b) => a.km - b.km);
  return all.map(s => ({ ...s, desc: `km ${Math.round(s.km)} · ${s.desc}` }));
}

// Un GPX contient trois structures indépendantes : <wpt>, <rte> et <trk>. Les
// noms ne vivaient que dans les <wpt>, or beaucoup d'appareils n'affichent que
// l'itinéraire — soit 120 points de forme anonymes, les repères étant rangés
// ailleurs en favoris, voire ignorés. On reporte donc chaque libellé sur le
// point d'itinéraire le plus proche : le déjeuner et la station deviennent
// visibles dans l'itinéraire lui-même, sans rien déplacer.
function labelRoutePoints(labels, shaping) {
  const byIndex = new Map();
  for (const item of labels) {
    let best = Infinity, at = -1;
    for (let i = 0; i < shaping.offsets.length; i++) {
      const d = Math.abs(shaping.offsets[i] / 1000 - item.km);
      if (d < best) { best = d; at = i; }
    }
    // Deux libellés ne peuvent pas partager le même point de forme.
    while (byIndex.has(at) && at < shaping.offsets.length - 1) at++;
    byIndex.set(at, item);
  }
  return byIndex;
}

function buildItn({ routePoints, labels, shaping }) {
  // Le .itn est l'itinéraire qu'on roule : les solutions de repli n'y ont pas
  // leur place. En faire des arrêts enverrait le GPS faire un détour vers
  // chacune d'elles. Elles restent en <wpt> dans le GPX.
  const planned = labels.filter(s => s.role !== 'food' && !s.backup);
  const labelled = labelRoutePoints(planned, shaping);
  const arrival = planned[planned.length - 1];

  // Un point par point de forme, remplacé par l'arrêt lui-même là où il y en a
  // un : ainsi le .itn tient le tracé ET s'arrête aux bons endroits.
  let points = routePoints.map((p, i) => {
    const item = labelled.get(i);
    if (!item) return { lat: p.latitude, lon: p.longitude, name: '', flag: ITN_FLAG.via };
    return { lat: item.lat, lon: item.lon, name: item.name, flag: ITN_FLAG.stop };
  });

  // Départ et arrivée sont les deux extrémités, nommées : sans ça l'arrivée
  // apparaissait deux fois, une fois nommée et une fois vide.
  points = points.filter((p, i) => !(p.name === arrival.name && i !== points.length - 1));
  points[0] = { lat: labels[0].lat, lon: labels[0].lon, name: labels[0].name, flag: ITN_FLAG.departure };
  points[points.length - 1] = { lat: arrival.lat, lon: arrival.lon, name: arrival.name, flag: ITN_FLAG.destination };

  // Écrêtage : on ne retire que des points de passage, jamais un arrêt, en
  // commençant par les plus redondants — même règle que pour les <rtept>.
  while (points.length > ITN_MAX_POINTS) {
    let victim = -1, smallest = Infinity;
    for (let i = 1; i < points.length - 1; i++) {
      if (points[i].flag !== ITN_FLAG.via) continue;
      const gap = metres(
        { latitude: points[i - 1].lat, longitude: points[i - 1].lon },
        { latitude: points[i + 1].lat, longitude: points[i + 1].lon });
      if (gap < smallest) { smallest = gap; victim = i; }
    }
    if (victim === -1) break;   // plus que des arrêts
    points.splice(victim, 1);
  }

  const coord = v => Math.round(v * 100000);
  // Le séparateur du format est la barre verticale : elle ne doit pas figurer
  // dans un libellé.
  const label = s => s.replace(/\|/g, '-');
  return points.map(p => `${coord(p.lon)}|${coord(p.lat)}|${label(p.name)}|${p.flag}|`).join('\n') + '\n';
}

function buildGpx({ name, trackPoints, routePoints, labels, shaping }) {
  // Les arrêts réels et les repères hors tracé, rangés dans l'ordre de passage :
  // les points de forme n'ont rien à faire dans le roadbook.
  const wpts = labels.map(waypointXml).join('\n');
  const labelled = labelRoutePoints(labels, shaping);

  // <rte> : itinéraire léger, c'est ce qu'un TomTom sait recalculer.
  // En mode 'stops', les points du <rte> sont les arrêts eux-mêmes. Les deux
  // restos de repli en sont exclus : ce sont des solutions de rechange, en
  // faire des étapes forcerait un détour vers chacune d'elles.
  const rteSource = ROUTE_MODE === 'stops'
    ? labels.filter(s => s.role !== 'food')
        .map(s => ({ latitude: s.lat, longitude: s.lon, label: s }))
    : routePoints.map((p, i) => ({ ...p, label: labelled.get(i) }));

  const rtepts = rteSource.map(p => {
    const item = p.label;
    if (!item) return `    <rtept lat="${p.latitude}" lon="${p.longitude}"></rtept>`;
    const inner = `<name>${esc(item.name)}</name><desc>${esc(item.desc)}</desc>` +
      `<cmt>${esc(item.desc)}</cmt>` + (item.sym ? `<sym>${esc(item.sym)}</sym>` : '');
    return `    <rtept lat="${p.latitude}" lon="${p.longitude}">${inner}</rtept>`;
  }).join('\n');

  // <trk> : la trace fidèle, pour vérifier le tracé exact.
  const trkpts = trackPoints.map(p =>
    `      <trkpt lat="${p.latitude}" lon="${p.longitude}"></trkpt>`
  ).join('\n');

  const rteBlock = ROUTE_MODE !== 'none' ? `  <rte>
    <name>${esc(name)} (itinéraire)</name>
${rtepts}
  </rte>
` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="tomtom-scenic-route" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${esc(name)}</name></metadata>
${wpts}
${rteBlock}  <trk>
    <name>${esc(name)} (trace)</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;
}

async function main() {
  console.log(`Calcul TomTom — ${ROUTE_NAME} (motorcycle / thrilling / ${HILLINESS} / ${WINDINGNESS})`);
  const route = await calculateRoute();

  const { lengthInMeters, travelTimeInSeconds } = route.summary;
  console.log(`\nDistance : ${Math.round(lengthInMeters / 1000)} km — Roulage : ${formatDuration(travelTimeInSeconds)}`);

  reportLegs(route);
  reportRoads(route);

  const allPoints = route.legs.flatMap(leg => leg.points);
  const trackPoints = simplify(allPoints, TRACK_TOLERANCE_M);
  const shaping = buildShapingPoints(route, allPoints);
  const routePoints = shaping.points;

  const gaps = shaping.offsets.slice(1).map((o, i) => o - shaping.offsets[i]);
  console.log(`\nPoints de forme : ${routePoints.length} (dont ${shaping.turnCount} intersections)` +
    ` · trou moyen ${Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)} m` +
    ` · plus grand trou ${Math.round(Math.max(...gaps))} m`);

  // Lien Google Maps construit sur les arrêts réels, pas sur des points échantillonnés
  // au hasard dans la trace : au moins les étapes y sont, même si Google recalcule
  // l'itinéraire entre elles à sa façon.
  const realStops = STOPS.filter(s => isRealStop(s.role));
  const mapsUrl = `https://www.google.com/maps/dir/${realStops.map(s => `${s.lat},${s.lon}`).join('/')}`;
  console.log(`\nGoogle Maps (aperçu, ${realStops.length} étapes) : ${mapsUrl}`);

  const labels = orderedWaypoints(trackPoints);

  const itn = buildItn({ routePoints, labels, shaping });
  writeFileSync(ITN_OUTPUT_PATH, itn);
  const itnLines = itn.trim().split('\n');
  const itnStops = itnLines.filter(l => !l.endsWith('|2|')).length;
  console.log(`\nITN écrit : ${ITN_OUTPUT_PATH.pathname}`);
  console.log(`  ${itnLines.length} points dont ${itnStops} arrêts annoncés, le reste en points de passage`);

  writeFileSync(GPX_OUTPUT_PATH, buildGpx({ name: ROUTE_NAME, trackPoints, routePoints, labels, shaping }));
  console.log(`\nGPX écrit : ${GPX_OUTPUT_PATH.pathname}`);
  console.log(`  ${allPoints.length} points bruts -> ${trackPoints.length} points de trace (tolérance ${TRACK_TOLERANCE_M} m)`);
  console.log(`  ${realStops.length} étapes + ${MARKERS.length} repère(s) hors tracé, nommés en <wpt>`);
  console.log(`  <rte> en mode '${ROUTE_MODE}'`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
