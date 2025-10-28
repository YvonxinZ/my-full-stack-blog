import siteMetadata from '@/data/siteMetadata';
import ListLayout from '@/layouts/ListLayoutWithTags';
import { genPageMetadata } from 'app/seo';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// --- 2. (导入) API 函数和类型 ---
import { getAllTags, getPostsByTag } from '@/lib/data';
import type { DjangoPost, DjangoTag } from '@/lib/data';

const POSTS_PER_PAGE = 5;

// --- 3. (修改) generateMetadata - 保持不变 (它只依赖 tag slug) ---
export async function generateMetadata({
  params,
}: {
  params: { tag: string; page: string }; // Params type now includes page
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

// --- 4. (修改) generateStaticParams - 使用 API 数据 ---
export const generateStaticParams = async () => {
  const tags: DjangoTag[] = await getAllTags(); // a. 获取所有标签
  const paths: { tag: string; page: string }[] = [];

  // b. 对每个标签，计算其页数
  for (const tag of tags) {
    const postsForTag = await getPostsByTag(tag.slug); // c. 获取该标签的文章
    const totalPages = Math.max(1, Math.ceil(postsForTag.length / POSTS_PER_PAGE)); // d. 计算页数

    // e. 为该标签的每一页生成路径
    for (let i = 1; i <= totalPages; i++) {
      paths.push({
        tag: encodeURI(tag.slug),
        page: i.toString(),
      });
    }
  }

  return paths;
};

// --- 5. (修改) Page 组件 - 使用 API 数据和分页 ---
export default async function TagPage({
  params,
}: {
  params: { tag: string; page: string }; // Props 现在包含 tag 和 page
}) {
  const tagSlug = decodeURI(params.tag);
  const pageNumber = parseInt(params.page as string);
  const title = tagSlug[0].toUpperCase() + tagSlug.split(' ').join('-').slice(1);

  // --- a. (替换) 从 API 获取该标签下的 *所有* 文章 ---
  const filteredPosts: DjangoPost[] = await getPostsByTag(tagSlug); // <-- 这是新的！
  // --- 替换结束 ---

  // --- b. (保持不变) 分页逻辑 ---
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  // 404 检查
  if (pageNumber <= 0 || pageNumber > totalPages || (totalPages > 0 && isNaN(pageNumber))) {
    return notFound();
  }

  // 计算当前页应该显示的文章
  const initialDisplayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  );

  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  };

  // --- c. (保持不变) 渲染布局 ---
  return (
    <ListLayout
      posts={filteredPosts} // 传入 *所有* 属于该标签的文章
      initialDisplayPosts={initialDisplayPosts} // 传入 *当前页* 的文章
      pagination={pagination}
      title={title} // 标签标题
    />
  );
}
