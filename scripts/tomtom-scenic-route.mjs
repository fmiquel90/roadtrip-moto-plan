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
const STOPS = [
  { name: 'Hénansal (départ)',       lat: 48.5409784, lon: -2.4330858, role: 'stop'  },
  { name: 'Moncontour',              lat: 48.3611,    lon: -2.6326,    role: 'shape' },
  { name: 'Mont Bel-Air',            lat: 48.3506,    lon: -2.5498,    role: 'stop'  },
  { name: 'Le Quillio',              lat: 48.2407,    lon: -2.8825,    role: 'shape' },
  { name: 'Cascade de Bosméléac',    lat: 48.3002,    lon: -2.9012,    role: 'stop'  },
  // Sans ce crochet, la descente vers le lac ne fait que 34 min et la session
  // d'avant-déjeuner tombe sous les 40 min voulues. Il coûte 5 km pour 10 min.
  { name: 'Saint-Martin-des-Prés',   lat: 48.3060,    lon: -2.9600,    role: 'shape' },
  { name: 'Gorges du Poulancre',     lat: 48.2539,    lon: -3.0070,    role: 'shape' },
  { name: 'Beau Rivage (déjeuner)',  lat: 48.2060,    lon: -3.0470,    role: 'lunch' },
  { name: 'Écluse de Guerlédan',     lat: 48.1900,    lon: -3.0174,    role: 'shape' },
  { name: 'Anse de Sordan',          lat: 48.2023,    lon: -3.0679,    role: 'shape' },
  // Les Forges des Salles ouvre le samedi 14h-18h, l'abbaye de Bon-Repos non
  // (TomTom lui donne jeu/ven/dim/lun/mar/mer, pas samedi). Le vrai arrêt de
  // l'après-midi est donc ici, et l'abbaye 4 km plus loin n'est qu'un crochet.
  { name: 'Les Forges des Salles',   lat: 48.1996,    lon: -3.1268,    role: 'stop'  },
  { name: 'Abbaye de Bon-Repos',     lat: 48.2128,    lon: -3.1282,    role: 'stop'  },
  { name: 'Gorges du Daoulas',       lat: 48.2270,    lon: -3.1230,    role: 'shape' },
  { name: 'Saint-Nicolas-du-Pélem',  lat: 48.3154,    lon: -3.1599,    role: 'shape' },
  { name: 'Le Haut-Corlay',          lat: 48.3217,    lon: -3.0564,    role: 'shape' },
  // Le plein se fait ici et pas à mi-parcours : la seule station de la zone du lac
  // est l'Intermarché de Mûr-de-Bretagne, et le crochet pour l'atteindre ramenait
  // 7 km de D767 sur le tracé en plus de casser le rythme juste avant le déjeuner.
  { name: 'Quintin (plein)',         lat: 48.4033,    lon: -2.9100,    role: 'fuel'  },
  { name: 'Hénansal (retour)',       lat: 48.5409784, lon: -2.4330858, role: 'stop'  },
];

const ROUTE_NAME = 'Argoat — Guerlédan & gorges du Daoulas';
const GPX_OUTPUT_PATH = new URL('../public/trace.gpx', import.meta.url);

// 'high' sur les deux : sur ce même tracé, passer de 'normal' à 'high' rallonge
// nettement la part de voies communales sans coûter de temps.
const HILLINESS = 'high';
const WINDINGNESS = 'high';

// Tolérance de simplification de la trace, en mètres. La trace brute fait plusieurs
// milliers de points ; un GPS moto n'en a pas besoin d'autant pour suivre la route.
const TRACK_TOLERANCE_M = 12;

// Nombre de points de forme de l'itinéraire <rte>, destiné à l'import TomTom.
const ROUTE_SHAPING_POINTS = 40;

function isRealStop(role) {
  return role !== 'shape';
}

async function calculateRoute() {
  const locations = STOPS.map(s => `${s.lat},${s.lon}`).join(':');
  const url = `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json` +
    `?key=${API_KEY}&travelMode=motorcycle&routeType=thrilling` +
    `&hilliness=${HILLINESS}&windingness=${WINDINGNESS}` +
    // traffic=false : sans ça les durées intègrent le trafic à l'instant du calcul et
    // le chiffre publié sur le site dérive d'un run à l'autre.
    `&traffic=false&instructionsType=text&language=fr-FR`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Routing failed: ${res.status} ${await res.text()}`);
  return (await res.json()).routes[0];
}

// Douglas-Peucker sur la distance perpendiculaire, en degrés (suffisant à cette échelle).
function simplify(points, toleranceM) {
  const tol = toleranceM / 111320;
  if (points.length < 3) return points;

  const perpendicular = (p, a, b) => {
    const dx = b.longitude - a.longitude, dy = b.latitude - a.latitude;
    if (dx === 0 && dy === 0) return Math.hypot(p.longitude - a.longitude, p.latitude - a.latitude);
    const t = ((p.longitude - a.longitude) * dx + (p.latitude - a.latitude) * dy) / (dx * dx + dy * dy);
    const c = Math.max(0, Math.min(1, t));
    return Math.hypot(p.longitude - (a.longitude + c * dx), p.latitude - (a.latitude + c * dy));
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

function sampleEvenly(points, count) {
  if (points.length <= count) return points;
  const stride = (points.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => points[Math.round(i * stride)]);
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

function buildGpx({ name, trackPoints, routePoints }) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Les arrêts réels seulement : les points de forme n'ont rien à faire dans le roadbook.
  const wpts = STOPS.filter(s => isRealStop(s.role)).map(s =>
    `  <wpt lat="${s.lat}" lon="${s.lon}"><name>${esc(s.name)}</name><type>${s.role}</type></wpt>`
  ).join('\n');

  // <rte> : itinéraire léger, c'est ce qu'un TomTom sait recalculer.
  const rtepts = routePoints.map(p =>
    `    <rtept lat="${p.latitude}" lon="${p.longitude}"></rtept>`
  ).join('\n');

  // <trk> : la trace fidèle, pour vérifier le tracé exact.
  const trkpts = trackPoints.map(p =>
    `      <trkpt lat="${p.latitude}" lon="${p.longitude}"></trkpt>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="tomtom-scenic-route" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${esc(name)}</name></metadata>
${wpts}
  <rte>
    <name>${esc(name)} (itinéraire)</name>
${rtepts}
  </rte>
  <trk>
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
  const routePoints = sampleEvenly(trackPoints, ROUTE_SHAPING_POINTS);

  // Lien Google Maps construit sur les arrêts réels, pas sur des points échantillonnés
  // au hasard dans la trace : au moins les étapes y sont, même si Google recalcule
  // l'itinéraire entre elles à sa façon.
  const realStops = STOPS.filter(s => isRealStop(s.role));
  const mapsUrl = `https://www.google.com/maps/dir/${realStops.map(s => `${s.lat},${s.lon}`).join('/')}`;
  console.log(`\nGoogle Maps (aperçu, ${realStops.length} étapes) : ${mapsUrl}`);

  writeFileSync(GPX_OUTPUT_PATH, buildGpx({ name: ROUTE_NAME, trackPoints, routePoints }));
  console.log(`\nGPX écrit : ${GPX_OUTPUT_PATH.pathname}`);
  console.log(`  ${allPoints.length} points bruts -> ${trackPoints.length} points de trace (tolérance ${TRACK_TOLERANCE_M} m)`);
  console.log(`  ${routePoints.length} points de forme dans <rte>, ${realStops.length} étapes en <wpt>`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
