export async function uploadImage(file: File): Promise<{ url: string }> {
  // TODO(real-keys:storage-supabase-001): Upload to Supabase Storage with SUPABASE_URL + SUPABASE_ANON_KEY / signed uploads + bucket policies.
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "application/octet-stream";
  const base64 = buf.toString("base64");
  return { url: `data:${mime};base64,${base64}` };
}
