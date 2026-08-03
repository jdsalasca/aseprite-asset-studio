const SUPPORTED_EXTENSIONS = [".png", ".gif", ".webp", ".ase", ".aseprite"] as const;
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function validateAssetFile(file: Pick<File, "name" | "size">): string | null {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(extension as typeof SUPPORTED_EXTENSIONS[number])) return "Formato no soportado. Usa PNG, GIF, WebP o Aseprite.";
  if (file.size > MAX_UPLOAD_BYTES) return "El asset supera el límite de 25 MB.";
  return null;
}
