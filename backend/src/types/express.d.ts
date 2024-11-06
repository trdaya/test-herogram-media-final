import { UserDocument } from '../users/schemas/user.schema';

declare module 'express' {
  export interface Request {
    user?: {
      _id: string;
    };
    token?: string;
  }
}
