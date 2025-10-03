// Create: frontend/app/components/AdForm/types.ts
export interface AdCreateFormProps {
  mode?: 'create' | 'edit'
  adId?: string
  initialData?: AdData
}

export interface AdImage {
  id: string
  url: string
}

export interface AdData {
  id?: string
  title?: string
  brand?: string
  model?: string
  description?: string
  price?: number
  mileage?: number
  year?: number
  firstRegistration?: number
  bodyType?: string
  doorCount?: number
  seatCount?: number
  airbagCount?: number
  fuel?: string
  engineVolume?: number
  power?: number
  avgConsumption?: number
  transmission?: string
  gearCount?: number
  airConditioning?: string
  drivetrain?: string
  condition?: string
  technicalCheckUntil?: string
  countryOfOrigin?: string
  euroStandard?: string
  warrantyUntil?: string
  ecoTaxPaid?: boolean
  isFirstOwner?: boolean
  isDisabledAdapted?: boolean
  wasCrashed?: boolean
  hasServiceBook?: boolean
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  color?: string
  colorFinish?: string
  images?: AdImage[]
  latitude?: number
  longitude?: number
  address?: string
  safetyFeatures?: string
  assistSystems?: string
  securityFeatures?: string
  interiorComfort?: string
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FieldErrors {
  [key: string]: string;
}

export type FormFieldValue = string | number | boolean | null | undefined | File;