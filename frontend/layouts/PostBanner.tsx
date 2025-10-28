import { ReactNode } from 'react';
import type { DjangoPost } from '@/lib/data'; // Adjust path if needed
import Image from '@/components/Image';
import Bleed from 'pliny/ui/Bleed';
import Comments from '@/components/Comments';
import Link from '@/components/Link';
import PageTitle from '@/components/PageTitle';
import SectionContainer from '@/components/SectionContainer';
import siteMetadata from '@/data/siteMetadata';
import ScrollTopAndComment from '@/components/ScrollTopAndComment';

interface LayoutProps {
  content: DjangoPost; // <-- Use DjangoPost
  children: ReactNode;
  next?: DjangoPost | null; // <-- Also DjangoPost
  prev?: DjangoPost | null; // <-- Also DjangoPost
}

// --- 5. Update Component Function Signature ---
export default function PostMinimal({ content, next, prev, children }: LayoutProps) {
  // --- 6. Fix Destructuring ---
  // const { slug, title, images } = content // <-- Old
  const { slug, title } = content; // <-- New (no 'images' yet)

  // --- 7. Handle Image Display ---
  // Since DjangoPost doesn't have 'images', we use the placeholder
  const displayImage = 'https://picsum.photos/seed/picsum/800/400'; // Placeholder

  // --- 8. Define basePath (needed for prev/next links) ---
  const basePath = 'blog'; // Assuming posts are under /blog

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div>
          <div className="space-y-1 pb-10 text-center dark:border-gray-700">
            <div className="w-full">
              <Bleed>
                <div className="relative aspect-[2/1] w-full">
                  {/* Use the displayImage variable */}
                  <Image src={displayImage} alt={title} fill className="object-cover" />
                </div>
              </Bleed>
            </div>
            <div className="relative pt-10">
              {/* 'title' works */}
              <PageTitle>{title}</PageTitle>
            </div>
          </div>
          {/* 'children' (ReactMarkdown) renders here */}
          <div className="prose dark:prose-invert max-w-none py-4">{children}</div>
          {siteMetadata.comments && (
            <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300" id="comment">
              {/* 'slug' works */}
              <Comments slug={slug} />
            </div>
          )}
          <footer>
            <div className="flex flex-col text-sm font-medium sm:flex-row sm:justify-between sm:text-base">
              {/* --- 9. Fix Prev Link --- */}
              {prev &&
                prev.slug && ( // Check for prev.slug
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${basePath}/${prev.slug}`} // <-- Use slug
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Previous post: ${prev.title}`}
                    >
                      &larr; {prev.title}
                    </Link>
                  </div>
                )}
              {/* --- 10. Fix Next Link --- */}
              {next &&
                next.slug && ( // Check for next.slug
                  <div className="pt-4 xl:pt-8">
                    <Link
                      href={`/${basePath}/${next.slug}`} // <-- Use slug
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                      aria-label={`Next post: ${next.title}`}
                    >
                      {next.title} &rarr;
                    </Link>
                  </div>
                )}
            </div>
          </footer>
        </div>
      </article>
    </SectionContainer>
  );
}
