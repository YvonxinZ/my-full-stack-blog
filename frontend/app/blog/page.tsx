import { getAllPosts_OnlyBlog } from '@/lib/data';
import type { DjangoPost } from '@/lib/data';
import { genPageMetadata } from 'app/seo';
import ListLayout from '@/layouts/ListLayoutWithTags';

const POSTS_PER_PAGE = 5;

export const metadata = genPageMetadata({ title: 'Blog' });

// --- 更新 props 类型定义，使其更清晰 ---
export default async function BlogPage(props: { searchParams?: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const posts: DjangoPost[] = await getAllPosts_OnlyBlog(); //

  // --- 下面的所有分页逻辑都完美复用 ---
  // 它会正确地从 URL (例如 ?page=2) 中读取页码
  const pageNumber = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  // 计算当前页应该显示的文章
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  );

  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  };

  // --- 将数据传递给布局组件 ---
  return (
    <ListLayout
      posts={posts} // <-- 传入 *所有* posts
      initialDisplayPosts={initialDisplayPosts} // <-- 传入 *当前页* 的 posts
      pagination={pagination}
      title="All Posts"
    />
  );
}
