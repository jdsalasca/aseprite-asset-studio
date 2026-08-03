export type AsepriteDetectionSource = "configured" | "environment" | "common_path" | "not_found";
export interface AsepriteDetection { found: boolean; executablePath: string | null; source: AsepriteDetectionSource; candidatesChecked: number; message: string; }
export interface RuntimeDiagnostics { runtime: import("./contracts.js").ToolRuntimeStatus; aseprite: AsepriteDetection; lastError: string | null; restEndpoint: string | null; }
