export function normalizeText(input: string): string {
  if (!input) return "";
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents and diacritics
    .toLowerCase();
}

export function slugify(input: string): string {
  if (!input) return "";
  return normalizeText(input)
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except spaces and dashes
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/-+/g, "-"); // Collapse multiple dashes
}

export function categoryToSlug(category: string): string {
  if (!category) return "";
  const normalized = normalizeText(category);
  // Custom mappings for specific category routes
  if (normalized === "shampoo" || normalized === "champu") {
    return "champu";
  }
  return slugify(category);
}
