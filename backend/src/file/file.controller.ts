import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @Version('1')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Body('tags') tags: string[],
    @Req() req: Request
  ) {
    const userId = req.user._id;
    const uploadedFile = await this.fileService.uploadFile(file, tags, userId);
    return {
      message: 'File uploaded successfully',
      file: {
        _id: uploadedFile._id.toString(),
        filename: uploadedFile.filename,
        tags: uploadedFile.tags,
        viewCount: uploadedFile.viewCount,
        uploadedAt: uploadedFile.uploadedAt,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-files')
  @Version('1')
  async getUserFiles(@Req() req: Request) {
    const userId = req.user._id;
    const files = await this.fileService.getFilesByUser(userId);
    return files.map(file => ({
      _id: file._id.toString(),
      filename: file.filename,
      tags: file.tags,
      viewCount: file.viewCount,
      uploadedAt: file.uploadedAt,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':fileId')
  @Version('1')
  async deleteUserFile(@Param('fileId') fileId: string, @Req() req: Request) {
    const userId = req.user._id;
    await this.fileService.deleteFile(fileId, userId);
    return { message: 'File deleted successfully' };
  }

  @Get('public/:fileId')
  @Version('1')
  async servePublicFile(@Param('fileId') fileId: string, @Res() res: Response) {
    const file = await this.fileService.getFileById(fileId);
    if (file) {
      await this.fileService.incrementViewCount(fileId);
      const url = await this.fileService.getSignedUrl(file.s3Key);
      res.redirect(url);
    } else {
      res.status(404).send('File not found');
    }
  }
}
