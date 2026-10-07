export type Product = { id: string; name: string };
export type CatalogProduct = Product & { imageUrl: string | null; priceInCents: number | null };
export const products: Product[] = Array.from({ length: 23 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return { id: "modelo-" + number, name: "Modelo " + number };
});
export const getProduct = (id: string) => products.find((product) => product.id === id);
