// src/post/pipes/parse-cursor.pipe.ts (PHIÊN BẢN MỚI)
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { Buffer } from 'buffer';
// Import FeedCursor MỚI từ interface
import { FeedCursor } from '../interface/FeedcurSord.interface';

@Injectable()
export class ParseCursorPipe implements PipeTransform<string | undefined, FeedCursor | undefined> {
  transform(value: string | undefined, metadata: ArgumentMetadata): FeedCursor | undefined {
    if (!value) {
      return undefined;
    }

    try {
      // Giải mã Base64URL -> JSON String
      const decodedJsonString = Buffer.from(value, 'base64url').toString('utf8');
      // Parse JSON String -> Object
      const parsed = JSON.parse(decodedJsonString);

      // Validate cấu trúc và kiểu dữ liệu cơ bản của object MỚI
      if (
        typeof parsed.lastPriorityLevel !== 'number' || // Kiểm tra priority level
        !parsed.lastSortTime || typeof parsed.lastSortTime !== 'string' || // Kiểm tra sort time (dạng chuỗi ISO)
        !parsed.lastId || typeof parsed.lastId !== 'string' // Kiểm tra ID
      ) {
        throw new Error('Invalid cursor structure after decoding (priority, sortTime, id)');
      }

      // Validate và chuyển đổi kiểu dữ liệu
      const lastSortTimeDate = new Date(parsed.lastSortTime); // Chuỗi ISO -> Date
      if (isNaN(lastSortTimeDate.getTime())) {
          throw new Error('Invalid date format for lastSortTime after decoding');
      }

      if (!Types.ObjectId.isValid(parsed.lastId)) {
          throw new Error('Invalid ObjectId format for lastId after decoding');
      }
      const lastIdObject = new Types.ObjectId(parsed.lastId);

      // Trả về đối tượng FeedCursor MỚI
      return {
        lastPriorityLevel: parsed.lastPriorityLevel,
        lastSortTime: lastSortTimeDate,
        lastId: lastIdObject,
      };
    } catch (error) {
      this.logError(error, value);
      throw new BadRequestException(`Invalid cursor format or processing failed: ${error.message}`);
    }
  }

  private logError(error: any, originalValue: string): void {
    console.error(`Error processing cursor: ${error.message}`);
    console.error(`Original cursor value: ${originalValue}`);
    if (error.stack) { console.error(error.stack); }
  }
}