type BarcodeFormat =
  | "qr_code"
  | "code_128"
  | "code_39"
  | "ean_13"
  | "ean_8";

type DetectedBarcode = {
  rawValue?: string;
};

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: BarcodeFormat[] }) => {
      detect: (source: ImageBitmapSource) => Promise<DetectedBarcode[]>;
    };
  }
}

export {};
