# 🖼️ Vercel Image Optimization - Úspora nákladů

## 📊 Problém
- Vysoké využití Vercel image transformations (75% z 1000/měsíc)
- Hrozba upgrade na $20/měsíc
- Potřeba optimalizovat bez ztráty kvality

## ✅ Implementované optimalizace

### 1. **Odstranění `unoptimized={true}`**
```tsx
// ❌ Před - obcházení optimalizace
<Image unoptimized={true} />

// ✅ Po - použití Vercel optimalizace
<Image quality={85} sizes="800px" />
```

### 2. **Snížení kvality obrázků**
- **Carousel**: 90 → 85 (hlavní obrázky)
- **Cards**: 90 → 80 (náhledy)  
- **Thumbnails**: 85 → 75 (malé obrázky)
- **Preload**: 75 → 60 (skryté preloady)

### 3. **Optimalizace preloadingu**
```tsx
// ❌ Před - preload až 3+ obrázků
const isEarly = index < 3

// ✅ Po - pouze adjacent obrázky  
const isNext = index === currentIndex + 1
const isPrev = index === currentIndex - 1
```

### 4. **Zmenšení preload rozlišení**
- **Před**: 800×600px preload obrázky
- **Po**: 200×150px preload obrázky
- **Úspora**: ~75% velikost

### 5. **Lepší cache konfigurace**
```typescript
// next.config.ts
images: {
  minimumCacheTTL: 86400, // 24 hodin cache
}

headers: [{
  source: '/_next/image/:path*',
  headers: [{ 
    key: 'Cache-Control', 
    value: 'public, max-age=86400, s-maxage=31536000, immutable' 
  }]
}]
```

### 6. **Redukce device sizes**
```typescript
// Méně variant = méně transformací
deviceSizes: [640, 750, 828, 1080, 1200], // bylo 1920
imageSizes: [16, 32, 48, 64, 96, 128, 256] // bylo 384
```

## 📈 Očekávané úspory

| Typ stránky | Před | Po | Úspora |
|-------------|------|-----|--------|
| **Home page** | ~30 transf. | ~15 transf. | 50% |
| **Ad detail** | ~6 transf. | ~2 transf. | 67% |
| **Profile** | ~8 transf. | ~4 transf. | 50% |

## 🎯 Celkový dopad
- **Odhadovaná úspora**: 50-70% transformací
- **Nové monthly usage**: ~300-500 transformací
- **Zůstává v free tier**: ✅ Ano
- **Kvalita obrázků**: Zachována pro uživatele

## 🔧 Nástroje pro monitoring

### Development tracking
```typescript
import { trackImageTransformation } from './utils/imageTracker'

// Automatické logování v dev módu
// Varování při 50/100/200+ transformacích
```

### Utility funkce
```typescript
import { getImageProps } from './utils/imageOptimization'

<Image {...getImageProps('card')} />
<Image {...getImageProps('carousel')} />  
<Image {...getImageProps('thumbnail')} />
```

## 📋 Doporučení pro budoucnost

1. **Monitoruj usage** přes Vercel dashboard
2. **Používej WebP/AVIF** formáty (už je v config)
3. **Lazy load** všechny obrázky kromě above-the-fold
4. **Optimalizuj upload** - zmenši obrázky před uploadem do Supabase
5. **Rozvaž CDN** pro statické assety

## 🚀 Nasazení
Všechny optimalizace jsou hotové a funkční. Stačí:
```bash
npm run build
npm run deploy
```

Očekávaný výsledok: **Snížení na ~400 transformací/měsíc** ✅