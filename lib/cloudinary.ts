import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadResult = {
  url: string;
  publicId: string;
};

function signUpload(opts: { folder: string; uploadPreset?: string }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign: Record<string, string | number | undefined> = {
    timestamp,
    folder: opts.folder,
    upload_preset: opts.uploadPreset,
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET ?? "",
  );

  return { timestamp, signature, api_key: process.env.CLOUDINARY_API_KEY };
}

export async function uploadProofImage(buffer: Buffer): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const signed = signUpload({
      folder: "ghazaltech/proofs",
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET_PROOFS,
    });
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: "ghazaltech/proofs",
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET_PROOFS,
          timestamp: signed.timestamp,
          signature: signed.signature,
          api_key: signed.api_key,
        },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve({ url: result.secure_url!, publicId: result.public_id! });
        },
      )
      .end(buffer);
  });
}

export async function uploadProjectImage(buffer: Buffer): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const signed = signUpload({
      folder: "ghazaltech/projects",
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET_PROJECTS,
    });
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: "ghazaltech/projects",
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET_PROJECTS,
          timestamp: signed.timestamp,
          signature: signed.signature,
          api_key: signed.api_key,
        },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve({ url: result.secure_url!, publicId: result.public_id! });
        },
      )
      .end(buffer);
  });
}

export async function uploadPortfolioImage(buffer: Buffer): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const signed = signUpload({
      folder: "ghazaltech/portfolio",
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET_PORTFOLIO,
    });
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: "ghazaltech/portfolio",
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET_PORTFOLIO,
          timestamp: signed.timestamp,
          signature: signed.signature,
          api_key: signed.api_key,
        },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve({ url: result.secure_url!, publicId: result.public_id! });
        },
      )
      .end(buffer);
  });
}

export async function uploadTemplateImage(buffer: Buffer): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const signed = signUpload({
      folder: "ghazaltech/templates",
      uploadPreset:
        process.env.CLOUDINARY_UPLOAD_PRESET_TEMPLATES ??
        process.env.CLOUDINARY_UPLOAD_PRESET_PROJECTS,
    });
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: "ghazaltech/templates",
          upload_preset:
            process.env.CLOUDINARY_UPLOAD_PRESET_TEMPLATES ??
            process.env.CLOUDINARY_UPLOAD_PRESET_PROJECTS,
          timestamp: signed.timestamp,
          signature: signed.signature,
          api_key: signed.api_key,
        },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve({ url: result.secure_url!, publicId: result.public_id! });
        },
      )
      .end(buffer);
  });
}
