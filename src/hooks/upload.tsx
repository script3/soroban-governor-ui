import { upload as pin } from "@snapshot-labs/pineapple";
import { useState } from "react";

export function useImageUpload() {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");

  const reset = () => {
    setIsUploadingImage(false);
    setImageUploadError("");
    setImageUrl("");
    setImageName("");
  };

  async function upload(
    file: File | undefined,
    onSuccess: (image: { name: string; url: string }) => void
  ) {
    reset();
    if (!file) return;
    console.log("uploading file");
    setIsUploadingImage(true);
    const formData = new FormData();

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setImageUploadError("unsupportedImageType");
      setIsUploadingImage(false);
      return;
    }
    if (file.size > 1024 * 1024) {
      setImageUploadError("fileTooBig");
      setIsUploadingImage(false);
      return;
    }
    formData.append("file", file);
    try {
      const receipt = await pin(formData, process.env.PINEAPPLE_URL);
      console.log({ receipt });
      const newImageUrl = `ipfs://${receipt.cid}`;
      setImageUrl(newImageUrl);
      setImageName(file.name);
      onSuccess({ name: file.name, url: newImageUrl });
    } catch (err: any) {
      setImageUploadError(err.error?.message || err);
    } finally {
      setIsUploadingImage(false);
    }
  }

  return {
    isUploadingImage,
    imageUploadError,
    image: {
      url: imageUrl,
      name: imageName,
    },
    upload,
  };
}
