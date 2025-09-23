export const conditionMap: Record<string, string> = {
  new: 'nové',
  used: 'ojeté',
  crashed: 'havárie',
  demo: 'demo',
}

export const fuelMap: Record<string, string> = {
  petrol: 'benzín',
  diesel: 'nafta',
  hybrid: 'hybrid',
  electric: 'elektro',
  lpg: 'LPG',
  cng: 'CNG',
}

export const transmissionMap: Record<string, string> = {
  manual: 'manuální',
  automatic: 'automatická',
  cvt: 'CVT',
  sequential: 'sekvenční',
  semi_automatic: 'poloautomatická',
}

// ✅ PŘIDÁNO - Mapa pro klimatizaci
export const airConditioningMap: Record<string, string> = {
  none: 'Žádná',
  manual: 'Manuální',
  automatic: 'Automatická',
  two_zone: 'Dvouzónová',
  three_zone: 'Třízónová',
}

// ✅ PŘIDÁNO - Mapa pro pohon kol
export const drivetrainMap: Record<string, string> = {
  fwd: 'Přední (FWD)',
  rwd: 'Zadní (RWD)',
  awd: '4x4 (AWD)',
  four_x_four: '4x4 (mechanické)',
}

// ✅ COMPLETE color map with ALL colors from colorData.ts
export const colorMap: Record<string, string> = {
  // Basic colors (already had these)
  black: 'Černá',
  white: 'Bílá',
  silver: 'Stříbrná',
  gray: 'Šedá',
  red: 'Červená',
  blue: 'Modrá',
  green: 'Zelená',
  yellow: 'Žlutá',
  orange: 'Oranžová',
  brown: 'Hnědá',
  gold: 'Zlatá',
  burgundy: 'Vínová',
  navy: 'Tmavě modrá',
  
  // ✅ MISSING colors that were causing issues:
  beige: 'Béžová',
  cream: 'Krémová',
  champagne: 'Šampaň',
  bronze: 'Bronzová',
  copper: 'Měděná',        // ✅ This was your "copper" issue!
  
  // Gray variants
  lightgray: 'Světle šedá',
  darkgray: 'Tmavě šedá',
  anthracite: 'Antracitová',
  charcoal: 'Uhlová',
  
  // Blue variants
  lightblue: 'Světle modrá',
  darkblue: 'Tmavě modrá',
  petrol: 'Petrolejová',
  
  // Green variants
  darkgreen: 'Tmavě zelená',
  forestgreen: 'Lesní zelená',
  olive: 'Olivová',
  
  // Red variants
  maroon: 'Kaštanová',
  cherry: 'Višňová',
  
  // Premium colors
  platinum: 'Platinová',
  titanium: 'Titanová',
  
  // Special colors
  purple: 'Fialová',
  violet: 'Violetová',
  pink: 'Růžová',
  
  // Always last
  other: 'Jiná',
}

// ✅ COMPLETE color finish map with missing finishes
export const colorFinishMap: Record<string, string> = {
  standard: 'Standardní',
  metallic: 'Metalíza',
  pearl: 'Perleť',
  matte: 'Matná',
  satin: 'Satén',          // ✅ Missing finish
  gloss: 'Lesklá',         // ✅ Missing finish
  special: 'Speciální',
}