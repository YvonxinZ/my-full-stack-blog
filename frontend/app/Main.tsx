import Link from '@/components/Link';
import Tag from '@/components/Tag';
import siteMetadata from '@/data/siteMetadata';
import { formatDate } from 'pliny/utils/formatDate';
import NewsletterForm from 'pliny/ui/NewsletterForm';
import type { DjangoPost } from '@/lib/data';
const MAX_DISPLAY = 5;

// --- 2. 修改 Home 函数的 props 类型 ---
export default function Home({ posts }: { posts: DjangoPost[] }) {
  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="...">MY BLOG</h1>
          <p className="...">{siteMetadata.description}</p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, created_at: date, title, summary, tags } = post;
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                        {/* (A) 'date' 变量现在是 'created_at'，formatDate 应该可以处理 ISO 字符串 */}
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          {/* --- (重要) 'tags' 的处理 --- */}
                          <div className="flex flex-wrap">
                            {/* a. 先检查 tags 是否存在且不为空 */}
                            {tags && tags.length > 0
                              ? // b. 如果有标签，就遍历它
                                tags.map((tagText) => (
                                  // c. 为每个标签渲染一个 <Tag> 组件
                                  //    - key={tagText}：使用标签名作为 key
                                  //    - text={tagText}：把标签名传给 text prop
                                  <Tag key={tagText} text={tagText} />
                                ))
                              : // d. (可选) 如果没有标签，可以显示一个占位符或什么都不显示
                                null}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {/* (D) 这里现在显示的是我们动态生成的摘要 */}
                          {summary}
                        </div>
                      </div>
                      <div className="text-base leading-6 font-medium">
                        <Link
                          href={`/blog/${slug}`} // 'slug' 字段匹配，无需修改
                          className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                          aria-label={`Read more: "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
      {/* ... 下方的 "All Posts" 链接和 NewsletterForm 保持不变 ... */}
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  );
}
