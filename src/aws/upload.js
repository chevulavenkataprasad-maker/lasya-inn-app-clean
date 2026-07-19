// src/aws/upload.js

import s3, { S3_BUCKET } from './s3Config';

// ============================================
// UPLOAD SINGLE FILE TO S3
// ============================================
export const uploadFileToS3 = async (file, folder = 'rooms') => {
  try {
    console.log('📤 Uploading to AWS S3...');
    console.log('📤 Bucket:', S3_BUCKET);
    console.log('📤 File:', file.name);
    console.log('📤 Folder:', folder);
    
    const fileName = `${folder}/${Date.now()}_${file.name}`;
    
    const params = {
      Bucket: S3_BUCKET,
      Key: fileName,
      Body: file,
      ContentType: file.type
    };

    console.log('📤 Upload params:', params);

    const result = await s3.upload(params).promise();
    console.log('✅ Uploaded to S3:', result.Location);
    return result.Location;
  } catch (error) {
    console.error('❌ S3 Upload Error:', error);
    throw new Error('S3 Upload failed: ' + error.message);
  }
};

// ============================================
// UPLOAD MULTIPLE FILES TO S3
// ============================================
export const uploadMultipleFiles = async (files, folder = 'rooms') => {
  try {
    const uploadPromises = files.map(file => uploadFileToS3(file, folder));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('❌ Multiple upload error:', error);
    throw error;
  }
};

// ============================================
// DELETE FILE FROM S3
// ============================================
export const deleteFileFromS3 = async (fileUrl) => {
  try {
    // Extract key from URL
    const urlParts = fileUrl.split('/');
    const key = urlParts.slice(3).join('/');
    
    const params = {
      Bucket: S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
    console.log('✅ File deleted from S3:', key);
    return true;
  } catch (error) {
    console.error('❌ S3 Delete Error:', error);
    throw error;
  }
};

// ============================================
// DELETE MULTIPLE FILES FROM S3
// ============================================
export const deleteMultipleFiles = async (fileUrls) => {
  try {
    const deletePromises = fileUrls.map(url => deleteFileFromS3(url));
    await Promise.all(deletePromises);
    console.log('✅ All files deleted from S3');
    return true;
  } catch (error) {
    console.error('❌ Multiple delete error:', error);
    throw error;
  }
};

// ============================================
// GET FILE URL FROM S3
// ============================================
export const getFileUrl = (key) => {
  return `https://${S3_BUCKET}.s3.${process.env.REACT_APP_AWS_REGION || 'ap-south-1'}.amazonaws.com/${key}`;
};

// ============================================
// CHECK IF FILE EXISTS
// ============================================
export const fileExists = async (key) => {
  try {
    const params = {
      Bucket: S3_BUCKET,
      Key: key
    };
    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

// ============================================
// GET FILE METADATA
// ============================================
export const getFileMetadata = async (key) => {
  try {
    const params = {
      Bucket: S3_BUCKET,
      Key: key
    };
    const result = await s3.headObject(params).promise();
    return {
      size: result.ContentLength,
      contentType: result.ContentType,
      lastModified: result.LastModified,
      etag: result.ETag
    };
  } catch (error) {
    console.error('❌ Get metadata error:', error);
    throw error;
  }
};

// ============================================
// LIST FILES IN FOLDER
// ============================================
export const listFiles = async (folder = '') => {
  try {
    const params = {
      Bucket: S3_BUCKET,
      Prefix: folder,
      Delimiter: '/'
    };
    const result = await s3.listObjectsV2(params).promise();
    return result.Contents || [];
  } catch (error) {
    console.error('❌ List files error:', error);
    throw error;
  }
};