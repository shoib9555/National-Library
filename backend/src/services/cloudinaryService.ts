import cloudinary from "../config/cloudinary"

export async function uploadProfilePhoto(
  buffer: Buffer,
  studentCode: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "national-library/profile-photos",
        public_id: studentCode,
        resource_type: "image",
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload failed"))
          return
        }

        resolve(result.secure_url)
      }
    )

    uploadStream.end(buffer)
  })
}

export async function uploadLibrarianProfilePhoto(
  buffer: Buffer,
  fileName: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "national-library/librarian-profile",
        public_id: "librarian-profile",
        resource_type: "image",
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload librarian profile photo"));
          return;
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
}