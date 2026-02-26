export type ImageUploadProps = {
  accept?: string;
  multiple?: boolean;
  onUploaded: (result: ImageUploadResult) => void;
  uploadUrl: string;
  compressBeforeUpload?: boolean;
  className?: string;
  disabled?: boolean;
};

export type ImageUploadResult = {
  url: string;
  blurHash: string | null;
};

export type UseImageUploadOptions = {
  accept?: string;
  multiple?: boolean;
  onUploaded: (result: ImageUploadResult) => void;
  uploadUrl: string;
  compressBeforeUpload?: boolean;
};
