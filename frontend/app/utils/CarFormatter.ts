import { carBrands } from '../data/carData';

// Funkce pro nalezení značky podle databázové hodnoty
export function formatBrand(dbBrand: string): string {
  if (!dbBrand) return '';
  
  // Najdi značku v carBrands podle klíče nebo názvu
  const brandEntry = Object.entries(carBrands).find(([key, brand]) => 
    key === dbBrand.toLowerCase() || 
    brand.name.toLowerCase() === dbBrand.toLowerCase()
  );
  
  return brandEntry ? brandEntry[1].name : capitalizeFirst(dbBrand);
}

// Funkce pro nalezení modelu podle databázové hodnoty
export function formatModel(dbBrand: string, dbModel: string): string {
  if (!dbModel || !dbBrand) return '';
  
  // Najdi značku
  const brandEntry = Object.entries(carBrands).find(([key, brand]) => 
    key === dbBrand.toLowerCase() || 
    brand.name.toLowerCase() === dbBrand.toLowerCase()
  );
  
  if (!brandEntry) return capitalizeFirst(dbModel);
  
  // Najdi model v seznamu modelů této značky
  const model = brandEntry[1].models.find(m => 
    m.toLowerCase() === dbModel.toLowerCase() ||
    m.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') === dbModel.toLowerCase()
  );
  
  return model || capitalizeFirst(dbModel);
}

// Funkce pro formátování celého názvu auta
export function formatCarTitle(dbBrand: string, dbModel: string): string {
  const brand = formatBrand(dbBrand);
  const model = formatModel(dbBrand, dbModel);
  return `${brand} ${model}`;
}

// Pomocná funkce pro kapitalizaci
function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}