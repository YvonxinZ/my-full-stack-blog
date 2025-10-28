// --- 1. (清理) 移除了 contentlayer 的导入 ---
import { ReactNode } from 'react';

// --- 2. (导入) 导入我们自己的类型 ---
import type { DjangoPost } from '@/lib/data';

// --- 3. (导入) 保持所有 UI 组件不变 ---
import Comments from '@/components/Comments';
import Link from '@/components/Link';
import PageTitle from '@/components/PageTitle';
import SectionContainer from '@/components/SectionContainer';
import Image from '@/components/Image';
import Tag from '@/components/Tag';
import siteMetadata from '@/data/siteMetadata';
import ScrollTopAndComment from '@/components/ScrollTopAndComment';

// 辅助函数 (discussUrl 已被修改, editUrl 已被移除)
const discussUrl = (path) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`${siteMetadata.siteUrl}/${path}`)}`;

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

// --- 4. (类型修复) 定义我们从 page.tsx 传入的 props 的“新形状” ---
// (这应该与 page.tsx 中 authorDetails 的简化逻辑相匹配)
interface SimpleAuthor {
  name: string;
  avatar?: string;
}

// (重写 LayoutProps 接口)
interface LayoutProps {
  content: DjangoPost; // <-- 使用 DjangoPost
  authorDetails: SimpleAuthor[]; // <-- 使用我们简化的 Author
  next: DjangoPost | null; // <-- Next/Prev 也是 DjangoPost
  prev: DjangoPost | null;
  children: ReactNode; // <-- 'children' 是 ReactMarkdown 的输出
}

// --- 5. (类型修复) PostLayout 函数使用新的 LayoutProps ---
export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  // --- 6. (代码修复) 正确解构 DjangoPost ---
  const { slug, created_at: date, title, tags } = content;
  const basePath = 'blog';

  // --- 7. (功能修复) 为 discussUrl 重新构建 path ---
  const path = `${basePath}/${slug}`;

  return (
    <SectionContainer>
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <header className="pt-6 xl:pb-6">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                    <time dateTime={date}>
                      {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                    </time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
            </div>
          </header>
          <div className="grid-rows-[auto_1fr] divide-y divide-gray-200 pb-8 xl:grid xl:grid-cols-4 xl:gap-x-6 xl:divide-y-0 dark:divide-gray-700">
            <dl className="pt-6 pb-10 xl:border-b xl:border-gray-200 xl:pt-11 xl:dark:border-gray-700">
              <dt className="sr-only">Authors</dt>
              <dd>
                <ul className="flex flex-wrap justify-center gap-4 sm:space-x-12 xl:block xl:space-y-8 xl:space-x-0">
                  {authorDetails.map((author) => (
                    <li className="flex items-center space-x-2" key={author.name}>
                      {author.avatar && (
                        <Image
                          src={author.avatar}
                          width={38}
                          height={38}
                          alt="avatar"
                          className="h-10 w-10 rounded-full"
                        />
                      )}
                      <dl className="text-sm leading-5 font-medium whitespace-nowrap">
                        <dt className="sr-only">Name</dt>
                        <dd className="text-gray-900 dark:text-gray-100">{author.name}</dd>
                        <dt className="sr-only">Twitter</dt>
                        <dd>
                          {/* --- 8. (功能修复) 作者的 twitter 不再可用，改用站点的全局 twitter --- */}
                          {siteMetadata.twitter && (
                            <Link
                              href={siteMetadata.twitter}
                              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              {siteMetadata.twitter
                                .replace('https://twitter.com/', '@')
                                .replace('https://x.com/', '@')}
                            </Link>
                          )}
                        </dd>
                      </dl>
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
            <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0 dark:divide-gray-700">
              {/* 'children' (ReactMarkdown) 会被渲染在这里 */}
              <div className="prose dark:prose-invert max-w-none pt-10 pb-8">{children}</div>

              <div className="pt-6 pb-6 text-sm text-gray-700 dark:text-gray-300">
                <Link href={discussUrl(path)} rel="nofollow">
                  Discuss on Twitter
                </Link>
                {/* --- 9. (功能修复) 删除了 "View on GitHub" 链接，因为它依赖的 filePath 已不存在 --- */}
                {/* {` • `}
                <Link href={editUrl(filePath)}>View on GitHub</Link> */}
              </div>

              {siteMetadata.comments && (
                <div
                  className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300"
                  id="comment"
                >
                  <Comments slug={slug} /> {/* 'slug' 字段匹配，可正常工作 */}
                </div>
              )}
            </div>
            <footer>
              <div className="divide-gray-200 text-sm leading-5 font-medium xl:col-start-1 xl:row-start-2 xl:divide-y dark:divide-gray-700">
                {/* 'tags' 字段匹配 (string[]), 可正常工作 */}
                {tags && (
                  <div className="py-4 xl:py-8">
                    <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                      Tags
                    </h2>
                    <div className="flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                )}
                {(next || prev) && (
                  <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                    {/* --- 10. (功能修复) 修复 'prev' 链接，使用 'slug' --- */}
                    {prev && prev.slug && (
                      <div>
                        <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          Previous Article
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/${basePath}/${prev.slug}`}>{prev.title}</Link>
                        </div>
                      </div>
                    )}
                    {/* --- 11. (功能修复) 修复 'next' 链接，使用 'slug' --- */}
                    {next && next.slug && (
                      <div>
                        <h2 className="text-xs tracking-wide text-gray-500 uppercase dark:text-gray-400">
                          Next Article
                        </h2>
                        <div className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400">
                          <Link href={`/${basePath}/${next.slug}`}>{next.title}</Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-4 xl:pt-8">
                <Link
                  href={`/${basePath}`}
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="Back to the blog"
                >
                  &larr; Back to the blog
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  );
}
