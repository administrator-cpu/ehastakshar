import { Readable } from "stream";
import fs from "fs";
import path from "path";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
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
    this.uploadDir = path.join(process.cwd(), "uploads");
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

export class R2StorageProvider implements IStorageProvider {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    
    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error("R2 storage credentials are missing in environment variables");
    }

    this.s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    
    this.bucketName = process.env.R2_BUCKET_NAME || "ehastakshar";
    this.publicUrl = process.env.R2_PUBLIC_URL || "";
  }

  async upload(fileName: string, mimeType: string, stream: Readable): Promise<string> {
    const uniqueName = `${uuidv4()}-${fileName}`;
    
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: this.bucketName,
        Key: uniqueName,
        Body: stream,
        ContentType: mimeType,
      },
    });

    await upload.done();
    
    return this.publicUrl ? `${this.publicUrl}/${uniqueName}` : uniqueName;
  }

  async download(fileUrl: string): Promise<Readable> {
    // Extract key from the URL if it's a full URL, or use as is
    const key = fileUrl.startsWith(this.publicUrl) 
      ? fileUrl.replace(`${this.publicUrl}/`, "")
      : fileUrl.split("/").pop() || fileUrl;

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    if (!response.Body) {
      throw new Error("File not found in R2");
    }

    return response.Body as Readable;
  }
}

// Factory to get the correct provider based on env
export function getStorageProvider(): IStorageProvider {
  if (process.env.STORAGE_PROVIDER === "R2") {
    return new R2StorageProvider();
  }
  return new LocalStorageProvider();
}
