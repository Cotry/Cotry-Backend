require('dotenv').config();
require('dotenv-defaults').config()

const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
const multer = require('multer');
const multerS3 = require('multer-s3');
const bucketName = process.env.IMAGES_AWSBUCKET_NAME;
const region = process.env.IMAGES_AWSBUCKET_REGION;
const accessKeyId = process.env.IMAGES_AWSBUCKET_ACCESSKEY_ID;
const secretAccessKey = process.env.IMAGES_AWSBUCKET_ACCESSKEY_SECRET;
const profile_pic_size_limit = process.env.PROFILE_PIC_SIZE_LIMIT;

var uuid = require('uuid');


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

// downloads a file from s3
function getFileStream(fileKey) {
    return s3.getObject({
        Key: fileKey,
        Bucket: bucketName
    }).createReadStream();
}


const uploadFileV2 = (req, res, next) => {
    const maxSize = profile_pic_size_limit * 1024 * 1024;
    const upload = multer({
        limits: {  fileSize: maxSize  },
        fileFilter: (req, file, cb) => {
                if (
                  file.mimetype == "image/png" ||
                  file.mimetype == "image/jpg" ||
                  file.mimetype == "image/jpeg"
                ) {
                  cb(null, true);
                } else {
                  cb(null, false);
                  return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
                }
              },
        storage: multerS3({
            s3: s3,
            bucket: bucketName,
            metadata: function(req, file, cb) {
                cb(null, { fieldName: file.fieldname })
            },
            key: function(req, file, cb) {
                cb(null, `${ uuid.v4() }`)
            },
        })
    }).single('profile_pic')

    // Custom error handling for multer
    upload(req, res, (error) => {
        if (error instanceof multer.MulterError){
             return res.status(400).json({
                            message: 'Upload unsuccessful',
                            errorMessage: error.message,
                            errorCode: error.code
                        })
        }
        if (error)
            return res.status(500).json({
                message: 'Error occured',
                errorMessage: error.message
            })
        console.log('Upload successful.')

        return res.send({ image_path: `/api/users/images/${res.req.file.key}` });
    })
}

exports.uploadFileV2= uploadFileV2;
exports.uploadFile = uploadFile;
exports.getFileStream = getFileStream;