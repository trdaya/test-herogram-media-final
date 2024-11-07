import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { File } from './schemas/file.schema';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileService {
  private s3Client: S3Client;

  constructor(
    @InjectModel(File.name) private fileModel: Model<File>,
    private configService: ConfigService
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY'
        ),
      },
    });
  }

  async uploadFile(
    file: MulterFile,
    tags: string[],
    userId: string
  ): Promise<File> {
    const s3Key = `${uuidv4()}_${file.originalname}`;
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const newFile = new this.fileModel({
      filename: file.originalname,
      s3Key,
      tags,
      uploadedAt: new Date(),
      userId: new Types.ObjectId(userId),
    });

    return (await newFile.save()).toObject();
  }

  async getFilesByUser(userId: string): Promise<File[]> {
    return this.fileModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort('-uploadedAt')
      .lean();
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.fileModel.findOne({
      _id: fileId,
      userId: new Types.ObjectId(userId),
    });
    if (file) {
      await this.fileModel.deleteOne({ _id: fileId });
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.configService.get<string>('AWS_S3_BUCKET'),
          Key: file.s3Key,
        })
      );
    }
  }

  async incrementViewCount(fileId: string): Promise<void> {
    await this.fileModel.findByIdAndUpdate(fileId, { $inc: { viewCount: 1 } });
  }

  async getSignedUrl(s3Key: string): Promise<string> {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    return `https://${bucket}.s3.${this.configService.get<string>('AWS_REGION')}.amazonaws.com/${s3Key}`;
  }

  async getFileById(fileId: string): Promise<File | null> {
    return await this.fileModel.findById(fileId).exec();
  }
}
