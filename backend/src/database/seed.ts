import { JsonDbService } from '../database/json-db.service';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(db: JsonDbService) {
  console.log('🌱 Seeding database with sample data...');

  // Check if database already has data
  const existingUsers = db.findMany('users');
  if (existingUsers.length > 0) {
    console.log('✅ Database already seeded, skipping...');
    return;
  }

  // Create demo users
  const hashedPassword = await bcrypt.hash('demo123', 10);

  const adminUser = db.user.create({
    email: 'admin@carta.cz',
    password: hashedPassword,
    name: 'Admin Carta',
    isDealer: true,
    dealerTier: 'ENTERPRISE',
    role: 'ADMIN',
  });

  const dealerUser = db.user.create({
    email: 'dealer@carta.cz',
    password: hashedPassword,
    name: 'Jan Novák',
    isDealer: true,
    dealerTier: 'PREMIUM',
    role: 'USER',
  });

  const regularUser = db.user.create({
    email: 'user@carta.cz',
    password: hashedPassword,
    name: 'Petr Svoboda',
    isDealer: false,
    dealerTier: 'BASIC',
    role: 'USER',
  });

  console.log('✅ Created demo users');
  console.log('   - admin@carta.cz / demo123 (Admin)');
  console.log('   - dealer@carta.cz / demo123 (Dealer)');
  console.log('   - user@carta.cz / demo123 (User)');

  // Create sample car ads
  const sampleAds = [
    {
      userId: dealerUser.id,
      title: 'Škoda Octavia 2.0 TDI Combi',
      brand: 'Škoda',
      model: 'Octavia',
      description:
        'Perfektní rodinné auto v top stavu. Servisní kniha, pravidelný servis. Nehavarované, garáž ováno.',
      price: 450000,
      mileage: 85000,
      year: 2019,
      firstRegistration: 2019,
      bodyType: 'kombi',
      doorCount: 5,
      seatCount: 5,
      color: 'Stříbrná',
      colorFinish: 'Metalíza',
      airbagCount: 8,
      airConditioning: 'automatic',
      fuel: 'diesel',
      engineVolume: 2000,
      power: 110,
      avgConsumption: 4.8,
      transmission: 'manual',
      gearCount: 6,
      drivetrain: 'fwd',
      condition: 'used',
      countryOfOrigin: 'Česká republika',
      euroStandard: 'euro6',
      ecoTaxPaid: true,
      isFirstOwner: false,
      isDisabledAdapted: false,
      wasCrashed: false,
      hasServiceBook: true,
      contactPhone: '+420 777 123 456',
      contactEmail: 'dealer@carta.cz',
      contactName: 'Jan Novák',
      isVisible: true,
      views: 150,
    },
    {
      userId: dealerUser.id,
      title: 'BMW 320d xDrive Touring',
      brand: 'BMW',
      model: '3 Series',
      description:
        'Luxusní kombi s pohonem všech kol. Bohatá výbava, kožené sedačky, navigace.',
      price: 720000,
      mileage: 62000,
      year: 2020,
      firstRegistration: 2020,
      bodyType: 'kombi',
      doorCount: 5,
      seatCount: 5,
      color: 'Černá',
      colorFinish: 'Metalíza',
      airbagCount: 9,
      airConditioning: 'two_zone',
      fuel: 'diesel',
      engineVolume: 2000,
      power: 140,
      avgConsumption: 5.2,
      transmission: 'automatic',
      gearCount: 8,
      drivetrain: 'awd',
      condition: 'used',
      countryOfOrigin: 'Německo',
      euroStandard: 'euro6d',
      ecoTaxPaid: true,
      isFirstOwner: false,
      isDisabledAdapted: false,
      wasCrashed: false,
      hasServiceBook: true,
      contactPhone: '+420 777 123 456',
      contactEmail: 'dealer@carta.cz',
      contactName: 'Jan Novák',
      isVisible: true,
      views: 230,
    },
    {
      userId: regularUser.id,
      title: 'Volkswagen Golf 1.4 TSI',
      brand: 'Volkswagen',
      model: 'Golf',
      description:
        'Ekonomický hatchback, první majitel, servisní kniha. Ideální do města.',
      price: 280000,
      mileage: 45000,
      year: 2018,
      firstRegistration: 2018,
      bodyType: 'hatchback',
      doorCount: 5,
      seatCount: 5,
      color: 'Bílá',
      colorFinish: 'Metalíza',
      airbagCount: 6,
      airConditioning: 'manual',
      fuel: 'petrol',
      engineVolume: 1400,
      power: 92,
      avgConsumption: 5.5,
      transmission: 'manual',
      gearCount: 6,
      drivetrain: 'fwd',
      condition: 'used',
      countryOfOrigin: 'Česká republika',
      euroStandard: 'euro6',
      ecoTaxPaid: true,
      isFirstOwner: true,
      isDisabledAdapted: false,
      wasCrashed: false,
      hasServiceBook: true,
      contactPhone: '+420 603 555 777',
      contactEmail: 'user@carta.cz',
      contactName: 'Petr Svoboda',
      isVisible: true,
      views: 89,
    },
  ];

  for (const adData of sampleAds) {
    db.ad.create(adData);
  }

  console.log(`✅ Created ${sampleAds.length} sample car ads`);

  // Create a sample review
  db.review.create({
    userId: regularUser.id,
    targetId: dealerUser.id,
    rating: 5,
    comment: 'Výborný prodejce, rychlá komunikace, auto přesně jak v inzerátu!',
  });

  console.log('✅ Database seeding completed!');
  console.log('\n🚀 You can now access the app at http://localhost:3001');
  console.log('👤 Login with: admin@carta.cz / demo123\n');
}
