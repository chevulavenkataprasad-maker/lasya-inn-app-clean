// src/aws/s3Config.js

import AWS from 'aws-sdk';

// ============================================
// AWS S3 CONFIGURATION
// ============================================

// ✅ HARDCODE S3 BUCKET NAME
const S3_BUCKET_NAME = 'lasya-inn-rooms-images';  // ← Hardcoded bucket

// ✅ Get AWS credentials from environment variables
const AWS_ACCESS_KEY_ID = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.REACT_APP_AWS_REGION || 'ap-south-1';

// ✅ Validate credentials
if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.warn('⚠️ AWS credentials not found. S3 uploads will fail.');
  console.warn('⚠️ Please set REACT_APP_AWS_ACCESS_KEY_ID and REACT_APP_AWS_SECRET_ACCESS_KEY');
}

// ✅ Configure AWS SDK
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
  signatureVersion: 'v4'
});

// ✅ Create S3 instance
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
  signatureVersion: 'v4'
});

// ✅ Export bucket name - HARDCODED
export const S3_BUCKET = S3_BUCKET_NAME;  // ← Changed to hardcoded

// ✅ Export S3 instance
export default s3;

// ============================================
// HELPER FUNCTIONS
// ============================================

// ✅ Check if S3 is configured
export const isS3Configured = () => {
  return !!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && S3_BUCKET);
};

// ✅ Get S3 bucket URL
export const getS3BucketUrl = () => {
  return `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;
};

// ✅ Log configuration status
console.log('📦 S3 Configuration Status:');
console.log('📦 Bucket:', S3_BUCKET || '❌ Not set');
console.log('📦 Region:', AWS_REGION);
console.log('📦 Credentials:', AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing');