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
  const model = brandEntry[1].models.find(m => {
    const normalizedModel = m.toLowerCase();
    const normalizedDbModel = dbModel.toLowerCase();
    
    // Přímé shodování
    if (normalizedModel === normalizedDbModel) return true;
    
    // Shodování s podtržítky místo mezer a bez diakritiky
    const modelForDb = normalizedModel
      .replace(/\s+/g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // odstraň diakritiku
      .replace(/[^a-z0-9_]/g, '');
    
    if (modelForDb === normalizedDbModel) return true;
    
    // Obráceně - z DB formátu zpět na display formát
    const dbForModel = normalizedDbModel
      .replace(/_/g, ' ')
      .replace(/tda/g, 'třída')
      .replace(/trida/g, 'třída');
    
    if (normalizedModel === dbForModel) return true;
    
    return false;
  });
  
  return model || capitalizeFirst(dbModel.replace(/_/g, ' ').replace(/tda/g, 'Třída'));
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