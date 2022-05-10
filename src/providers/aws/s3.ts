import settings from '../../settings';
import AWS from 'aws-sdk';
import { FileData, StoredFile } from '../../types/file';

const s3 = new AWS.S3({
  accessKeyId: settings.s3.ACCESS_KEY,
  secretAccessKey: settings.s3.ACCESS_SECRET_KEY,
  region: settings.s3.REGION,
});

export const upload = async (data: FileData, name: string, bucket?: string): Promise<StoredFile> => {
  const storeBucket = bucket ? bucket : settings.s3.BUCKET;

  return new Promise((resolve, reject) => {
    const uploadParams: AWS.S3.Types.PutObjectRequest = {
      Bucket: storeBucket,
      Key: name,
      Body: data,
    };

    s3.upload(uploadParams, (err, response) => {
      if (err) {
        reject(err);
      }

      const uploadedFile = response;
      resolve({
        url: uploadedFile.Location,
        name: uploadedFile.Key,
        key: uploadedFile.ETag,
        bucket: uploadedFile.Bucket,
      });
    });
  });
};

export const getObject = async (key: string, bucket?: string) => {
  const fromBucket = bucket ? bucket : settings.s3.BUCKET;

  return new Promise((resolve, reject) => {
    s3.getObject(
      {
        Bucket: fromBucket,
        Key: `"${key}"`,
      },
      (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      },
    );
  });
};
