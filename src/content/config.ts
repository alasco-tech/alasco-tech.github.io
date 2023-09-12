import { defineCollection, reference, z } from "astro:content";

const blog = defineCollection({
  schema: ({ image }) =>
    z.object({
      authors: z.array(reference("author")),
      date: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val)),
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string(),
      thumbnail: image(),
      thumbnailSrc: z.string().optional(),
      tag: z.string().optional(),
      teaseralt: z.string().optional(),
    }),
});

const author = defineCollection({
  type: "data",
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      title: z.string().optional(),
      image: image(),
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
    }),
});

export const collections = { blog, author };
