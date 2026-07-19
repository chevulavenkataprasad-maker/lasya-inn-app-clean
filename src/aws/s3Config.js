// src/aws/s3Config.js

import AWS from 'aws-sdk';

// ✅ AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION || 'ap-south-1',
  signatureVersion: 'v4'
});

export const S3_BUCKET = process.env.REACT_APP_AWS_S3_BUCKET;

export default s3;