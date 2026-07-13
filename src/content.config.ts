import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const cakes = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/cakes" }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    category: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    flavour: z.string().default("Made to order"),
    description: z.string(),
    ingredients: z.string().default("Please ask for current ingredient and allergen information."),
    priceFrom: z.number().nonnegative(),
    featured: z.boolean().default(false),
    published: z.boolean().default(true)
  })
});

export const collections = { cakes };
