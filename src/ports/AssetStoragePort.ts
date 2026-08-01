import type { AssetContent, StoredAsset } from "../domain/contracts.js";

export interface AssetStoragePort {
  store(filename: string, data: Uint8Array): Promise<StoredAsset>;
  read(path: string): Promise<AssetContent>;
}
