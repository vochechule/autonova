import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface Database {
  users: any[];
  ads: any[];
  images: any[];
  carFeatures: any[];
  reviews: any[];
  savedAds: any[];
  contactSubmissions: any[];
  passwordResetTokens: any[];
}

@Injectable()
export class JsonDbService {
  private dbPath: string;
  private db: Database;

  constructor() {
    this.dbPath = path.join(__dirname, 'db.json');
    this.loadDatabase();
  }

  private loadDatabase() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf-8');
        this.db = JSON.parse(data);
      } else {
        this.db = {
          users: [],
          ads: [],
          images: [],
          carFeatures: [],
          reviews: [],
          savedAds: [],
          contactSubmissions: [],
          passwordResetTokens: [],
        };
        this.saveDatabase();
      }
    } catch (error) {
      console.error('Error loading database:', error);
      this.db = {
        users: [],
        ads: [],
        images: [],
        carFeatures: [],
        reviews: [],
        savedAds: [],
        contactSubmissions: [],
        passwordResetTokens: [],
      };
    }
  }

  private saveDatabase() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Generic CRUD operations
  create(table: keyof Database, data: any) {
    const id = data.id || uuidv4();
    const createdAt = new Date().toISOString();
    const newRecord = { ...data, id, createdAt };
    this.db[table].push(newRecord);
    this.saveDatabase();
    return newRecord;
  }

  findMany(table: keyof Database, filter?: any) {
    let results = [...this.db[table]];
    
    if (filter) {
      results = results.filter(item => {
        return Object.keys(filter).every(key => {
          if (filter[key] === undefined) return true;
          return item[key] === filter[key];
        });
      });
    }
    
    return results;
  }

  findOne(table: keyof Database, filter: any) {
    return this.db[table].find(item => {
      return Object.keys(filter).every(key => item[key] === filter[key]);
    });
  }

  findById(table: keyof Database, id: string) {
    return this.db[table].find(item => item.id === id);
  }

  update(table: keyof Database, id: string, data: any) {
    const index = this.db[table].findIndex(item => item.id === id);
    if (index === -1) return null;
    
    this.db[table][index] = { ...this.db[table][index], ...data };
    this.saveDatabase();
    return this.db[table][index];
  }

  delete(table: keyof Database, id: string) {
    const index = this.db[table].findIndex(item => item.id === id);
    if (index === -1) return null;
    
    const deleted = this.db[table][index];
    this.db[table].splice(index, 1);
    this.saveDatabase();
    return deleted;
  }

  deleteMany(table: keyof Database, filter: any) {
    const initialLength = this.db[table].length;
    this.db[table] = this.db[table].filter(item => {
      return !Object.keys(filter).every(key => item[key] === filter[key]);
    });
    this.saveDatabase();
    return { count: initialLength - this.db[table].length };
  }

  // User operations
  user = {
    create: (data: any) => this.create('users', data),
    findMany: (filter?: any) => this.findMany('users', filter),
    findUnique: (filter: { where: any }) => this.findOne('users', filter.where),
    findFirst: (filter: { where: any }) => this.findOne('users', filter.where),
    update: (params: { where: any; data: any }) => {
      const user = this.findOne('users', params.where);
      return user ? this.update('users', user.id, params.data) : null;
    },
    delete: (filter: { where: any }) => {
      const user = this.findOne('users', filter.where);
      return user ? this.delete('users', user.id) : null;
    },
  };

  // Ad operations
  ad = {
    create: (data: any) => {
      const ad = this.create('ads', data);
      // Handle images if provided
      if (data.images && data.images.create) {
        data.images.create.forEach((img: any) => {
          this.image.create({ ...img, adId: ad.id });
        });
      }
      return ad;
    },
    findMany: (filter?: any) => {
      const ads = this.findMany('ads', filter?.where);
      
      // Apply sorting
      if (filter?.orderBy) {
        const orderKey = Object.keys(filter.orderBy)[0];
        const orderDir = filter.orderBy[orderKey];
        ads.sort((a, b) => {
          if (orderDir === 'desc') return b[orderKey] > a[orderKey] ? 1 : -1;
          return a[orderKey] > b[orderKey] ? 1 : -1;
        });
      }
      
      // Apply pagination
      if (filter?.skip !== undefined || filter?.take !== undefined) {
        const skip = filter.skip || 0;
        const take = filter.take || ads.length;
        return ads.slice(skip, skip + take);
      }
      
      return ads;
    },
    findUnique: (filter: { where: any; include?: any }) => {
      const ad = this.findOne('ads', filter.where);
      if (!ad) return null;
      
      // Include relations
      if (filter.include) {
        if (filter.include.images) {
          ad.images = this.findMany('images', { adId: ad.id });
        }
        if (filter.include.user) {
          ad.user = this.findById('users', ad.userId);
        }
      }
      
      return ad;
    },
    update: (params: { where: any; data: any }) => {
      const ad = this.findOne('ads', params.where);
      if (!ad) return null;
      
      // Handle image updates
      if (params.data.images?.deleteMany) {
        this.deleteMany('images', { adId: ad.id });
      }
      if (params.data.images?.create) {
        params.data.images.create.forEach((img: any) => {
          this.image.create({ ...img, adId: ad.id });
        });
      }
      
      // Remove image data from ad update
      const { images, ...adData } = params.data;
      return this.update('ads', ad.id, adData);
    },
    delete: (filter: { where: any }) => {
      const ad = this.findOne('ads', filter.where);
      if (!ad) return null;
      
      // Cascade delete images
      this.deleteMany('images', { adId: ad.id });
      this.deleteMany('savedAds', { adId: ad.id });
      
      return this.delete('ads', ad.id);
    },
    count: (filter?: any) => {
      return this.findMany('ads', filter?.where).length;
    },
  };

  // Image operations
  image = {
    create: (data: any) => this.create('images', data),
    findMany: (filter?: any) => this.findMany('images', filter),
    deleteMany: (filter: any) => this.deleteMany('images', filter),
  };

  // SavedAd operations
  savedAd = {
    create: (data: any) => this.create('savedAds', data),
    findMany: (filter?: any) => {
      const savedAds = this.findMany('savedAds', filter?.where);
      
      // Include ad details if requested
      if (filter?.include?.ad) {
        return savedAds.map(sa => ({
          ...sa,
          ad: this.ad.findUnique({ where: { id: sa.adId }, include: filter.include.ad }),
        }));
      }
      
      return savedAds;
    },
    findFirst: (filter: { where: any }) => this.findOne('savedAds', filter.where),
    delete: (filter: { where: any }) => {
      const savedAd = this.findOne('savedAds', filter.where);
      return savedAd ? this.delete('savedAds', savedAd.id) : null;
    },
  };

  // Review operations
  review = {
    create: (data: any) => this.create('reviews', data),
    findMany: (filter?: any) => this.findMany('reviews', filter?.where),
    findFirst: (filter: { where: any }) => this.findOne('reviews', filter.where),
  };

  // ContactSubmission operations
  contactSubmission = {
    create: (data: any) => this.create('contactSubmissions', data),
    findMany: (filter?: any) => this.findMany('contactSubmissions', filter?.where),
    update: (params: { where: any; data: any }) => {
      const submission = this.findOne('contactSubmissions', params.where);
      return submission ? this.update('contactSubmissions', submission.id, params.data) : null;
    },
  };

  // PasswordResetToken operations
  passwordResetToken = {
    create: (data: any) => this.create('passwordResetTokens', data),
    findUnique: (filter: { where: any }) => this.findOne('passwordResetTokens', filter.where),
    findFirst: (filter: { where: any }) => this.findOne('passwordResetTokens', filter.where),
    deleteMany: (filter: any) => this.deleteMany('passwordResetTokens', filter),
    update: (params: { where: any; data: any }) => {
      const token = this.findOne('passwordResetTokens', params.where);
      return token ? this.update('passwordResetTokens', token.id, params.data) : null;
    },
  };
}
