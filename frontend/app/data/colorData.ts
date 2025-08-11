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
  { value: 'black', label: 'Černá', hex: '#000000' },
  { value: 'white', label: 'Bílá', hex: '#FFFFFF' },
  { value: 'silver', label: 'Stříbrná', hex: '#C0C0C0', metallic: true },
  { value: 'gray', label: 'Šedá', hex: '#808080' },
  { value: 'red', label: 'Červená', hex: '#DC2626' },
  { value: 'blue', label: 'Modrá', hex: '#2563EB' },
  { value: 'green', label: 'Zelená', hex: '#16A34A' },
  { value: 'yellow', label: 'Žlutá', hex: '#EAB308' },
  { value: 'orange', label: 'Oranžová', hex: '#EA580C' },
  { value: 'brown', label: 'Hnědá', hex: '#A16207' },
  { value: 'gold', label: 'Zlatá', hex: '#D97706', metallic: true },
  { value: 'burgundy', label: 'Vínová', hex: '#991B1B' },
  { value: 'navy', label: 'Tmavě modrá', hex: '#1E3A8A' },
  { value: 'other', label: 'Jiná', hex: '#6B7280' }
]

export const colorFinishes: ColorFinish[] = [
  { value: 'standard', label: 'Standardní' },
  { value: 'metallic', label: 'Metalíza' },
  { value: 'pearl', label: 'Perleť' },
  { value: 'matte', label: 'Matná' },
  { value: 'special', label: 'Speciální' }
]

export const getColorByValue = (value: string): Color | undefined => {
  return colors.find(color => color.value === value)
}

export const getColorFinishByValue = (value: string): ColorFinish | undefined => {
  return colorFinishes.find(finish => finish.value === value)
}