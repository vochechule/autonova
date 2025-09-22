export interface Color {
  value: string
  label: string
  hex: string
  metallic?: boolean
}

export interface ColorFinish {
  value: string
  label: string
}

export const colors: Color[] = [
  // ✅ Most popular colors first
  { value: 'white', label: 'Bílá', hex: '#FFFFFF' },
  { value: 'black', label: 'Černá', hex: '#000000' },
  { value: 'gray', label: 'Šedá', hex: '#808080' },
  { value: 'silver', label: 'Stříbrná', hex: '#C0C0C0', metallic: true },

  // ✅ Common car colors
  { value: 'blue', label: 'Modrá', hex: '#2563EB' },
  { value: 'red', label: 'Červená', hex: '#DC2626' },
  { value: 'green', label: 'Zelená', hex: '#16A34A' },
  { value: 'yellow', label: 'Žlutá', hex: '#EAB308' },
  { value: 'orange', label: 'Oranžová', hex: '#EA580C' },
  { value: 'brown', label: 'Hnědá', hex: '#A16207' },

  // ✅ Additional common car colors
  { value: 'beige', label: 'Béžová', hex: '#F5F5DC' },
  { value: 'cream', label: 'Krémová', hex: '#FFFDD0' },
  { value: 'champagne', label: 'Šampaň', hex: '#F7E7CE', metallic: true },
  { value: 'bronze', label: 'Bronzová', hex: '#CD7F32', metallic: true },
  { value: 'copper', label: 'Měděná', hex: '#B87333', metallic: true },

  // ✅ Shades and variants
  { value: 'lightgray', label: 'Světle šedá', hex: '#D3D3D3' },
  { value: 'darkgray', label: 'Tmavě šedá', hex: '#404040' },
  { value: 'anthracite', label: 'Antracitová', hex: '#2F4F4F' },
  { value: 'charcoal', label: 'Uhlová', hex: '#36454F' },

  // ✅ Blue variants
  { value: 'lightblue', label: 'Světle modrá', hex: '#87CEEB' },
  { value: 'darkblue', label: 'Tmavě modrá', hex: '#1E3A8A' },
  { value: 'navy', label: 'Námořnická modrá', hex: '#000080' },
  { value: 'petrol', label: 'Petrolejová', hex: '#2C5F7C' },

  // ✅ Green variants
  { value: 'darkgreen', label: 'Tmavě zelená', hex: '#006400' },
  { value: 'forestgreen', label: 'Lesní zelená', hex: '#228B22' },
  { value: 'olive', label: 'Olivová', hex: '#808000' },

  // ✅ Red variants
  { value: 'burgundy', label: 'Vínová', hex: '#991B1B' },
  { value: 'maroon', label: 'Kaštanová', hex: '#800000' },
  { value: 'cherry', label: 'Višňová', hex: '#DE3163' },

  // ✅ Metallic/Premium colors
  { value: 'gold', label: 'Zlatá', hex: '#D97706', metallic: true },
  { value: 'platinum', label: 'Platinová', hex: '#E5E4E2', metallic: true },
  { value: 'titanium', label: 'Titanová', hex: '#878681', metallic: true },

  // ✅ Special/Luxury colors
  { value: 'purple', label: 'Fialová', hex: '#9333EA' },
  { value: 'violet', label: 'Violetová', hex: '#8B00FF' },
  { value: 'pink', label: 'Růžová', hex: '#FF69B4' },

  // ✅ Always keep "other" last
  { value: 'other', label: 'Jiná', hex: '#6B7280' }
]

export const colorFinishes: ColorFinish[] = [
  { value: 'standard', label: 'Standardní' },
  { value: 'metallic', label: 'Metalíza' },
  { value: 'pearl', label: 'Perleť' },
  { value: 'matte', label: 'Matná' },
  { value: 'satin', label: 'Satén' }, // ✅ Added satin finish
  { value: 'gloss', label: 'Lesklá' }, // ✅ Added high gloss
  { value: 'special', label: 'Speciální' }
]

export const getColorByValue = (value: string): Color | undefined => {
  return colors.find(color => color.value === value)
}

export const getColorFinishByValue = (value: string): ColorFinish | undefined => {
  return colorFinishes.find(finish => finish.value === value)
}

// ✅ Helper function to get popular colors for quick filters
export const getPopularColors = (): Color[] => {
  return colors.slice(0, 8) // First 8 colors (most popular)
}

// ✅ Helper function to group colors by category
export const getColorsByCategory = () => {
  return {
    neutral: colors.filter(c => ['white', 'black', 'gray', 'silver', 'lightgray', 'darkgray', 'anthracite', 'charcoal'].includes(c.value)),
    warm: colors.filter(c => ['red', 'orange', 'yellow', 'brown', 'burgundy', 'maroon', 'cherry', 'gold', 'bronze', 'copper'].includes(c.value)),
    cool: colors.filter(c => ['blue', 'green', 'lightblue', 'darkblue', 'navy', 'petrol', 'darkgreen', 'forestgreen', 'olive'].includes(c.value)),
    earth: colors.filter(c => ['beige', 'cream', 'champagne', 'brown'].includes(c.value)),
    special: colors.filter(c => ['purple', 'violet', 'pink', 'platinum', 'titanium'].includes(c.value))
  }
}