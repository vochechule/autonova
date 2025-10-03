// Create: frontend/app/components/AdForm/utils/validation.ts
import type { ValidationRules, FieldErrors, FormFieldValue } from '../types'

export const validationRules: ValidationRules = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 100,
    message: 'Název musí mít 5-100 znaků'
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 5000,
    message: 'Popis musí mít 10-5000 znaků'
  },
  price: {
    required: true,
    min: 1,
    max: 1000000000,
    message: 'Cena musí být 1 - 1 000 000 000 Kč'
  },
  mileage: {
    required: true,
    min: 0,
    max: 2000000,
    message: 'Nájezd musí být 0 - 2 000 000 km'
  },
  year: {
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1,
    message: `Rok výroby musí být ${1900}-${new Date().getFullYear() + 1}`
  },
  firstRegistration: {
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1,
    message: `První registrace musí být ${1900}-${new Date().getFullYear() + 1}`
  },
  engineVolume: {
    required: true,
    min: 50,
    max: 20000,
    message: 'Objem motoru musí být 50-20000 ccm'
  },
  power: {
    required: true,
    min: 1,
    max: 2000,
    message: 'Výkon musí být 1-2000 kW'
  },
  avgConsumption: {
    required: true,
    min: 0.1,
    max: 100,
    message: 'Spotřeba musí být 0.1-100 l/100km'
  },
  doorCount: {
    required: true,
    min: 2,
    max: 6,
    message: 'Počet dveří musí být 2-6'
  },
  seatCount: {
    required: true,
    min: 1,
    max: 12,
    message: 'Počet míst musí být 1-12'
  },
  gearCount: {
    required: true,
    min: 1,
    max: 12,
    message: 'Počet rychlostí musí být 1-12'
  },
  contactPhone: {
    required: true,
    pattern: /^(\+420\s?)?[0-9\s]{9,}$/,
    message: 'Zadejte platné telefonní číslo'
  }
};

export const validateField = (name: string, value: FormFieldValue): string | null => {
  const rule = validationRules[name];
  if (!rule) return null;

  if (value instanceof File) {
    return null;
  }

  if (rule.required && (!value || value.toString().trim() === '')) {
    return rule.message || `${name} je povinné`;
  }

  if (!value || value.toString().trim() === '') return null;

  const stringValue = value.toString().trim();
  const numberValue = Number(value);

  if (rule.minLength && stringValue.length < rule.minLength) {
    return rule.message || `Minimálně ${rule.minLength} znaků`;
  }
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    return rule.message || `Maximálně ${rule.maxLength} znaků`;
  }

  if (rule.min !== undefined && numberValue < rule.min) {
    return rule.message || `Minimální hodnota je ${rule.min}`;
  }
  if (rule.max !== undefined && numberValue > rule.max) {
    return rule.message || `Maximální hodnota je ${rule.max}`;
  }

  if (rule.pattern && !rule.pattern.test(stringValue)) {
    return rule.message || 'Neplatný formát';
  }

  return null;
};

interface LocationData {
  lat: number
  lng: number
  address?: string
}

interface ExistingImage {
  id: string
  url: string
  order: number
}

export const validateForm = (
  formData: FormData, 
  selectedBrand: string, 
  selectedModel: string, 
  selectedColor: string, 
  location: LocationData | null, 
  existingImages: ExistingImage[], 
  images: File[]
): FieldErrors => {
  const errors: FieldErrors = {};

  Object.keys(validationRules).forEach(fieldName => {
    const value = formData.get(fieldName);
    const error = validateField(fieldName, value);
    if (error) {
      errors[fieldName] = error;
    }
  });

  if (!selectedBrand) {
    errors.brand = 'Vyberte značku vozidla';
  }
  if (!selectedModel) {
    errors.model = 'Vyberte model vozidla';
  }
  if (!selectedColor) {
    errors.color = 'Vyberte barvu vozidla';
  }
  if (!location) {
    errors.location = 'Vyberte lokalitu vozidla na mapě';
  }

  const year = Number(formData.get('year'));
  const firstRegistration = Number(formData.get('firstRegistration'));
  if (year && firstRegistration && firstRegistration < year) {
    errors.firstRegistration = 'První registrace nemůže být před rokem výroby';
  }

  const totalImages = existingImages.length + images.length;
  if (totalImages < 2) {
    errors.images = 'Přidejte alespoň 2 obrázky';
  }

  return errors;
};