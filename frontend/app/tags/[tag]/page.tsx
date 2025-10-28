// app/tags/[tag]/page.tsx

// --- 1. (Clean up) Imports ---
// (Removed contentlayer, tagData, github-slugger)
import siteMetadata from '@/data/siteMetadata';
import ListLayout from '@/layouts/ListLayoutWithTags'; // Keep the layout
import { genPageMetadata } from 'app/seo';
import { Metadata } from 'next';
import { notFound } from 'next/navigation'; // Keep for 404

// --- 2. (Import) Our API functions and types ---
import { getAllTags, getPostsByTag } from '@/lib/data'; // Assuming you create getPostsByTag
import type { DjangoPost, DjangoTag } from '@/lib/data'; // Import both types

const POSTS_PER_PAGE = 5;

// --- 3. (Modify) generateMetadata ---
// (We can keep this mostly the same, it uses the tag slug)
export async function generateMetadata({
  params,
}: {
  params: { tag: string }; // Params type is simpler now
}): Promise<Metadata> {
  const tag = decodeURI(params.tag);
  return genPageMetadata({
    title: tag,
    description: `${siteMetadata.title} ${tag} tagged content`,
    alternates: {
      canonical: './',
      types: {
        'application/rss+xml': `${siteMetadata.siteUrl}/tags/${tag}/feed.xml`,
      },
    },
  });
}

// --- 4. (Modify) generateStaticParams - Use API data ---
export const generateStaticParams = async () => {
  // const tagKeys = Object.keys(tagData as Record<string, number>) // <-- Old

  // ↓↓↓ New: Fetch tags from API ↓↓↓
  const tags: DjangoTag[] = await getAllTags();
  // ↑↑↑ End New ↑↑↑

  // Return paths based on API slugs
  return tags.map((tag) => ({
    // Use encodeURI just in case the slug needs encoding, although our Django slugs should be safe
    tag: encodeURI(tag.slug),
  }));
};

// --- 5. (Modify) The Page Component ---
export default async function TagPage({
  params,
  searchParams, // Add searchParams for pagination
}: {
  params: { tag: string };
  searchParams?: { page?: string }; // Optional page query param
}) {
  const tagSlug = decodeURI(params.tag);
  // Format title (can keep this logic)
  const title = tagSlug[0].toUpperCase() + tagSlug.split(' ').join('-').slice(1);

  // --- a. (Replace) Fetch filtered posts using API ---
  // const filteredPosts = allCoreContent(
  //   sortPosts(allBlogs.filter((post) => post.tags && post.tags.map((t) => slug(t)).includes(tag)))
  // ) // <-- Old

  // ↓↓↓ New: Fetch posts filtered by tag slug from Django ↓↓↓
  const filteredPosts: DjangoPost[] = await getPostsByTag(tagSlug);
  // ↑↑↑ End New ↑↑↑

  // --- b. (Keep) Pagination logic remains the same ---
  const pageNumber = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  // 404 check (keep this)
  if (pageNumber < 1 || pageNumber > totalPages || (totalPages > 0 && isNaN(pageNumber))) {
    return notFound();
  }

  const initialDisplayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  );
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  };

  // --- c. (Keep) Render the layout ---
  return (
    <ListLayout
      posts={filteredPosts} // Pass all filtered posts (for tag counts in layout)
      initialDisplayPosts={initialDisplayPosts} // Pass current page's posts
      pagination={pagination}
      title={title} // Pass the generated title
    />
  );
}
