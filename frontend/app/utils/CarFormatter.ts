import { carBrands } from '../data/carData';

// Funkce pro nalezení značky podle databázové hodnoty
export function formatBrand(dbBrand: string): string {
  if (!dbBrand) return '';
  
  // Najdi značku v carBrands podle klíče nebo názvu
  const brandEntry = Object.entries(carBrands).find(([key, brand]) => 
    key === dbBrand.toLowerCase() || 
    brand.name.toLowerCase() === dbBrand.toLowerCase()
  );
  
  return brandEntry ? brandEntry[1].name : capitalizeFirst(
    dbBrand
      .replace(/^koda$/gi, 'Škoda')
      .replace(/^jine$/gi, 'Jiné')
  );
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
  
  return model || capitalizeFirst(
    dbModel
      .replace(/_/g, ' ')
      .replace(/tda/g, 'Třída')
      .replace(/jiny model/gi, 'Jiný model')
      .replace(/ada (\d+)/gi, 'Řada $1')
      .replace(/tida ([abces])/gi, 'Třída $1')
  );
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
  
  // Speciální případy pro správné zobrazení
  const specialCases: { [key: string]: string } = {
    // Značky s diakritikou
    'koda': 'Škoda',
    'škoda': 'Škoda',
    'jine': 'Jiné',
    'jiné': 'Jiné',
    
    // Jiný model
    'jin model': 'Jiný model',
    'jiny model': 'Jiný model',
    'jiný model': 'Jiný model',
    
    // BMW Řada
    'ada 1': 'Řada 1',
    'ada 2': 'Řada 2',
    'ada 3': 'Řada 3',
    'ada 4': 'Řada 4',
    'ada 5': 'Řada 5',
    'ada 6': 'Řada 6',
    'ada 7': 'Řada 7',
    'ada 8': 'Řada 8',
    'řada 1': 'Řada 1',
    'řada 2': 'Řada 2',
    'řada 3': 'Řada 3',
    'řada 4': 'Řada 4',
    'řada 5': 'Řada 5',
    'řada 6': 'Řada 6',
    'řada 7': 'Řada 7',
    'řada 8': 'Řada 8',
    
    // Mercedes Třída
    'tida a': 'Třída A',
    'tida b': 'Třída B',
    'tida c': 'Třída C',
    'tida e': 'Třída E',
    'tida s': 'Třída S',
    'třída a': 'Třída A',
    'třída b': 'Třída B',
    'třída c': 'Třída C',
    'třída e': 'Třída E',
    'třída s': 'Třída S',
    'trida a': 'Třída A',
    'trida b': 'Třída B',
    'trida c': 'Třída C',
    'trida e': 'Třída E',
    'trida s': 'Třída S'
  };
  
  const lowerStr = str.toLowerCase();
  if (specialCases[lowerStr]) {
    return specialCases[lowerStr];
  }
  
  return str.charAt(0).toUpperCase() + str.slice(1);
}