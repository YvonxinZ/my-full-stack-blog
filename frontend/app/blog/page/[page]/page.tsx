import { notFound } from 'next/navigation';
// --- 数据获取函数和类型 ---
import { getAllPosts } from '@/lib/data';
import type { DjangoPost } from '@/lib/data';
import ListLayout from '@/layouts/ListLayoutWithTags'; // 布局组件保持不变

const POSTS_PER_PAGE = 5;

// --- generateStaticParams 使用 API 数据 ---
export const generateStaticParams = async () => {
  // const totalPages = Math.ceil(allBlogs.length / POSTS_PER_PAGE) // <-- 旧的

  // ↓↓↓ 这是新的 ↓↓↓
  const posts = await getAllPosts(); // <-- 从 Django API 获取
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  // ↑↑↑ 修改结束 ↑↑↑

  const paths = Array.from({ length: totalPages }, (_, i) => ({ page: (i + 1).toString() }));

  return paths;
};

// --- Page 组件的 props 类型 ---
export default async function Page({ params }: { params: { page: string } }) {
  const posts: DjangoPost[] = await getAllPosts(); // <-- 从 Django API 获取
  const pageNumber = parseInt(params.page as string);
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  // 404 检查
  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber)) {
    return notFound();
  }

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
      posts={posts} // 传入 *所有* posts
      initialDisplayPosts={initialDisplayPosts} // 传入 *当前页* 的 posts
      pagination={pagination}
      title="All Posts"
    />
  );
}
