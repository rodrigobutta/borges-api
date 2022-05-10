import { Readable } from 'stream';

// Copy from S3
export type FileData = Buffer | Uint8Array | Blob | string | Readable;

export interface StoredFile {
  /**
   * Name to which the object was uploaded.
   */
  name: string;
  /**
   * URL of the uploaded object.
   */
  url: string;
  /**
   * ETag of the uploaded object.
   */
  key: string;
  /**
   * Bucket to which the object was uploaded.
   */
  bucket: string;
}
