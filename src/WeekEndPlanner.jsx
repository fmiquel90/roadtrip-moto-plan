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

/* ─── Dates & hotel links ────────────────────────────────────── */
const weekendDates = {
  '4-5-juil':   { checkin:'2026-07-04', checkout:'2026-07-05', label:'Sam 4 → Dim 5 juillet 2026' },
  '11-12-juil': { checkin:'2026-07-11', checkout:'2026-07-12', label:'Sam 11 → Dim 12 juillet 2026' },
  '18-19-juil': { checkin:'2026-07-18', checkout:'2026-07-19', label:'Sam 18 → Dim 19 juillet 2026' },
  '22-23-aou':  { checkin:'2026-08-22', checkout:'2026-08-23', label:'Sam 22 → Dim 23 août 2026' },
  '12-13-sep':  { checkin:'2026-09-12', checkout:'2026-09-13', label:'Sam 12 → Dim 13 septembre 2026' },
};
const hotelCity = {
  vannes:'Vannes', labaule:'La+Baule', bayeux:'Bayeux', morgat:'Crozon', huelgoat:'Huelgoat',
};
const bookingUrl = (hotelKey, weekend) => {
  const city = hotelCity[hotelKey] || hotelKey;
  const { checkin, checkout } = weekendDates[weekend];
  return `https://www.booking.com/searchresults.fr.html?ss=${city}%2C+France&checkin=${checkin}&checkout=${checkout}&group_adults=2&no_rooms=1&nflt=ht_id%3D204`;
};

/* ─── Data ───────────────────────────────────────────────────── */
const weekends = {
  '4-5-juil':  { label:'4–5 Juil',   season:'Début saison',  bayeux:[80,90],  vannes:[90,110],  labaule:[90,120],  huelgoat:[70,110],  morgat:[65,95],  note:'✅ Bons prix',   tone:'good' },
  '11-12-juil':{ label:'11–12 Juil', season:'Francofolies',  bayeux:[85,100], vannes:[100,120], labaule:[100,145], huelgoat:[80,120],  morgat:[70,100], note:'⚠️ Cher',         tone:'warn' },
  '18-19-juil':{ label:'18–19 Juil', season:'Pic estival',   bayeux:[90,110], vannes:[110,130], labaule:[110,155], huelgoat:[90,130],  morgat:[75,110], note:'⚠️ Touristique',  tone:'warn' },
  '22-23-aou': { label:'22–23 Août', season:'Post-estival',  bayeux:[75,90],  vannes:[85,100],  labaule:[85,115],  huelgoat:[75,110],  morgat:[60,90],  note:'✅ Bons prix',   tone:'good' },
  '12-13-sep': { label:'12–13 Sep',  season:'Basse saison',  bayeux:[55,70],  vannes:[60,75],   labaule:[60,85],   huelgoat:[55,75],   morgat:[45,70],  note:'✅✅ Top prix',  tone:'best' },
};

const routes = {
  morbihan: {
    title:'Golfe du Morbihan', shortTitle:'Morbihan',
    subtitle:'Côte bretonne authentique',
    color:'#22d3ee', colorDark:'#06b6d4',
    distance:'383 km', driveTime:'7h45',
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
      { url:`${WI}/6/69/ArGerveur.jpg/330px-ArGerveur.jpg`, caption:'Belle-Île-en-Mer', location:'Au large du Morbihan' },
      { url:`${WI}/d/d3/Auray_mairie.jpg/330px-Auray_mairie.jpg`, caption:'Port de Saint-Goustan', location:'Auray' },
    ],
  },
  vendee: {
    title:'Vendée Côtière', shortTitle:'Vendée',
    subtitle:'La Baule, Guérande & estuaire',
    color:'#fbbf24', colorDark:'#f59e0b',
    distance:'523 km', driveTime:'9h30',
    hotelKey:'labaule', hotelName:'La Baule',
    googleMapsUrl:'https://www.google.com/maps/dir/Cap+Frehel+22240/Nantes+44000/La+Baule+44500/Guerande+44350/Vannes+56000/Cap+Frehel+22240',
    waypoints:[
      { name:'Fréhel',   type:'start', day:'Départ' },
      { name:'Nantes',   type:'stop',  day:'Sam midi' },
      { name:'La Baule', type:'sleep', day:'Sam soir' },
      { name:'Guérande', type:'stop',  day:'Dim matin' },
      { name:'Vannes',   type:'stop',  day:'Dim midi' },
      { name:'Fréhel',   type:'end',   day:'Dim soir' },
    ],
    highlights:['🏖️ La Baule, plus belle plage d\'Europe','🏰 Guérande médiéval & marais salants','🌉 Pont de Saint-Nazaire & estuaire de Loire','🏍️ D213 côtière & bocage'],
    images:[
      { url:`${WI}/8/8b/Plage_de_La_Baule-Escoublac_01_%28cropped%29.JPG/330px-Plage_de_La_Baule-Escoublac_01_%28cropped%29.JPG`, caption:'Plage de La Baule', location:'La Baule-Escoublac' },
      { url:`${WI}/8/8b/St_Michel_Gu%C3%A9rande.JPG/330px-St_Michel_Gu%C3%A9rande.JPG`, caption:'Guérande médiévale', location:'Guérande' },
      { url:`${WI}/6/66/Marais_salants.jpg/330px-Marais_salants.jpg`, caption:'Marais salants', location:'Presqu\'île guérandaise' },
      { url:`${WI}/3/3c/Vue_pont_st_nazaire_loire.JPG/330px-Vue_pont_st_nazaire_loire.JPG`, caption:'Pont de Saint-Nazaire', location:'Estuaire de Loire' },
      { url:`${WI}/c/c8/Nantes_a%C3%A9rien_ch%C3%A2teau3.jpg/330px-Nantes_a%C3%A9rien_ch%C3%A2teau3.jpg`, caption:'Château des Ducs', location:'Nantes' },
      { url:`${WI}/e/e7/Saint-Nazaire.jpg/330px-Saint-Nazaire.jpg`, caption:'Saint-Nazaire', location:'Estuaire de Loire' },
    ],
  },
  normandie: {
    title:'Normandie D-Day', shortTitle:'Normandie',
    subtitle:'Bayeux & route D514',
    color:'#34d399', colorDark:'#10b981',
    distance:'441 km', driveTime:'8h30',
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
      { url:`${WI}/1/17/Arromanches-les-Bains_%C3%A0_mar%C3%A9e_basse_%28juillet_2025%29.JPG/330px-Arromanches-les-Bains_%C3%A0_mar%C3%A9e_basse_%28juillet_2025%29.JPG`, caption:'Arromanches à marée basse', location:'Arromanches' },
      { url:`${WI}/9/9c/Odo_bayeux_tapestry.png/330px-Odo_bayeux_tapestry.png`, caption:'Tapisserie de Bayeux', location:'Bayeux (XIe s.)' },
    ],
  },
  finistere: {
    title:'Finistère Extrême', shortTitle:'Finistère',
    subtitle:'Crozon, Pointe du Raz & bout du monde',
    color:'#f97316', colorDark:'#ea580c',
    distance:'508 km', driveTime:'10h30',
    hotelKey:'morgat', hotelName:'Morgat / Crozon',
    googleMapsUrl:'https://www.google.com/maps/dir/Cap+Frehel+22240/Chateaulin+29150/Morgat+29160/Pointe+du+Raz+29770/Douarnenez+29100/Cap+Frehel+22240',
    waypoints:[
      { name:'Fréhel',      type:'start', day:'Départ' },
      { name:'Châteaulin',  type:'stop',  day:'Sam midi' },
      { name:'Morgat',      type:'sleep', day:'Sam soir' },
      { name:'Pte du Raz',  type:'stop',  day:'Dim matin' },
      { name:'Douarnenez',  type:'stop',  day:'Dim midi' },
      { name:'Fréhel',      type:'end',   day:'Dim soir' },
    ],
    highlights:['🌊 Pointe du Raz, bout du monde atlantique','🏍️ Presqu\'île de Crozon, routes légendaires','🪨 Tas de Pois & Pointe de Pen-Hir','🎣 Douarnenez, port breton authentique'],
    images:[
      { url:`${WI}/4/4c/0_La_Pointe_du_Raz_%C3%A0_Plogoff_%281%29.JPG/330px-0_La_Pointe_du_Raz_%C3%A0_Plogoff_%281%29.JPG`, caption:'Pointe du Raz', location:'Plogoff, Finistère' },
      { url:`${WI}/4/4e/Tas_de_Pois%2C_Pen_Hir%2C_Finist%C3%A8re.jpg/330px-Tas_de_Pois%2C_Pen_Hir%2C_Finist%C3%A8re.jpg`, caption:'Tas de Pois, Pen-Hir', location:'Presqu\'île de Crozon' },
      { url:`${WI}/2/2b/Le_port_de_Morgat_-_001.JPG/330px-Le_port_de_Morgat_-_001.JPG`, caption:'Port de Morgat', location:'Morgat, Crozon' },
      { url:`${WI}/4/4e/Crozon_cap_de_la_Ch%C3%A8vre_Bretagne_France.jpg/330px-Crozon_cap_de_la_Ch%C3%A8vre_Bretagne_France.jpg`, caption:'Cap de la Chèvre', location:'Crozon' },
      { url:`${WI}/2/24/Port_Douarnenez.JPG/330px-Port_Douarnenez.JPG`, caption:'Port de Douarnenez', location:'Douarnenez' },
      { url:`${WI}/1/13/Chateaulin_1.jpg/330px-Chateaulin_1.jpg`, caption:'Châteaulin', location:'Aulne maritime' },
    ],
  },
  montsArree: {
    title:"Monts d'Arrée", shortTitle:"Arrée",
    subtitle:'Landes sauvages & chaos celtique',
    color:'#c084fc', colorDark:'#a855f7',
    distance:'355 km', driveTime:'7h45',
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
      { url:`${WI}/0/0e/Brasparts_24_perch%C3%A9_sur_une_colline_-vue_depuis_la_route_du_Faou-.JPG/330px-Brasparts_24_perch%C3%A9_sur_une_colline_-vue_depuis_la_route_du_Faou-.JPG`, caption:'Brasparts', location:'Monts d\'Arrée' },
      { url:`${WI}/8/8f/Kloz_iliz_Pleiben.jpg/330px-Kloz_iliz_Pleiben.jpg`, caption:'Enclos de Pleyben', location:'Pleyben' },
    ],
  },
};

/* ─── Boucles à la journée (départ/retour Hénansal) ─────────── */
const dayRoutes = {
  emeraude: {
    title:"Côte d'Émeraude", shortTitle:'Émeraude',
    subtitle:'Saint-Malo, Dinard & Cancale',
    color:'#38bdf8', colorDark:'#0ea5e9',
    distance:'153 km', driveTime:'3h48',
    googleMapsUrl:'https://www.google.com/maps/dir/48.54098,-2.43309/48.48682,-2.27103/48.54382,-2.15337/48.59952,-2.03557/48.6386,-1.90953/48.70866,-1.8455/48.65714,-1.9975/48.62738,-2.00412/48.63094,-2.08959/48.57238,-2.20354/48.59967,-2.28751/48.54098,-2.43309',
    waypoints:[
      { name:'Hénansal',           type:'start', day:'Départ 9h30' },
      { name:'Cancale',            type:'stop',  day:'Matin' },
      { name:'Pointe du Grouin',   type:'stop',  day:'Matin' },
      { name:'Plage du Sillon',    type:'stop',  day:"Fin de matinée" },
      { name:"Le Rad'Alet",        type:'lunch', day:'Midi' },
      { name:'Station-service',    type:'stop',  day:'Ravitaillement' },
      { name:'Dinard',             type:'stop',  day:'Après-midi' },
      { name:'Pointe de la Garde', type:'stop',  day:"Fin d'aprèm" },
      { name:'Hénansal',           type:'end',   day:'Retour ~16h' },
    ],
    highlights:['🏰 Remparts & cité corsaire de Saint-Malo',"🏖️ Plage de l'Écluse à Dinard",'🦪 Huîtres de Cancale','🌊 Vue sur la baie depuis la Pointe du Grouin'],
    lunch:[
      { name:"Le Rad'Alet", town:'Saint-Servan, près de la Cité d\'Alet', note:'Cuisine simple et généreuse (4.5-4.8/5) — sur le tracé, vers le milieu du parcours, pas besoin d\'entrer dans l\'intra-muros', query:"Le Rad'Alet restaurant Saint-Malo", photo:'https://media-cdn.tripadvisor.com/media/photo-o/11/6d/92/f1/rad-burger.jpg' },
      { name:'Grand Bain', town:'Dinard', note:'Cuisine contemporaine en bord de plage (9.2/10) — alternative si vous préférez manger un peu plus tard, sur le chemin du retour', query:'Grand Bain restaurant Dinard', photo:'https://cdt35.media.tourinsoft.eu/upload/Grand-Bain---2025---Agence-Pancake.jpg' },
    ],
    images:[
      { url:`${WI}/8/83/IMG_2935_StMalo.JPG/330px-IMG_2935_StMalo.JPG`, caption:'Remparts de Saint-Malo', location:'Saint-Malo' },
      { url:`${WI}/d/d5/Dinard_Plage_de_l%27Ecluse-2007-08-08.jpg/330px-Dinard_Plage_de_l%27Ecluse-2007-08-08.jpg`, caption:"Plage de l'Écluse", location:'Dinard' },
      { url:`${WI}/9/94/Cancale_03.jpg/330px-Cancale_03.jpg`, caption:'Port de Cancale', location:'Cancale' },
      { url:`${WI}/8/81/France_Pointe_Du_Grouin_bordercropped.jpg/330px-France_Pointe_Du_Grouin_bordercropped.jpg`, caption:'Pointe du Grouin', location:'Cancale' },
    ],
  },
  guerledan: {
    title:'Lac de Guerlédan', shortTitle:'Guerlédan',
    subtitle:'Lac, forêts & abbaye de Bon-Repos',
    color:'#4ade80', colorDark:'#22c55e',
    distance:'172 km', driveTime:'3h34',
    googleMapsUrl:'https://www.google.com/maps/dir/48.54098,-2.43309/48.44562,-2.56464/48.37539,-2.71455/48.28754,-2.82633/48.20349,-2.9705/48.21126,-3.00007/48.20944,-3.11729/48.25641,-3.00318/48.30326,-2.79791/48.38702,-2.68424/48.45962,-2.53069/48.54098,-2.43309',
    waypoints:[
      { name:'Hénansal',            type:'start', day:'Départ 10h' },
      { name:'Lac de Guerlédan',    type:'stop',  day:'Matin' },
      { name:"L'Embarcadère",       type:'lunch', day:'Midi' },
      { name:'Station-service',     type:'stop',  day:'Ravitaillement' },
      { name:'Abbaye de Bon-Repos', type:'stop',  day:'Après-midi' },
      { name:'Hénansal',            type:'end',   day:'Retour ~18h' },
    ],
    highlights:['🌲 Forêts & rives du lac de Guerlédan','⛪ Abbaye cistercienne de Bon-Repos','🚣 Point de vue sur le barrage','🏍️ Petites routes forestières tranquilles'],
    lunch:[
      { name:"L'Embarcadère", town:'Caurel, bord du lac', note:'Vue panoramique sur le lac, grande terrasse', query:"L'Embarcadère Lac de Guerlédan Caurel", photo:'https://cdn.iris-etourism.io/media/lac_de_guerledan/RESBRE022V50TZFB/3b8c795c177d4b5e-800x520.webp' },
      { name:'Auberge de Guerlédan', town:'Caurel', note:'Cuisine traditionnelle, menu du midi ~17,50€', query:'Auberge de Guerlédan Caurel', photo:'https://cdn.iris-etourism.io/media/lac_de_guerledan/RESBRE02209Q2VU1/16272038b720e525-800x520.webp' },
    ],
    images:[
      { url:`${WI}/d/dd/Lac_Guerledan.JPG/330px-Lac_Guerledan.JPG`, caption:'Le lac de Guerlédan', location:'Guerlédan' },
      { url:`${WI}/c/c8/Abbaye_Notre-Dame-de-Bon-Repos%2C_Saint-Gelven%2C_France-5.jpg/330px-Abbaye_Notre-Dame-de-Bon-Repos%2C_Saint-Gelven%2C_France-5.jpg`, caption:'Abbaye de Bon-Repos', location:'Saint-Gelven' },
      { url:`${WI}/b/bc/M%C3%BBr-de-Bretagne_-_mairie.JPG/330px-M%C3%BBr-de-Bretagne_-_mairie.JPG`, caption:'Mûr-de-Bretagne', location:'Mûr-de-Bretagne' },
      { url:`${WI}/7/7a/Barrage_Guerledan.JPG/330px-Barrage_Guerledan.JPG`, caption:'Barrage de Guerlédan', location:'Guerlédan' },
      { url:`${WI}/8/86/Sentier_dans_la_foret_de_K%C3%A9n%C3%A9quan_au_bord_du_lac.jpg/330px-Sentier_dans_la_foret_de_K%C3%A9n%C3%A9quan_au_bord_du_lac.jpg`, caption:'Sentier en forêt de Quénécan', location:'Forêt de Quénécan' },
      { url:`${WI}/6/6f/Saint-Aignan_%2856%29_%C3%89glise_05.JPG/330px-Saint-Aignan_%2856%29_%C3%89glise_05.JPG`, caption:'Église de Saint-Aignan', location:'Saint-Aignan' },
    ],
  },
  granitRose: {
    title:'Côte de Granit Rose', shortTitle:'Granit Rose',
    subtitle:"Perros-Guirec, Ploumanac'h & Trégastel",
    color:'#fb7185', colorDark:'#f43f5e',
    distance:'255 km', driveTime:'5h47',
    googleMapsUrl:'https://www.google.com/maps/dir/48.54098,-2.43309/48.48523,-2.67273/48.52205,-2.87255/48.62812,-3.15804/48.73211,-3.41318/48.83263,-3.48093/48.76685,-3.56258/48.73389,-3.42982/48.63408,-3.17432/48.52369,-2.88752/48.48616,-2.68525/48.54098,-2.43309',
    waypoints:[
      { name:'Hénansal',           type:'start', day:'Départ 9h' },
      { name:'Pointe du Château',  type:'stop',  day:'Matin' },
      { name:"Ploumanac'h",        type:'lunch', day:'Midi' },
      { name:'Station-service',    type:'stop',  day:'Ravitaillement' },
      { name:'Île Renote',         type:'stop',  day:'Après-midi' },
      { name:'Pointe de Bihit',    type:'stop',  day:"Fin d'aprèm" },
      { name:'Hénansal',           type:'end',   day:'Retour ~17h' },
    ],
    highlights:['🗿 Chapeau de Napoléon, Pointe du Château','🚶 Sentier des douaniers','🏝️ Île Renote & ses rochers roses',"🗼 Phare de Ploumanac'h"],
    lunch:[
      { name:'Le Men Ruz', town:"Port de Ploumanac'h", note:'Ambiance conviviale, vue sur le port', query:"Le Men Ruz restaurant Perros-Guirec", photo:'https://www.restaurant-lemenruz-perros.com/wp-content/uploads/2018/06/facade-duplex.jpg' },
      { name:"L'Atelier", town:"Entre Ploumanac'h et Trégastel", note:'Produits frais et locaux, terrasse', query:"Restaurant L'Atelier Perros-Guirec", photo:'https://latelier-perrosguirec.com/wp-content/themes/theme-atelier/assets/images/restaurant-latelier-perros-guirec-la-salle.jpg' },
    ],
    images:[
      { url:`${WI}/c/c0/Port_de_Ploum_2.JPG/330px-Port_de_Ploum_2.JPG`, caption:"Port de Ploumanac'h", location:"Ploumanac'h" },
      { url:`${WI}/8/8b/Perros-Guirec_-_La_C%C3%B4te_de_granit_rose_et_le_phare_de_Ploumanac%27h_-_Juin_2005.jpg/330px-Perros-Guirec_-_La_C%C3%B4te_de_granit_rose_et_le_phare_de_Ploumanac%27h_-_Juin_2005.jpg`, caption:'Côte de granit rose & phare', location:'Perros-Guirec' },
      { url:`${WI}/a/ae/France_Cotes_d_Armor_Cote_de_granit_rose_04.jpg/330px-France_Cotes_d_Armor_Cote_de_granit_rose_04.jpg`, caption:'Rochers de granit rose', location:"Côtes-d'Armor" },
    ],
  },
  montSaintMichel: {
    title:'Mont-Saint-Michel & Baie', shortTitle:'Mt-St-Michel',
    subtitle:'Abbaye, baie & Dol-de-Bretagne',
    color:'#fbbf24', colorDark:'#f59e0b',
    distance:'214 km', driveTime:'4h30',
    googleMapsUrl:'https://www.google.com/maps/dir/48.54098,-2.43309/48.48758,-2.25235/48.50618,-2.07709/48.51461,-1.86615/48.54705,-1.67211/48.63507,-1.51128/48.54785,-1.67999/48.64357,-1.88076/48.594,-1.93951/48.52702,-2.0737/48.48714,-2.2575/48.54098,-2.43309',
    waypoints:[
      { name:'Hénansal',          type:'start', day:'Départ 9h' },
      { name:'Menhir Champ Dolent', type:'stop', day:'Matin' },
      { name:'Mont-Saint-Michel', type:'stop',  day:'Fin de matinée' },
      { name:'Beauvoir',          type:'lunch', day:'Midi' },
      { name:'Station-service',   type:'stop',  day:'Ravitaillement' },
      { name:'Cancale',           type:'stop',  day:'Après-midi' },
      { name:'Hénansal',          type:'end',   day:'Retour ~17h' },
    ],
    highlights:['🏔️ Abbaye du Mont-Saint-Michel','🗿 Menhir du Champ Dolent, mégalithe classé','🌊 Traversée de la baie à marée basse','🦪 Huîtres de Cancale au retour'],
    lunch:[
      { name:'Bistro du Mont', town:'Beauvoir, à 4km du Mont', note:'Cuisine maison, parking gratuit', query:'Bistro du Mont Beauvoir', photo:'https://bistrodumont.fr/img/facade.webp' },
      { name:'Le Moulin de Beauchamps', town:'Pontorson', note:'Ancien moulin, cuisine traditionnelle', query:'Le Moulin de Beauchamps Pontorson', photo:'https://www.lemoulindebeauchamps.com/wp-content/uploads/2024/05/le-moulin-de-beauchamps-restaurant-viande-granville-moulin-1.webp' },
    ],
    images:[
      { url:`${WI}/e/ef/Mont_St_Michel_in_the_afternoon.jpg/330px-Mont_St_Michel_in_the_afternoon.jpg`, caption:'Le Mont-Saint-Michel', location:'Mont-Saint-Michel' },
      { url:`${WI}/d/df/Mont_Saint-Michel%2C_France_ESA394286.jpg/330px-Mont_Saint-Michel%2C_France_ESA394286.jpg`, caption:'Vue aérienne du Mont', location:'Baie du Mont-Saint-Michel' },
      { url:`${WI}/2/28/Dol-de-Bretagne_-_La_Grande_Rue.jpg/330px-Dol-de-Bretagne_-_La_Grande_Rue.jpg`, caption:'Grande Rue de Dol', location:'Dol-de-Bretagne' },
      { url:`${WI}/9/94/Cancale_03.jpg/330px-Cancale_03.jpg`, caption:'Port de Cancale', location:'Cancale' },
      { url:`${WI}/0/05/Breizh_35_-_Dol_-_Peulvan_maez_al_lanv_06.jpg/330px-Breizh_35_-_Dol_-_Peulvan_maez_al_lanv_06.jpg`, caption:'Menhir de Champ-Dolent', location:'Dol-de-Bretagne' },
      { url:`${WI}/e/ee/Vue_%28Le_Mont-Saint-Michel%29_%282%29.jpg/330px-Vue_%28Le_Mont-Saint-Michel%29_%282%29.jpg`, caption:"Vue de l'abbaye", location:'Mont-Saint-Michel' },
      { url:`${WI}/2/2d/Pontorson_%2850%29_%C3%89glise_Notre-Dame_-_Ext%C3%A9rieur_-_Fa%C3%A7ade_sud_-_02.jpg/330px-Pontorson_%2850%29_%C3%89glise_Notre-Dame_-_Ext%C3%A9rieur_-_Fa%C3%A7ade_sud_-_02.jpg`, caption:'Église Notre-Dame', location:'Pontorson' },
    ],
  },
};

/* ─── Helpers ────────────────────────────────────────────────── */
const noteColor = t => t==='best'?'#22c55e':t==='warn'?'#f59e0b':'#3d5263';
const isHighlightWp = t => t==='sleep' || t==='lunch';

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
            const isHi    = isHighlightWp(wp.type);
            const dotCol  = (isStart||isEnd) ? '#ef4444' : isHi ? route.color : C.borderHi;
            const isLast  = i === wps.length-1;
            return (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:0 }}>
                {/* Dot + label */}
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{
                    width: isHi?11:8, height: isHi?11:8, borderRadius:'50%',
                    background:dotCol, marginTop:2, flexShrink:0,
                    boxShadow: isHi?`0 0 10px ${route.color}90`:'none',
                    border: isHi?`2px solid ${route.color}60`:'none',
                  }} />
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:10, color: isHi?route.color:(isStart||isEnd)?'#ef4444':C.text,
                      fontWeight: isHi?600:400, whiteSpace:'nowrap', lineHeight:1.2 }}>
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

const ModeToggle = ({ mode, onChange }) => (
  <div style={{ display:'flex', gap:4, marginBottom:18, background:C.surface, padding:3, borderRadius:9, border:`1px solid ${C.border}` }}>
    {[['weekend','Week-end'],['day','Journée']].map(([m,label]) => (
      <button key={m} onClick={() => onChange(m)} style={{
        flex:1, padding:'8px 0', borderRadius:7, cursor:'pointer', border:'none',
        fontFamily:C.sans, fontSize:12, fontWeight:600, transition:'all 0.15s',
        background: mode===m ? C.borderHi : 'transparent',
        color: mode===m ? C.text : C.muted,
      }}>
        {label}
      </button>
    ))}
  </div>
);

/* ─── Main export ────────────────────────────────────────────── */
export default function WeekEndPlanner() {
  const [mode,            setMode]            = useState('weekend');
  const [selectedWeekend, setSelectedWeekend]  = useState('11-12-juil');
  const [activeRoute,     setActiveRoute]      = useState('morbihan');
  const [activeDayRoute,  setActiveDayRoute]   = useState('emeraude');

  const isDay = mode === 'day';
  const data  = weekends[selectedWeekend];
  const route = isDay ? dayRoutes[activeDayRoute] : routes[activeRoute];
  const hp    = !isDay ? data[route.hotelKey] : null;
  const bMin  = hp ? Math.round(hp[0] * 0.7 + 65) : null;
  const bMax  = hp ? Math.round(hp[1] * 0.7 + 85) : null;

  const activeRoutes    = isDay ? dayRoutes : routes;
  const activeRouteKey  = isDay ? activeDayRoute : activeRoute;
  const setActiveRouteFn = isDay ? setActiveDayRoute : setActiveRoute;

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

      {!isDay && (
        <>
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

          {/* Hotel booking */}
          <div style={{ marginBottom:16 }}>
            <Label>Réserver</Label>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:9, padding:'12px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
                <span style={{ fontSize:10, color:C.muted, fontFamily:C.mono }}>📅 {weekendDates[selectedWeekend].label}</span>
              </div>
              <a href={bookingUrl(route.hotelKey, selectedWeekend)} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
                  padding:'9px 12px', borderRadius:8, background:'#003580', color:'#fff',
                  fontSize:12, fontWeight:600, textDecoration:'none', cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.background='#00224f'}
                onMouseLeave={e=>e.currentTarget.style.background='#003580'}>
                <span>🏨 Hôtels à {route.hotelName.split(' ')[0]}</span>
                <ExternalLink size={11} style={{ opacity:0.7, flexShrink:0 }} />
              </a>
              <div style={{ fontSize:9, color:C.faint, marginTop:6, fontFamily:C.mono, letterSpacing:'0.1em' }}>
                VIA BOOKING.COM · {hp[0]}–{hp[1]}€ ESTIMÉ/NUIT
              </div>
            </div>
          </div>
        </>
      )}

      {isDay && (
        /* Pause déjeuner */
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
      )}

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
          const isHi   = isHighlightWp(wp.type);
          const isEdge = wp.type==='start';
          return (
            <div key={i} style={{ display:'flex', gap:10 }}>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', marginTop:5, flexShrink:0,
                  background: isEdge?'#ef4444':isHi?route.color:C.borderHi,
                  boxShadow: isHi?`0 0 8px ${route.color}80`:'none' }} />
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
              WEEK<br/>END<br/>MOTO
            </div>
            <div style={{ fontFamily:C.mono, fontSize:9, letterSpacing:'0.2em', color:C.muted, marginTop:10 }}>
              {isDay ? "AU DÉPART D'HÉNANSAL" : 'AU DÉPART DE FRÉHEL'}
            </div>
          </div>

          <ModeToggle mode={mode} onChange={setMode} />

          <div style={{ marginBottom:18 }}>
            <Label>Itinéraire</Label>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {Object.entries(activeRoutes).map(([k,r]) =>
                <RouteBtn key={k} rKey={k} r={r} active={activeRouteKey===k} onClick={setActiveRouteFn} mobile={false}/>
              )}
            </div>
          </div>

          {!isDay && (
            <div style={{ marginBottom:18 }}>
              <Label>Date du week-end</Label>
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {Object.entries(weekends).map(([k,wk]) =>
                  <WeekendBtn key={k} wKey={k} wk={wk} active={selectedWeekend===k} onClick={setSelectedWeekend} compact={false}/>
                )}
              </div>
            </div>
          )}

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
              {isDay ? "AU DÉPART D'HÉNANSAL" : 'AU DÉPART DE FRÉHEL'} · {Object.keys(activeRoutes).length} BOUCLES
            </div>
          </div>

          {/* Mobile: mode toggle */}
          <div className="mobile-only" style={{ padding:'14px 18px 0' }}>
            <ModeToggle mode={mode} onChange={setMode} />
          </div>

          {/* Mobile: route selector */}
          <div className="mobile-only" style={{ padding:'0 18px 0' }}>
            <Label>Itinéraire</Label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {Object.entries(activeRoutes).map(([k,r]) =>
                <RouteBtn key={k} rKey={k} r={r} active={activeRouteKey===k} onClick={setActiveRouteFn} mobile={true}/>
              )}
            </div>
          </div>

          {/* Mobile: weekend selector */}
          {!isDay && (
            <div className="mobile-only" style={{ padding:'12px 18px 0', position:'relative' }}>
              <Label>Week-end</Label>
              <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:4, scrollbarWidth:'none' }}>
                {Object.entries(weekends).map(([k,wk]) =>
                  <WeekendBtn key={k} wKey={k} wk={wk} active={selectedWeekend===k} onClick={setSelectedWeekend} compact={true}/>
                )}
              </div>
            </div>
          )}

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
