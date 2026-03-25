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
    const createdAt = data.createdAt || new Date().toISOString();
    const updatedAt = data.updatedAt || new Date().toISOString();
    const newRecord = { ...data, id, createdAt, updatedAt };
    this.db[table].push(newRecord);
    this.saveDatabase();
    return newRecord;
  }

  findMany(table: keyof Database, filter?: any) {
    let results = [...this.db[table]];

    if (filter) {
      results = results.filter((item) => {
        return Object.keys(filter).every((key) => {
          if (filter[key] === undefined) return true;
          return item[key] === filter[key];
        });
      });
    }

    return results;
  }

  findOne(table: keyof Database, filter: any) {
    return this.db[table].find((item) => {
      return Object.keys(filter).every((key) => item[key] === filter[key]);
    });
  }

  findById(table: keyof Database, id: string) {
    return this.db[table].find((item) => item.id === id);
  }

  update(table: keyof Database, id: string, data: any) {
    const index = this.db[table].findIndex((item) => item.id === id);
    if (index === -1) return null;

    const updatedAt = new Date().toISOString();
    this.db[table][index] = { ...this.db[table][index], ...data, updatedAt };
    this.saveDatabase();
    return this.db[table][index];
  }

  delete(table: keyof Database, id: string) {
    const index = this.db[table].findIndex((item) => item.id === id);
    if (index === -1) return null;

    const deleted = this.db[table][index];
    this.db[table].splice(index, 1);
    this.saveDatabase();
    return deleted;
  }

  deleteMany(table: keyof Database, filter: any) {
    const initialLength = this.db[table].length;
    this.db[table] = this.db[table].filter((item) => {
      return !Object.keys(filter).every((key) => item[key] === filter[key]);
    });
    this.saveDatabase();
    return { count: initialLength - this.db[table].length };
  }

  // User operations
  user = {
    create: (params: any) => {
      // Support both formats: direct data or { data: {...}, select: {...} }
      const data = params.data || params;
      const user = this.create('users', data);
      
      // If select is specified, return only selected fields
      if (params.select && params.data) {
        const selected: any = {};
        Object.keys(params.select).forEach(key => {
          if (params.select[key]) selected[key] = user[key];
        });
        return selected;
      }
      
      return user;
    },
    findMany: (filter?: any) => this.findMany('users', filter?.where || filter),
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
    count: (filter?: any) => {
      return this.findMany('users', filter?.where).length;
    },
  };

  // Ad operations
  ad = {
    create: (params: any) => {
      // Support both formats: direct data or { data: {...}, include: {...} }
      let adData = params.data || params;
      
      // Handle Prisma relations (user: { connect: { id } })
      if (adData.user?.connect?.id) {
        adData.userId = adData.user.connect.id;
        delete adData.user;
      }
      
      const ad = this.create('ads', adData);
      
      // Handle images if provided
      if (adData.images?.create) {
        adData.images.create.forEach((img: any) => {
          this.image.create({ ...img, adId: ad.id });
        });
      }
      
      // Include relations if requested
      if (params.include) {
        if (params.include.images) {
          ad.images = this.findMany('images', { adId: ad.id });
        }
        if (params.include.user) {
          const user = this.findById('users', ad.userId);
          // Apply select if specified
          if (params.include.user.select && user) {
            const selected: any = {};
            Object.keys(params.include.user.select).forEach(key => {
              if (params.include.user.select[key]) selected[key] = user[key];
            });
            ad.user = selected;
          } else {
            ad.user = user;
          }
        }
        if (params.include.features) {
          ad.features = this.findMany('carFeatures', { adId: ad.id });
        }
      }
      
      return ad;
    },
    findMany: (filter?: any) => {
      let ads = this.findMany('ads', filter?.where);

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
        ads = ads.slice(skip, skip + take);
      }

      // Include relations
      if (filter?.include) {
        ads = ads.map((ad: any) => {
          const adCopy = { ...ad };
          
          if (filter.include.images) {
            let images = this.findMany('images', { adId: ad.id });
            
            // Apply images orderBy if specified
            if (filter.include.images.orderBy) {
              const orderKey = Object.keys(filter.include.images.orderBy)[0];
              const orderDir = filter.include.images.orderBy[orderKey];
              images.sort((a: any, b: any) => {
                if (orderDir === 'desc') return b[orderKey] > a[orderKey] ? 1 : -1;
                return a[orderKey] > b[orderKey] ? 1 : -1;
              });
            }
            
            // Apply images take if specified
            if (filter.include.images.take) {
              images = images.slice(0, filter.include.images.take);
            }
            
            adCopy.images = images;
          }
          
          if (filter.include.user) {
            const user = this.findById('users', ad.userId);
            // Apply select if specified
            if (filter.include.user.select && user) {
              const selected: any = {};
              Object.keys(filter.include.user.select).forEach(key => {
                if (filter.include.user.select[key]) selected[key] = user[key];
              });
              adCopy.user = selected;
            } else {
              adCopy.user = user;
            }
          }
          
          if (filter.include.features) {
            adCopy.features = this.findMany('carFeatures', { adId: ad.id });
          }
          
          return adCopy;
        });
      }

      return ads;
    },
    findUnique: (filter: { where: any; include?: any }) => {
      const ad = this.findOne('ads', filter.where);
      if (!ad) return null;

      // Include relations
      if (filter.include) {
        if (filter.include.images) {
          let images = this.findMany('images', { adId: ad.id });
          
          // Apply images orderBy if specified
          if (filter.include.images.orderBy) {
            const orderKey = Object.keys(filter.include.images.orderBy)[0];
            const orderDir = filter.include.images.orderBy[orderKey];
            images.sort((a: any, b: any) => {
              if (orderDir === 'desc') return b[orderKey] > a[orderKey] ? 1 : -1;
              return a[orderKey] > b[orderKey] ? 1 : -1;
            });
          }
          
          ad.images = images;
        }
        
        if (filter.include.user) {
          const user = this.findById('users', ad.userId);
          // Apply select if specified
          if (filter.include.user.select && user) {
            const selected: any = {};
            Object.keys(filter.include.user.select).forEach(key => {
              if (filter.include.user.select[key]) selected[key] = user[key];
            });
            ad.user = selected;
          } else {
            ad.user = user;
          }
        }
        
        if (filter.include.features) {
          ad.features = this.findMany('carFeatures', { adId: ad.id });
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
    findUnique: (filter: { where: any }) => this.findOne('images', filter.where),
    findFirst: (filter: { where: any; orderBy?: any }) => {
      const images = this.findMany('images', filter.where);
      if (filter.orderBy && images.length > 0) {
        const orderKey = Object.keys(filter.orderBy)[0];
        const orderDir = filter.orderBy[orderKey];
        images.sort((a: any, b: any) => {
          if (orderDir === 'desc') return b[orderKey] - a[orderKey];
          return a[orderKey] - b[orderKey];
        });
      }
      return images[0] || null;
    },
    delete: (filter: { where: any }) => {
      const image = this.findOne('images', filter.where);
      return image ? this.delete('images', image.id) : null;
    },
    count: (filter?: any) => {
      return this.findMany('images', filter?.where).length;
    },
    updateMany: (params: { where: any; data: any }) => {
      const images = this.findMany('images', params.where);
      images.forEach((img: any) => {
        this.update('images', img.id, params.data);
      });
      return { count: images.length };
    },
  };

  // SavedAd operations
  savedAd = {
    create: (data: any) => this.create('savedAds', data),
    findMany: (filter?: any) => {
      const savedAds = this.findMany('savedAds', filter?.where);

      // Include ad details if requested
      if (filter?.include?.ad) {
        return savedAds.map((sa) => ({
          ...sa,
          ad: this.ad.findUnique({
            where: { id: sa.adId },
            include: filter.include.ad,
          }),
        }));
      }

      return savedAds;
    },
    findFirst: (filter: { where: any }) =>
      this.findOne('savedAds', filter.where),
    findUnique: (filter: { where: any }) =>
      this.findOne('savedAds', filter.where),
    delete: (filter: { where: any }) => {
      const savedAd = this.findOne('savedAds', filter.where);
      return savedAd ? this.delete('savedAds', savedAd.id) : null;
    },
    count: (filter?: any) => {
      return this.findMany('savedAds', filter?.where).length;
    },
    deleteMany: (filter: any) => this.deleteMany('savedAds', filter),
  };

  // Review operations
  review = {
    create: (data: any) => this.create('reviews', data),
    findMany: (filter?: any) => this.findMany('reviews', filter?.where),
    findFirst: (filter: { where: any }) =>
      this.findOne('reviews', filter.where),
    upsert: (params: { where: any; create: any; update: any }) => {
      const existing = this.findOne('reviews', params.where);
      if (existing) {
        return this.update('reviews', existing.id, params.update);
      }
      return this.create('reviews', params.create);
    },
    aggregate: (options: { where?: any; _avg?: any; _count?: any }) => {
      const items = options.where
        ? this.findMany('reviews', options.where)
        : this.db.reviews;

      const result: any = {};

      if (options._avg) {
        result._avg = {};
        for (const field of Object.keys(options._avg)) {
          const values = items
            .map((item: any) => item[field])
            .filter((val: any) => typeof val === 'number');
          result._avg[field] =
            values.length > 0
              ? values.reduce((sum: number, val: number) => sum + val, 0) / values.length
              : null;
        }
      }

      if (options._count) {
        result._count = items.length;
      }

      return result;
    },
    count: () => this.db.reviews.length,
  };

  // ContactSubmission operations
  contactSubmission = {
    create: (data: any) => this.create('contactSubmissions', data),
    findMany: (filter?: any) =>
      this.findMany('contactSubmissions', filter?.where),
    update: (params: { where: any; data: any }) => {
      const submission = this.findOne('contactSubmissions', params.where);
      return submission
        ? this.update('contactSubmissions', submission.id, params.data)
        : null;
    },
    delete: (filter: { where: any }) => {
      const submission = this.findOne('contactSubmissions', filter.where);
      return submission
        ? this.delete('contactSubmissions', submission.id)
        : null;
    },
  };

  // PasswordResetToken operations
  passwordResetToken = {
    create: (data: any) => this.create('passwordResetTokens', data),
    findUnique: (filter: { where: any }) =>
      this.findOne('passwordResetTokens', filter.where),
    findFirst: (filter: { where: any }) =>
      this.findOne('passwordResetTokens', filter.where),
    deleteMany: (filter: any) => this.deleteMany('passwordResetTokens', filter),
    update: (params: { where: any; data: any }) => {
      const token = this.findOne('passwordResetTokens', params.where);
      return token
        ? this.update('passwordResetTokens', token.id, params.data)
        : null;
    },
  };
}
