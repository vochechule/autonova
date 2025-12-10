// Local file storage replacement for Supabase
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export class LocalStorageService {
  static async uploadFile(file: Buffer, filename: string): Promise<string> {
    const fileExt = path.extname(filename);
    const uniqueFilename = `${uuidv4()}${fileExt}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    
    fs.writeFileSync(filePath, file);
    
    // Return URL path that will be served by Express
    return `/uploads/${uniqueFilename}`;
  }

  static async deleteFile(fileUrl: string): Promise<void> {
    try {
      const filename = path.basename(fileUrl);
      const filePath = path.join(UPLOADS_DIR, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  static async deleteFiles(fileUrls: string[]): Promise<void> {
    for (const url of fileUrls) {
      await this.deleteFile(url);
    }
  }
}
