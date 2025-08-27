export interface ManifestItem {
  file?: string;
  css?: string[];
  isEntry?: boolean;
}

export interface Manifest {
  [key: string]: ManifestItem;
}