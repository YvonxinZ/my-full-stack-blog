import Link from '@/components/Link';
import Tag from '@/components/Tag';
import { genPageMetadata } from 'app/seo';
import { getAllTags } from '@/lib/data'; // 确保你已经在 lib/data.ts 中创建了这个函数
import type { DjangoTag } from '@/lib/data'; // 确保你导出了 DjangoTag 类型

export const metadata = genPageMetadata({ title: 'Tags', description: 'Things I blog about' });

export default async function Page() {
  // --- a. (替换) 从 API 获取标签 ---
  // const tagCounts = tagData as Record<string, number>
  // const tagKeys = Object.keys(tagCounts)
  // const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  const tags: DjangoTag[] = await getAllTags(); // <-- 这是新的！

  // (可选) 你可以在这里按字母顺序排序
  const sortedTags = tags.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="flex flex-col items-start justify-start divide-y divide-gray-200 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0 dark:divide-gray-700">
        <div className="space-x-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl md:leading-14 dark:text-gray-100">
            Tags
          </h1>
        </div>
        <div className="flex max-w-lg flex-wrap">
          {/* --- b. (修改) 检查新的 tags 数组 --- */}
          {tags.length === 0 && 'No tags found.'}

          {/* --- c. (修改) 遍历从 API 获取的 sortedTags 数组 --- */}
          {sortedTags.map((tag) => {
            return (
              <div key={tag.slug} className="mt-2 mr-5 mb-2">
                {/* --- d. (修改) 使用 tag.name 显示标签文本 --- */}
                <Tag text={tag.name} />

                {/* --- e. (修改) 使用 tag.slug 构建链接 --- */}
                <Link
                  href={`/tags/${tag.slug}`} // <-- 使用 API 提供的 slug
                  className="-ml-2 text-sm font-semibold text-gray-600 uppercase dark:text-gray-300"
                  aria-label={`View posts tagged ${tag.name}`}
                >
                  {/* --- f. (移除) 暂时移除文章计数 --- */}
                  {/* {` (${tagCounts[t]})`} */}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
