const KNOWN_BROKEN_FEATURED_MENU_IMAGE_URLS = new Set<string>([
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/90005/award-winning-chocolate-4-layer-cake.b1667fe724c35e1461aad64bc1f982d3.jpeg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/132713/new-jersey-sloppy-joe-3-pack-serves-9.c5ef8ff07dccdd95de92621c72a831cb.png?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/131532/dark-chocolate-truffle-collection-16-pieces.4109f4f80d9d9ddf81d7b704424245f8.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/133888/choose-your-own-frozen-custard-6-pack.f13e3415fd09547371a184d04166ff77.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/110287/barbeque-sampler-for-4-6.edb4e60564852c9d0227634c31fab279.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/89891/beef-on-weck-sandwich-kit-4-pack.2e34382035f62d683dda73b11cfbe4e7.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/97479/k-m-chocolate-sampler-gift-box.e29912ba4410a090b1659cbe8aa8e2fa.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/89476/chocolate-fudge-cake.1b255e0cd6b684b34d9e8f7c3f0fbb3a.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/134399/cold-brew-concentrate-variety-6-pack.ee2c1ff6e21556a824d07fcd6dc96682.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/136231/Iggys-Del-Lemonade-Mix-Product-1.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/103169/nashville-hot-chicken-family-meal-for-4.43a0ea9ae1b7663ff18d82f4930fa561.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/113814/blue-smoke-baby-back-ribs-backyard-barbecue-chicken-combo.a95a3e632ae324f719738a2a5c1dff6e.png?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/115332/pulled-pork-and-chopped-beef-brisket-combo.402da09e367972eadca0f8f5150bf2d1.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/68615/original-muffuletta-sandwich-2-pack.ee9a97c691374b6866ea5b7083dd46d5.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/133232/original-muffuletta-sandwich-3-pack.2b00693e49ef277bc2b69810709d8fe8.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/90781/choose-your-own-gourmet-breadsticks-16-pack.887e7e2eb8f22d3cd4d89f1a11affd5e.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/116300/savory-bread-assortment-4-pack.3f088d3d463da68582c2ea93a7c1d547.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/131261/chocolate-truffle-cake.289d1e58e4f0ca2dd39568fba9c17e91.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/132426/bread-choose-your-own-4-pack.78f96938f1a3a5bc6a7fefa564bf878c.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/112202/detroit-style-pizza-squares-choose-your-own-3-pack.75f7714d9a81fb455f7400086e4195bf.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/131436/le-big-matt-kit-for-6.1ddae6e382bb3218eeb0fd5247de115a.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/132973/detroit-style-pizza-choose-your-own-3-pack.6b6f4909ffd4066d5471e70eac5c3d89.jpeg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/131846/whole-brisket-sausage-texas-barbecue-bbq-sauce.ffb470cab2f454fd848faa5dddfe65f5.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/106829/6-lou-malnatis-deep-dish-pizzas.f59993181da5d295668c8a6fb856055e.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/106828/4-lou-malnatis-deep-dish-pizzas.8c79eb7506b5752ab3387d8174246b17.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/97981/2-lou-malnatis-deep-dish-pizzas.bf0fe065d251a9cca3925b269d443a27.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/134182/mighty-quinns-bbq-sampler-pack.1bfe4a0665edc565756f5241bf25840e.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/106948/pappys-ribs-and-chicken-dinner-for-8.904cebbd327940da15399e0608dffa55.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/133009/usda-prime-burgers-pack-of-18-8oz-each.274c67f15aa1c0b210dbf51801706670.png?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/108361/korean-fried-chicken-kit-for-4.4c354ab17c40cd78402d4697b1e075e7.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/72343/coal-oven-margherita-pizza-pie-4-pack.c5944293e17b40f2659562179b493a10.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/110984/pork-buns-12-pack.67a379b014b23c7fd944ab48b9e720f6.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/110906/bo-ssam-dinner-for-4.c4a32e8801e2f0283e0565bbe8493149.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/131920/peter-luger-steak-pack-b.9feb0300e6be2dfecfa314f2006a2183.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/99462/mesquite-smoked-peppered-beef-tenderloin.5c314418a1f75c7057eed686e2fad46f.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
  "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/107003/wagyu-filet-mignon-2-pack.5da42476f7d1b7e7cfe58b4d054e6861.jpg?ixlib=react-9.0.2&auto=format&ar=1%3A1",
]);

export type FeaturedCategorySource = {
  id: string;
  slug: string;
  name: string;
  items: { name: string; imageUrl: string | null }[];
};

export type FeaturedCategoryOutput = {
  id: string;
  slug: string;
  name: string;
  thumbnailUrl: string;
};

function normalizeImageCandidate(imageUrl: string | null): string | null {
  if (typeof imageUrl !== "string") return null;
  const normalized = imageUrl.trim();
  if (normalized.length === 0) return null;
  if (!/^https?:\/\//i.test(normalized)) return null;
  return normalized;
}

function isKnownBrokenImageUrl(imageUrl: string): boolean {
  return KNOWN_BROKEN_FEATURED_MENU_IMAGE_URLS.has(imageUrl);
}

function selectCategoryImage(items: { name: string; imageUrl: string | null }[], usedUrls: Set<string>): string | null {
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
  for (const item of sorted) {
    const candidate = normalizeImageCandidate(item.imageUrl);
    if (!candidate) continue;
    if (isKnownBrokenImageUrl(candidate)) continue;
    if (usedUrls.has(candidate)) continue;
    return candidate;
  }
  return null;
}

export function buildFeaturedCategoryRail(
  categories: FeaturedCategorySource[],
): FeaturedCategoryOutput[] {
  const usedUrls = new Set<string>();
  const featured: FeaturedCategoryOutput[] = [];

  for (const category of categories) {
    const selectedImage = selectCategoryImage(category.items, usedUrls);
    if (!selectedImage) continue;
    usedUrls.add(selectedImage);
    featured.push({
      id: category.id,
      slug: category.slug,
      name: category.name,
      thumbnailUrl: selectedImage,
    });
  }

  return featured;
}
