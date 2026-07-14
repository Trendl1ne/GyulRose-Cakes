import { z } from "zod";

export const categories = ["birthday", "children-themed", "celebration", "corporate"] as const;

export const cakeSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  title: z.string().trim().min(3).max(100),
  category: z.enum(categories),
  image: z.string().startsWith("/images/cakes/"),
  imageAlt: z.string().trim().min(8).max(180),
  flavour: z.string().trim().min(2).max(120),
  description: z.string().trim().min(30).max(350),
  ingredients: z.string().trim().min(5).max(500),
  priceFrom: z.number().nonnegative().max(5000),
  featured: z.boolean().default(false),
  published: z.boolean().default(true)
});

export type Cake = z.infer<typeof cakeSchema>;

export function slugify(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}
