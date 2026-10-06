import { Readable } from "stream";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export interface IStorageProvider {
  /**
   * Uploads a file stream and returns the URL or path to access it.
   */
  upload(fileName: string, mimeType: string, stream: Readable): Promise<string>;
  
  /**
   * Retrieves a file as a readable stream.
   */
  download(fileUrl: string): Promise<Readable>;
}

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "pdf");
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(fileName: string, mimeType: string, stream: Readable): Promise<string> {
    const uniqueName = `${uuidv4()}-${fileName}`;
    const filePath = path.join(this.uploadDir, uniqueName);
    
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);
      
      stream.on("error", reject);
      writeStream.on("error", reject);
      writeStream.on("finish", () => resolve(filePath));
    });
  }

  async download(fileUrl: string): Promise<Readable> {
    if (!fs.existsSync(fileUrl)) {
      throw new Error("File not found on local storage");
    }
    return fs.createReadStream(fileUrl);
  }
}

// Factory to get the correct provider based on env
export function getStorageProvider(): IStorageProvider {
  return new LocalStorageProvider();
}
