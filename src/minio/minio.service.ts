import { Client } from "minio";

export class MinioService {
  private minioClient: Client;
  private static instance: MinioService;

  private constructor() {
    try {
      this.minioClient = new Client({
        endPoint: process.env.MINIO_HOST ?? "localhost",
        port: Number(process.env.MINIO_PORT) || 9000,
        accessKey: process.env.MINIO_USER ?? "minio",
        secretKey: process.env.MINIO_PASSWORD ?? "secret",
        useSSL: false,
      });
      console.log("Connected to MinIO");
    } catch (error) {
      console.error("Error creating MinIO client: ", error);
    }
  }

  public static getInstance(): MinioService {
    if (!MinioService.instance) {
      MinioService.instance = new MinioService();
    }

    return MinioService.instance;
  }

  public async createBucket(bucketName: string): Promise<void> {
    await this.minioClient.makeBucket(bucketName, "us-east-1");
  }

  public async bucketExists(bucketName: string): Promise<boolean> {
    return await this.minioClient.bucketExists(bucketName);
  }

  public async deleteBucket(bucketName: string): Promise<void> {
    await this.minioClient.removeBucket(bucketName);
  }

  public async setBucketPublicAccess(
    bucketName: string,
    publicAccess: boolean
  ): Promise<void> {
    const policy = JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Action: ["s3:GetObject"],
          Effect: "Allow",
          Principal: "*",
          Resource: `arn:aws:s3:::${bucketName}/*`,
        },
      ],
    });
    await this.minioClient.setBucketPolicy(
      bucketName,
      publicAccess ? policy : ""
    );
  }

  public async saveFile(
    bucketName: string,
    fileName: string,
    file: Express.Multer.File | Buffer
  ): Promise<void> {
    if (file instanceof Buffer) {
      await this.minioClient.putObject(bucketName, fileName, file);
    } else {
      await this.minioClient.putObject(bucketName, fileName, file.buffer);
    }
  }

  public async getFile(bucketName: string, fileName: string): Promise<Buffer> {
    const dataStream = await this.minioClient.getObject(bucketName, fileName);
    const file = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      dataStream.on("data", (chunk) => chunks.push(chunk));
      dataStream.on("end", () => resolve(Buffer.concat(chunks)));
      dataStream.on("error", (err) => reject(err));
    });
    return file;
  }

  public async fileExists(
    bucketName: string,
    fileName: string
  ): Promise<boolean> {
    const objectStat = await this.minioClient.statObject(bucketName, fileName);
    return !!objectStat;
  }

  public async deleteFile(bucketName: string, fileName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, fileName);
  }
}
