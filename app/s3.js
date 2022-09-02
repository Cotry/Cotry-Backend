require('dotenv').config();

const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');

const bucketName = process.env.IMAGES_AWSBUCKET_NAME;
const region = process.env.IMAGES_AWSBUCKET_REGION;
const accessKeyId = process.env.IMAGES_AWSBUCKET_ACCESSKEY_ID;
const secretAccessKey = process.env.IMAGES_AWSBUCKET_ACCESSKEY_SECRET;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
});

// uploads a file to s3;
function uploadFile(file) {
    const fileStream = fs.createReadStream(file.path);

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    };

    return s3.upload(uploadParams).promise();
}
exports.uploadFile = uploadFile;


// downloads a file from s3
function getFileStream(fileKey) {
    return s3.getObject({
        Key: fileKey,
        Bucket: bucketName
    }).createReadStream();
}
exports.getFileStream = getFileStream;