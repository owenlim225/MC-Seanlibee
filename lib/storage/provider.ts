export type UploadResult = { url: string };

export type StorageAdapter = {
  uploadImage(file: File): Promise<UploadResult>;
};

export type StorageProviderName = "mock" | "supabase-shadow";

const adapters = new Map<StorageProviderName, StorageAdapter>();

export function registerStorageAdapter(name: StorageProviderName, adapter: StorageAdapter): void {
  adapters.set(name, adapter);
}

export function getStorageProviderName(): StorageProviderName {
  return process.env.STORAGE_PROVIDER === "supabase-shadow" ? "supabase-shadow" : "mock";
}

export function getStorageAdapter(): StorageAdapter {
  const selected = adapters.get(getStorageProviderName());
  const fallback = adapters.get("mock");
  if (selected) return selected;
  if (fallback) return fallback;
  throw new Error("Storage adapter not registered");
}
