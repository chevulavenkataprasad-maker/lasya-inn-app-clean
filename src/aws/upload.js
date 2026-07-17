import s3, { S3_BUCKET } from './s3Config';

// ✅ Upload to AWS S3 (No ACL)
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
      // ✅ No ACL parameter - Bucket handles permissions
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

// ✅ Upload Multiple Files
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

// ✅ Delete File from S3
export const deleteFileFromS3 = async (fileUrl) => {
  try {
    const key = fileUrl.split('/').pop();
    
    const params = {
      Bucket: S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
    console.log('✅ File deleted from S3');
  } catch (error) {
    console.error('❌ Delete error:', error);
    throw error;
  }
};