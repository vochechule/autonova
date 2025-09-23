export enum BodyType {
  hatchback = 'hatchback',
  sedan = 'sedan',
  kombi = 'kombi',
  suv = 'suv',
  coupe = 'coupe',
  cabrio = 'cabrio',
  mpv = 'mpv',
  pickup = 'pickup',
  van = 'van',
  jiné = 'jiné',
}

export enum AirConditioning {
  none = 'none',
  manual = 'manual',
  automatic = 'automatic',
  two_zone = 'two_zone',
  three_zone = 'three_zone',
}

export enum FuelType {
  petrol = 'petrol',
  diesel = 'diesel',
  hybrid = 'hybrid',
  electric = 'electric',
  lpg = 'lpg',
  cng = 'cng',
}

export enum Transmission {
  manual = 'manual',
  automatic = 'automatic',
  cvt = 'cvt',
  sequential = 'sequential',
}

export enum Drivetrain {
  fwd = 'fwd',
  rwd = 'rwd',
  awd = 'awd',
  four_x_four = 'four_x_four',
}

export enum EmissionClass {
  euro1 = 'euro1',
  euro2 = 'euro2',
  euro3 = 'euro3',
  euro4 = 'euro4',
  euro5 = 'euro5',
  euro6 = 'euro6',
  euro6d = 'euro6d',
}

export enum CarCondition {
  new = 'new',
  used = 'used',
  crashed = 'crashed',
  demo = 'demo',
}

export enum Color {
  // Most popular colors
  WHITE = 'white',
  BLACK = 'black',
  GRAY = 'gray',
  SILVER = 'silver',

  // Common car colors
  BLUE = 'blue',
  RED = 'red',
  GREEN = 'green',
  YELLOW = 'yellow',
  ORANGE = 'orange',
  BROWN = 'brown',

  // Additional common car colors
  BEIGE = 'beige',
  CREAM = 'cream',
  CHAMPAGNE = 'champagne',
  BRONZE = 'bronze',
  COPPER = 'copper',

  // Shades and variants
  LIGHTGRAY = 'lightgray',
  DARKGRAY = 'darkgray',
  ANTHRACITE = 'anthracite',
  CHARCOAL = 'charcoal',

  // Blue variants
  LIGHTBLUE = 'lightblue',
  DARKBLUE = 'darkblue',
  NAVY = 'navy',
  PETROL = 'petrol',

  // Green variants
  DARKGREEN = 'darkgreen',
  FORESTGREEN = 'forestgreen',
  OLIVE = 'olive',

  // Red variants
  BURGUNDY = 'burgundy',
  MAROON = 'maroon',
  CHERRY = 'cherry',

  // Metallic/Premium colors
  GOLD = 'gold',
  PLATINUM = 'platinum',
  TITANIUM = 'titanium',

  // Special/Luxury colors
  PURPLE = 'purple',
  VIOLET = 'violet',
  PINK = 'pink',

  // Always keep "other" last
  OTHER = 'other'
}

export enum ColorFinish {
  STANDARD = 'standard',
  METALLIC = 'metallic',
  PEARL = 'pearl',
  MATTE = 'matte',
  SATIN = 'satin',     // ✅ Added satin finish
  GLOSS = 'gloss',     // ✅ Added high gloss
  SPECIAL = 'special'
}