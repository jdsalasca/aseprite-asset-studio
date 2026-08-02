import type { AsepriteDetection } from "../domain/aseprite.js";
export interface AsepriteDiscoveryPort { detect(preferredPath?: string): Promise<AsepriteDetection>; }
