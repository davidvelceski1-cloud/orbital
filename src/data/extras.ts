import type { ComparisonPlace } from "@/lib/types";

/** Earthly references for scale comparisons ("the Moon vs the USA"). */
export const PLACES: ComparisonPlace[] = [
  // Neutral emojis: flag emojis render as plain letters on Windows.
  { id: "usa", name: "Contiguous USA", widthKm: 4_500, note: "Coast to coast, roughly New York to San Francisco", emoji: "🗽" },
  { id: "australia", name: "Australia", widthKm: 4_000, note: "East to west across the mainland", emoji: "🦘" },
  { id: "europe", name: "Europe", widthKm: 3_900, note: "Lisbon to Moscow, roughly", emoji: "🏰" },
  { id: "uk", name: "Great Britain", widthKm: 970, note: "Land's End to John o' Groats", emoji: "💂" },
  { id: "texas", name: "Texas", widthKm: 1_244, note: "Widest east–west span", emoji: "🤠" },
  { id: "everest", name: "Mount Everest (height)", widthKm: 8.85, note: "Tallest mountain above sea level", emoji: "🏔️" },
];

/** Speeds for the travel-time calculator, km/h. */
export const TRAVEL_MODES = [
  { id: "walk", label: "Walking", kmh: 5, emoji: "🚶" },
  { id: "car", label: "Car (highway)", kmh: 100, emoji: "🚗" },
  { id: "plane", label: "Jet airliner", kmh: 900, emoji: "✈️" },
  { id: "apollo", label: "Apollo (to the Moon)", kmh: 39_000, emoji: "🚀" },
  { id: "voyager", label: "Voyager 1", kmh: 61_000, emoji: "🛰️" },
  { id: "parker", label: "Parker Solar Probe (top speed)", kmh: 690_000, emoji: "☀️" },
  { id: "light", label: "Light", kmh: 1_079_252_849, emoji: "💡" },
] as const;

export const FACTS_OF_THE_DAY: string[] = [
  "A day on Venus is longer than its year.",
  "Neutron stars are so dense that a teaspoon of one would weigh about a billion tonnes on Earth.",
  "There are more stars in the observable universe than grains of sand on all of Earth's beaches.",
  "Footprints left on the Moon by Apollo astronauts could last millions of years — there's no wind to erase them.",
  "Saturn would float in a bathtub big enough to hold it — it's less dense than water.",
  "Sunlight you see today left the Sun's surface about 8 minutes ago, but its energy was made in the core long before that.",
  "Olympus Mons on Mars is about 2.5 times taller than Mount Everest.",
  "The Sun makes up about 99.86% of the mass of the solar system.",
  "Jupiter's Great Red Spot is a storm wider than Earth.",
  "Uranus rolls around the Sun on its side, tilted about 98°.",
  "Voyager 1 is so far away that its radio signals take more than 23 hours to reach Earth.",
  "The Moon is moving away from Earth by about 3.8 cm every year.",
  "Mercury has ice in craters at its poles, despite being closest to the Sun.",
  "A year on Neptune lasts about 165 Earth years.",
  "Enceladus sprays water from an underground ocean into space.",
  "Pluto's heart-shaped glacier is made of frozen nitrogen.",
  "The ISS travels at about 28,000 km/h and circles Earth every ~92 minutes.",
  "Titan is the only moon with a thick atmosphere — and it rains methane there.",
  "Light from the Andromeda Galaxy left it about 2.5 million years ago.",
  "The footprint of a total solar eclipse is usually less than 270 km wide.",
];

export function factOfTheDay(date = new Date()): string {
  const day = Math.floor(date.getTime() / 86_400_000);
  return FACTS_OF_THE_DAY[day % FACTS_OF_THE_DAY.length];
}

/** Major annual meteor showers. Peak dates shift by about a day between years. */
export const METEOR_SHOWERS = [
  { name: "Quadrantids", peakMonth: 1, peakDay: 3, zhr: 110, parent: "Asteroid 2003 EH1" },
  { name: "Lyrids", peakMonth: 4, peakDay: 22, zhr: 18, parent: "Comet Thatcher" },
  { name: "Eta Aquariids", peakMonth: 5, peakDay: 6, zhr: 50, parent: "Comet Halley" },
  { name: "Perseids", peakMonth: 8, peakDay: 12, zhr: 100, parent: "Comet Swift–Tuttle" },
  { name: "Draconids", peakMonth: 10, peakDay: 8, zhr: 10, parent: "Comet Giacobini–Zinner" },
  { name: "Orionids", peakMonth: 10, peakDay: 21, zhr: 20, parent: "Comet Halley" },
  { name: "Leonids", peakMonth: 11, peakDay: 17, zhr: 15, parent: "Comet Tempel–Tuttle" },
  { name: "Geminids", peakMonth: 12, peakDay: 14, zhr: 150, parent: "Asteroid 3200 Phaethon" },
  { name: "Ursids", peakMonth: 12, peakDay: 22, zhr: 10, parent: "Comet Tuttle" },
] as const;

export const INTERESTS = [
  { id: "planets", label: "Planets", emoji: "🪐" },
  { id: "moons", label: "Moons", emoji: "🌙" },
  { id: "stars", label: "Stars & the Sun", emoji: "☀️" },
  { id: "black-holes", label: "Black holes", emoji: "🕳️" },
  { id: "missions", label: "Missions & rockets", emoji: "🚀" },
  { id: "stargazing", label: "Stargazing", emoji: "🔭" },
  { id: "life", label: "Life beyond Earth", emoji: "👽" },
  { id: "astronauts", label: "Astronauts", emoji: "👩‍🚀" },
] as const;
