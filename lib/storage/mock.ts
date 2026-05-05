import { getStorageAdapter, registerStorageAdapter, type UploadResult } from "@/lib/storage/provider";

async function mockUploadImage(file: File): Promise<UploadResult> {
  // TODO(real-keys:storage-supabase-001): Upload to Supabase Storage with SUPABASE_URL + SUPABASE_ANON_KEY / signed uploads + bucket policies.
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "application/octet-stream";
  const base64 = buf.toString("base64");
  return { url: `data:${mime};base64,${base64}` };
}

registerStorageAdapter("mock", {
  uploadImage: mockUploadImage,
});

registerStorageAdapter("supabase-shadow", {
  // N.3 shadow mode scaffold: preserve current data URL behavior while toggled.
  uploadImage: mockUploadImage,
});

export async function uploadImage(file: File): Promise<UploadResult> {
  return getStorageAdapter().uploadImage(file);
}
