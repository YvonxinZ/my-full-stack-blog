// --- 1. Imports ---
// (和 app/blog/page/[page]/page.tsx 类似)
import siteMetadata from '@/data/siteMetadata';
import ListLayout from '@/layouts/ListLayoutWithTags';
import { genPageMetadata } from 'app/seo';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostsByCategory } from '@/lib/data'; // <-- 导入 getPostsByCategory
import type { DjangoPost } from '@/lib/data';

const POSTS_PER_PAGE = 5;
const CATEGORY_SLUG = 'thoughts'; // <-- 定义分类 slug

// --- 2. generateMetadata (保持不变，只依赖参数) ---
// (但最好更新一下标题/描述)
export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = decodeURI(params.page);
  return genPageMetadata({
    title: `Thoughts - Page ${page}`,
    description: `Reflections on reading and life - Page ${page}`,
  });
}

// --- 3. generateStaticParams ---
// (需要获取 'thoughts' 分类的文章来计算正确的页数)
export const generateStaticParams = async () => {
  const postsForCategory = await getPostsByCategory(CATEGORY_SLUG); // <-- 获取特定分类的文章
  const totalPages = Math.max(1, Math.ceil(postsForCategory.length / POSTS_PER_PAGE)); // <-- 计算页数
  const paths = Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }));

  // 注意：这里我们不需要返回 tag，只需要 page
  return paths;
};

// --- 4. Page Component ---
export default async function ThoughtPaginationPage(props: {
  params: Promise<{ page: string }>; // Props 现在只有 page
}) {
  const params = await props.params;
  const pageNumber = parseInt(params.page as string);
  const title = 'Thoughts'; // 页面标题

  // --- a. 获取 'thoughts' 分类的 *所有* 文章 ---
  const filteredPosts: DjangoPost[] = await getPostsByCategory(CATEGORY_SLUG); // <-- 调用 getPostsByCategory

  // --- b. 分页逻辑 (保持不变) ---
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  // 404 检查
  if (pageNumber <= 0 || pageNumber > totalPages || (totalPages > 0 && isNaN(pageNumber))) {
    return notFound();
  }

  // 计算当前页文章
  const initialDisplayPosts = filteredPosts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  );

  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  };

  // --- c. 渲染布局 ---
  return (
    <ListLayout
      posts={filteredPosts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={title}
    />
  );
}
