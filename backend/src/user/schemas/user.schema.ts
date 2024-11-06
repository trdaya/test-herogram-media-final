import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;
}

export type UserDocument = User & Document & { _id: Types.ObjectId };
export const UserSchema = SchemaFactory.createForClass(User);
