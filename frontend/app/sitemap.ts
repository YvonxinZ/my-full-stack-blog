import { getAllPosts, getAllTags, getAllCategories /*, getAllAuthors */ } from '@/lib/data';
import type { DjangoPost, DjangoTag, DjangoCategory /*, DjangoAuthor */ } from '@/lib/data';
import siteMetadata from '@/data/siteMetadata'; // Keep siteMetadata

export default async function sitemap(): Promise<
  // Use Promise<MetadataRoute.Sitemap> if using newer Next.js types
  { url: string; lastModified?: string | Date }[]
> {
  const siteUrl = siteMetadata.siteUrl;

  // --- 3. Fetch data from APIs ---
  const posts: DjangoPost[] = await getAllPosts();
  const tags: DjangoTag[] = await getAllTags();
  const categories: DjangoCategory[] = await getAllCategories();
  // const authors: DjangoAuthor[] = await getAllAuthors(); // <-- If you implement an author API

  // --- a. Blog post URLs ---
  const postRoutes = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.created_at,
  }));

  // --- b. Tag URLs ---
  const tagRoutes = tags.map((tag) => ({
    url: `${siteUrl}/tags/${tag.slug}`,
    // Tags usually don't have a lastModified date, omit it or use site build time
  }));

  // --- c. Category URLs ---
  const categoryRoutes = categories.map((category) => ({
    url: `${siteUrl}/category/${category.slug}`,
    // Categories usually don't have a lastModified date
  }));

  // --- d. (Optional) Author URLs ---
  // const authorRoutes = authors.map((author) => ({
  //   url: `${siteUrl}/about`, // Assuming your about page shows the main author
  //   // Or if you create dynamic author pages: `${siteUrl}/author/${author.slug}`
  // }));

  // --- 4. Static page URLs (Keep these) ---
  const routes = [
    '',
    'blog',
    'projects',
    'tags',
    'about',
    'categories' /* Add 'moment', 'thought' if they are separate pages */,
  ].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: new Date().toISOString().split('T')[0], // Use current date for static pages
  }));

  // --- 5. Combine all routes ---
  return [
    ...routes,
    ...postRoutes,
    ...tagRoutes,
    ...categoryRoutes,
    // ...authorRoutes
  ];
}
