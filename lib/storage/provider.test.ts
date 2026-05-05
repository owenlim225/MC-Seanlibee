import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getStorageAdapter,
  getStorageProviderName,
  registerStorageAdapter,
  type StorageAdapter,
} from "@/lib/storage/provider";

function createStorageAdapter(url: string): StorageAdapter {
  return {
    uploadImage: vi.fn(async () => ({ url })),
  };
}

describe("storage provider selection", () => {
  afterEach(() => {
    delete process.env.STORAGE_PROVIDER;
  });

  it("defaults to mock provider", () => {
    registerStorageAdapter("mock", createStorageAdapter("data:mock"));
    registerStorageAdapter("supabase-shadow", createStorageAdapter("data:shadow"));

    expect(getStorageProviderName()).toBe("mock");
    expect(getStorageAdapter().uploadImage).toBeDefined();
  });

  it("supports independent shadow toggle", () => {
    registerStorageAdapter("mock", createStorageAdapter("data:mock"));
    const shadow = createStorageAdapter("data:shadow");
    registerStorageAdapter("supabase-shadow", shadow);
    process.env.STORAGE_PROVIDER = "supabase-shadow";

    expect(getStorageProviderName()).toBe("supabase-shadow");
    expect(getStorageAdapter()).toBe(shadow);
  });
});
