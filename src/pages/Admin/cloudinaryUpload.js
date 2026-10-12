import axios from 'axios';

export const uploadToCloudinary = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const assetFolder = import.meta.env.VITE_CLOUDINARY_ASSET_FOLDER;

  const data = new FormData();
  data.append("file", file);
  if (uploadPreset) data.append("upload_preset", uploadPreset);
  if (assetFolder) data.append("folder", assetFolder);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    data
  );

  return res.data.secure_url;
};
