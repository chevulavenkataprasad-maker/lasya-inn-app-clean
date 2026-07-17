import AWS from 'aws-sdk';

// ✅ Hardcode your AWS keys here
const AWS_ACCESS_KEY_ID = 'AKIAUQQAIDGZB7FS6AV4';
const AWS_SECRET_ACCESS_KEY = 'oy1Ylhjwj4IcKjPc9/F4h1IFpeokqTkUBmvv4NL4';
const AWS_REGION = 'ap-south-1';
const S3_BUCKET = 'lasya-inn-rooms-images';

const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

export { S3_BUCKET };
export default s3;