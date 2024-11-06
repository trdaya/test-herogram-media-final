import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class File extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  s3Key: string;

  @Prop()
  tags: string[];

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ required: true })
  uploadedAt: Date;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;
}

export const FileSchema = SchemaFactory.createForClass(File);
