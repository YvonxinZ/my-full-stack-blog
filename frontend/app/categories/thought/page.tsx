// --- 1. Imports ---
// (和 app/blog/page.tsx 类似，但导入不同的数据获取函数)
import { getPostsByCategory } from '@/lib/data'; // <-- 获取特定分类的文章
import type { DjangoPost } from '@/lib/data';
import { genPageMetadata } from 'app/seo';
import ListLayout from '@/layouts/ListLayoutWithTags'; // <-- 复用带 Tag 侧边栏的布局
import siteMetadata from '@/data/siteMetadata'; // (如果 ListLayout 需要)

const POSTS_PER_PAGE = 5;
const CATEGORY_SLUG = 'thoughts'; // <-- 定义我们要过滤的分类 slug

// --- 2. Metadata ---
export const metadata = genPageMetadata({
  title: 'Thoughts', // <-- 更新标题
  description: 'Reflections on reading and life.', // <-- 更新描述
});

// --- 3. Page Component ---
export default async function ThoughtPage({ searchParams }: { searchParams?: { page?: string } }) {
  // --- a. 获取 'thoughts' 分类的文章 ---
  const posts: DjangoPost[] = await getPostsByCategory(CATEGORY_SLUG);

  // --- b. 分页逻辑 (保持不变，作用于过滤后的 posts) ---
  const pageNumber = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  );
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  };

  // --- c. 渲染布局 ---
  // 将 *只包含 'thoughts' 文章* 的 posts 数组传递给 ListLayout
  // ListLayout 内部的 Tag 计算逻辑会自动只统计这些文章的 Tags
  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="Thoughts" // <-- 更新标题
    />
  );
}
