import { writeFileSync } from 'node:fs';

const API_KEY = process.env.TOMTOM_API_KEY;
if (!API_KEY) {
  console.error('Missing TOMTOM_API_KEY. Run with: node --env-file=.env scripts/tomtom-scenic-route.mjs');
  process.exit(1);
}

// Mont-Saint-Michel & Baie day-trip loop, in visiting order.
// Each stop is a named point of interest (not a plain town-center geocode) so we
// land on the actual landmark instead of an arbitrary/ambiguous address match.
// 'address' is only used for home and small towns that aren't themselves a POI.
// The stop tagged role:'lunch' is the actual chosen restaurant — a fuel stop is
// auto-inserted right after it (motorcycles average ~200km range, so topping up
// around the midday break covers the rest of the loop with margin).
// Reversed order vs. the first pass: Cancale side (the point farthest from home)
// is visited first, lunch falls near the actual midpoint at Cité d'Alet, and the
// shorter Dinard/Saint-Cast side is left for the way home — so the final leg
// back to Hénansal is short instead of a long 57km slog after lunch.
const STOPS = [
  { name: 'Hénansal (départ)', query: 'Hénansal, France', kind: 'address', role: 'stop' },
  { name: 'Binic', query: 'Port de Binic', kind: 'poi', role: 'stop' },
  { name: 'Pointe de l\'Arcouest', query: "Pointe de l'Arcouest, Ploubazlanec", kind: 'poi', role: 'stop' },
  { name: 'Pointe du Château', query: 'Pointe du Château, Perros-Guirec', kind: 'poi', role: 'stop' },
  { name: "Ploumanac'h (déjeuner)", query: 'Le Men Ruz, Perros-Guirec', kind: 'poi', role: 'lunch' },
  { name: 'Île Renote', query: 'Île Renote, Trégastel', kind: 'poi', role: 'stop' },
  { name: 'Guingamp', query: 'Guingamp, France', kind: 'address', role: 'stop' },
  { name: 'Hénansal (retour)', query: 'Hénansal, France', kind: 'address', role: 'stop' },
];

// Output path for the generated GPX track.
const GPX_OUTPUT_PATH = new URL('../public/granit-rose.gpx', import.meta.url);

const HILLINESS = 'normal';
const WINDINGNESS = 'normal';

// How many via-points to sample from the computed route for the Google Maps link.
const SAMPLE_COUNT = 12;

// Radius to look for a fuel stop around the lunch spot.
const FUEL_SEARCH_RADIUS_M = 6000;

// Bias POI search near home so fuzzy matches don't jump to a same-named but
// far-away landmark (e.g. "Gorges du Daoulas" matching "Gorges du Verdon").
const HOME_BIAS = { lat: 48.5410, lon: -2.4331, radius: 150000 };

async function searchPOI(query) {
  const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json` +
    `?key=${API_KEY}&idxSet=POI&countrySet=FR&limit=3` +
    `&lat=${HOME_BIAS.lat}&lon=${HOME_BIAS.lon}&radius=${HOME_BIAS.radius}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`POI search failed for "${query}": ${res.status} ${await res.text()}`);
  const data = await res.json();
  const candidates = data.results || [];
  if (!candidates.length) throw new Error(`No POI match for "${query}" — try a more specific name.`);

  const top = candidates[0];
  console.log(`  ${query} ->`);
  candidates.forEach((c, i) => {
    const marker = i === 0 ? '✓' : ' ';
    console.log(`    ${marker} ${c.poi?.name} [${c.poi?.categories?.join(', ')}] — ${c.position.lat},${c.position.lon}`);
  });
  return { lat: top.position.lat, lon: top.position.lon };
}

async function geocodeAddress(query) {
  const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(query)}.json?key=${API_KEY}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocode failed for "${query}": ${res.status} ${await res.text()}`);
  const data = await res.json();
  const hit = data.results?.[0];
  if (!hit) throw new Error(`No geocode result for "${query}"`);
  console.log(`  ${query} -> ${hit.position.lat},${hit.position.lon}`);
  return { lat: hit.position.lat, lon: hit.position.lon };
}

async function nearbyFuelStop(near) {
  const url = `https://api.tomtom.com/search/2/categorySearch/gas%20station.json` +
    `?key=${API_KEY}&lat=${near.lat}&lon=${near.lon}&radius=${FUEL_SEARCH_RADIUS_M}&limit=3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fuel search failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const candidates = data.results || [];
  if (!candidates.length) {
    console.log(`  ⚠ No gas station found within ${FUEL_SEARCH_RADIUS_M / 1000}km of lunch stop — skipping fuel stop.`);
    return null;
  }
  const top = candidates[0];
  console.log('  Fuel stop ->');
  candidates.forEach((c, i) => {
    const marker = i === 0 ? '✓' : ' ';
    console.log(`    ${marker} ${c.poi?.name} — ${c.address?.freeformAddress} — ${Math.round(c.dist)}m — ${c.position.lat},${c.position.lon}`);
  });
  return { lat: top.position.lat, lon: top.position.lon };
}

function sampleEvenly(points, count) {
  if (points.length <= count) return points;
  const stride = (points.length - 1) / (count - 1);
  return Array.from({ length: count }, (_, i) => points[Math.round(i * stride)]);
}

async function main() {
  console.log('Resolving stops (POIs & addresses)...');
  const coords = [];
  const labels = [];
  const names = [];
  for (const stop of STOPS) {
    const c = stop.kind === 'poi' ? await searchPOI(stop.query) : await geocodeAddress(stop.query);
    coords.push(c);
    labels.push(stop.query);
    names.push(stop.name || stop.query);
    await new Promise(r => setTimeout(r, 500));

    if (stop.role === 'lunch') {
      const fuel = await nearbyFuelStop(c);
      if (fuel) { coords.push(fuel); labels.push('(fuel stop)'); names.push('Station-service'); }
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const locations = coords.map(c => `${c.lat},${c.lon}`).join(':');
  const routeUrl = `https://api.tomtom.com/routing/1/calculateRoute/${locations}/json` +
    `?key=${API_KEY}&travelMode=motorcycle&routeType=thrilling&hilliness=${HILLINESS}&windingness=${WINDINGNESS}` +
    `&instructionsType=text&language=fr-FR`;

  console.log('\nCalling TomTom Routing API (thrilling / motorcycle)...');
  const res = await fetch(routeUrl);
  if (!res.ok) throw new Error(`Routing failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const route = data.routes[0];

  const summary = route.summary;
  const distanceKm = Math.round(summary.lengthInMeters / 1000);
  const hours = Math.floor(summary.travelTimeInSeconds / 3600);
  const minutes = Math.round((summary.travelTimeInSeconds % 3600) / 60);
  console.log(`\nDistance: ${distanceKm} km — Durée estimée: ${hours}h${String(minutes).padStart(2, '0')}`);

  console.log('\nPer-leg cumulative distance:');
  let cumulative = 0;
  route.legs.forEach((leg, i) => {
    cumulative += leg.summary.lengthInMeters;
    const pct = Math.round((cumulative / summary.lengthInMeters) * 100);
    console.log(`  -> ${labels[i + 1]}: +${Math.round(leg.summary.lengthInMeters / 1000)}km (cumulative ${Math.round(cumulative / 1000)}km, ${pct}%)`);
  });

  if (route.guidance?.instructions) {
    const roads = [...new Set(
      route.guidance.instructions.map(ins => ins.roadNumbers?.[0] || ins.street).filter(Boolean)
    )];
    console.log('\nRoad numbers / streets used:', roads.join(', '));
  }

  const allPoints = route.legs.flatMap(leg => leg.points);
  const sampled = sampleEvenly(allPoints, SAMPLE_COUNT).map(p => `${p.latitude},${p.longitude}`);

  const mapsUrl = `https://www.google.com/maps/dir/${sampled.join('/')}`;
  console.log(`\nGoogle Maps: ${mapsUrl}`);

  const gpx = buildGpx({ name: 'Côte de Granit Rose', coords, names, trackPoints: allPoints });
  writeFileSync(GPX_OUTPUT_PATH, gpx);
  console.log(`\nGPX written to ${GPX_OUTPUT_PATH.pathname} (${allPoints.length} track points, ${coords.length} waypoints)`);
}

function buildGpx({ name, coords, names, trackPoints }) {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const wpts = coords.map((c, i) =>
    `  <wpt lat="${c.lat}" lon="${c.lon}"><name>${esc(names[i])}</name></wpt>`
  ).join('\n');
  const trkpts = trackPoints.map(p =>
    `      <trkpt lat="${p.latitude}" lon="${p.longitude}"></trkpt>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="tomtom-scenic-route" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${esc(name)}</name></metadata>
${wpts}
  <trk>
    <name>${esc(name)}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
