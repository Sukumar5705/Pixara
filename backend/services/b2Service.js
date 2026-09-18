const {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const b2Client = require("../config/b2");

const BUCKET = process.env.B2_BUCKET_NAME;

/**
 * Generate a presigned URL for uploading a photo
 */
const generateSignedUploadUrl = async (originalName, contentType) => {
    const extension = originalName.split(".").pop();
    const storageKey = `photos/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: storageKey,
        ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(b2Client, command, {
        expiresIn: 15 * 60, // 15 minutes
    });

    return {
        uploadUrl,
        storageKey,
    };
};

/**
 * Generate a presigned URL for viewing/downloading a photo
 */
const generateSignedReadUrl = async (storageKey) => {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: storageKey,
    });

    const url = await getSignedUrl(b2Client, command, {
        expiresIn: 60 * 60, // 1 hour
    });

    return url;
};

/**
 * Upload a raw Buffer directly to B2 (used by the server-side proxy route
 * to avoid browser CORS restrictions on presigned PUT URLs).
 */
const uploadBuffer = async (originalName, buffer, contentType) => {
    const extension = (originalName.split(".").pop() || "bin").toLowerCase();
    const storageKey = `photos/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: storageKey,
        Body: buffer,
        ContentType: contentType || "application/octet-stream",
        ContentLength: buffer.length,
    });

    await b2Client.send(command);

    return { storageKey };
};

/**
 * Delete a file from Backblaze B2
 */
const deleteFile = async (storageKey) => {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: storageKey,
    });

    await b2Client.send(command);
};

module.exports = {
    generateSignedUploadUrl,
    generateSignedReadUrl,
    uploadBuffer,
    deleteFile,
};