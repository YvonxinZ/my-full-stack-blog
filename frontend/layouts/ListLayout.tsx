'use client'; // 这个组件包含 useState，所以必须是客户端组件

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { formatDate } from 'pliny/utils/formatDate';
// --- 导入 DjangoPost 类型 ---
import type { DjangoPost } from '@/lib/data'; // 确保路径正确
import Link from '@/components/Link';
import Tag from '@/components/Tag';
import siteMetadata from '@/data/siteMetadata';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

interface ListLayoutProps {
  posts: DjangoPost[];
  initialDisplayPosts?: DjangoPost[];
  pagination?: PaginationProps;
  title: string;
}

// ... (Pagination 组件保持不变) ...
function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const lastSegment = segments[segments.length - 1];

  const basePath = pathname
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/page\/\d+\/?$/, '') // Remove any trailing /page
    .replace(/\/$/, ''); // Remove trailing slash

  const prevPage = currentPage - 1 > 0;
  const nextPage = currentPage + 1 <= totalPages;

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            Next
          </Link>
        )}
      </nav>
    </div>
  );
}

// --- 5. (修改) ListLayout 函数 ---
export default function ListLayout({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  // <-- 使用更新后的 Props 类型

  // --- a. (保持不变) 搜索状态 ---
  const [searchValue, setSearchValue] = useState('');

  // --- b. (核心修改) 更新过滤逻辑 ---
  const filteredBlogPosts = posts.filter((post) => {
    // 使用 DjangoPost 的字段: title, summary, tags (假设 tags 是 string[])
    const searchContent = (post.title || '') + (post.summary || '') + (post.tags?.join(' ') || '');
    return searchContent.toLowerCase().includes(searchValue.toLowerCase());
  });

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts;

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            {title}
          </h1>
          {/* --- c. (保持不变) 搜索框 --- */}
          <div className="relative max-w-lg">
            <label>
              <span className="sr-only">Search articles</span>
              <input
                aria-label="Search articles"
                type="text"
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search articles"
                className="..." // 样式保持不变
              />
            </label>
            <svg className="..." /* SVG 保持不变 */>{/* ... path ... */}</svg>
          </div>
        </div>
        <ul>
          {!filteredBlogPosts.length && !searchValue && 'No posts found.'}
          {filteredBlogPosts.length === 0 && searchValue && 'No posts found matching your search.'}

          {/* --- d. (核心修改) 更新 map 循环内部 --- */}
          {displayPosts.map((post) => {
            // --- 使用 DjangoPost 的字段 ---
            const {
              slug, // 使用 slug
              created_at: date, // 重命名 created_at
              title,
              summary,
              tags,
            } = post;

            return (
              <li key={slug} className="py-4">
                {' '}
                {/* 使用 slug 或 id 作为 key */}
                <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                  <dl>
                    <dt className="sr-only">Published on</dt>
                    <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                    </dd>
                  </dl>
                  <div className="space-y-3 xl:col-span-3">
                    <div>
                      <h3 className="text-2xl leading-8 font-bold tracking-tight">
                        {/* 使用 slug 构建链接 */}
                        <Link href={`/blog/${slug}`} className="text-gray-900 dark:text-gray-100">
                          {title}
                        </Link>
                      </h3>
                      <div className="flex flex-wrap">
                        {/* 'tags' (string[]) 可以正常工作 */}
                        {tags?.map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                      </div>
                    </div>
                    <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                      {summary}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </>
  );
}
