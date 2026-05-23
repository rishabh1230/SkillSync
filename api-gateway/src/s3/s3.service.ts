import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName = process.env.AWS_S3_BUCKET_NAME || 'skillsync-images';

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    try {
      // Handle the case where originalname might not have an extension
      const parts = file.originalname.split('.');
      const extension = parts.length > 1 ? parts.pop() : 'bin';
      const uniqueKey = `projects/${uuidv4()}.${extension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Construct public URL
      const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${uniqueKey}`;

      return { url, key: uniqueKey };
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new InternalServerErrorException('Could not upload file to S3');
    }
  }
}
