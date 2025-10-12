# Elektroauta & Hybrid - Frontend implementace

## Přehled

Implementoval jsem kompletní podporu pro elektroauta a hybridní vozidla bez nutnosti měnit databázi. Řešení je čistě frontendové a využívá dynamické přepisy labelů a validace podle typu paliva.

## ✅ **Funkcionality**

### **1. Dynamické formulářové pole**

**EngineSection.tsx** - upravuje labely podle vybraného paliva:

#### **Spalovací motory (benzín/nafta/LPG/CNG):**

- "Objem motoru (ccm)" → 50-20000 ccm
- "Průměrná spotřeba (l/100km)" → 0.1-100 l/100km

#### **Elektroauta:**

- "Kapacita baterie (kWh)" → 10-200 kWh
- "Spotřeba energie (kWh/100km)" → 5-50 kWh/100km

#### **Hybridy:**

- "Objem motoru (ccm) / Kapacita (kWh)" → flexibilní
- "Kombinovaná spotřeba (l/100km)" → optimalizováno pro hybrid

### **2. Visual feedback**

- **⚡ Elektro ikona** - zobrazuje se u elektroaut
- **🔋 Hybrid ikona** - zobrazuje se u hybridů
- **Zelená barva** - pro elektroauto pole (environmentally friendly)
- **Modrá barva** - pro hybrid pole
- **Dark mode podpora** - kompletní styling

### **3. Dynamické zobrazení v detailu**

**AdDetailClient.tsx** - přizpůsobuje labels podle paliva:

#### **Klíčové specifikace (nahoře):**

```tsx
// Místo "1.6L" → "75kWh" pro elektro
getKeySpecVolume(ad.engineVolume, ad.fuel);
```

#### **Detailní specifikace:**

- "Objem motoru" → "Kapacita baterie" (elektro)
- "Spotřeba" → "Spotřeba energie" (elektro)
- "6.5 l/100km" → "18.5 kWh/100km" (elektro)

### **4. Inteligentní validace**

**validation.ts** - různá validační pravidla podle paliva:

```typescript
// Klasické auto
engineVolume: 50-20000 ccm
avgConsumption: 0.1-100 l/100km

// Elektroauto
engineVolume: 10-200 kWh (baterie)
avgConsumption: 5-50 kWh/100km
```

## 🔧 **Technické detaily**

### **State management**

```tsx
const [selectedFuel, setSelectedFuel] = useState<string>("");
const isElectric = selectedFuel === "electric";
const isHybrid = selectedFuel === "hybrid";
```

### **Helper functions**

```tsx
const getEngineVolumeLabel = () => {
  if (isElectric) return "Kapacita baterie (kWh)";
  if (isHybrid) return "Objem motoru (ccm) / Kapacita (kWh)";
  return "Objem motoru (ccm)";
};
```

### **CSS styly**

```scss
.form-section.electric-mode {
  .engine-volume-group::before {
    content: "⚡";
  }
  label {
    color: #10b981;
  } // Zelená
  input {
    border-color: #10b981;
  }
}
```

## 💾 **Databáze kompatibilita**

- **Beze změn DB schema** - používáme existující pole
- **engineVolume**: ccm pro spalovací, kWh pro elektro
- **avgConsumption**: l/100km pro spalovací, kWh/100km pro elektro
- **Zpětně kompatibilní** - stará data fungují normálně

## 🚗 **Podporované typy**

| Palivo  | Engine Volume   | Consumption    | Visual    |
| ------- | --------------- | -------------- | --------- |
| Benzín  | 1598 ccm (1.6L) | 6.5 l/100km    | Default   |
| Nafta   | 1968 ccm (2.0L) | 5.2 l/100km    | Default   |
| Elektro | 75 kWh          | 18.5 kWh/100km | ⚡ Zelená |
| Hybrid  | 1800 ccm        | 4.2 l/100km    | 🔋 Modrá  |
| LPG/CNG | 1600 ccm        | 7.8 l/100km    | Default   |

## 🎯 **User Experience**

### **Formulář:**

1. Uživatel vybere "Elektro" jako palivo
2. Pole se automaticky přepnou na baterii/spotřebu
3. Visual feedback (ikony, barvy) se aktivuje
4. Validace se přizpůsobí elektroautům
5. Placeholdery a nápověda se změní

### **Detail stránky:**

1. Automatická detekce typu paliva
2. Správné zobrazení jednotek
3. Konzistentní labeling napříč UI
4. Zachování všech funkcí (sdílení, favorit, atd.)

## 🔮 **Možná rozšíření**

- **Plug-in hybrid** - speciální handling
- **Vodík (hydrogen)** - nový fuel type
- **Range (dojezd)** - dodatečné pole pro elektro
- **Charging speed** - rychlost nabíjení
- **Battery degradation** - stav baterie

## 🧪 **Testing**

Pro testování:

1. Jít na `/ads/new` (vytvoření inzerátu)
2. Vybrat "Elektro" v palivu
3. Sledovat změnu polí a validace
4. Vyplnit kapacitu baterie (např. 75 kWh)
5. Vyplnit spotřebu (např. 18.5 kWh/100km)
6. Vytvořit inzerát a zkontrolovat detail
