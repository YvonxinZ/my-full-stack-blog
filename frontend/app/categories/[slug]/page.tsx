// --- 基础导入 ---
import siteMetadata from '@/data/siteMetadata';
import ListLayout from '@/layouts/ListLayoutWithTags'; // 复用同一个布局
import { genPageMetadata } from 'app/seo';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// --- 2. API 函数和类型导入 ---
import { getAllCategories, getPostsByCategory } from '@/lib/data';
import type { DjangoPost, DjangoCategory } from '@/lib/data';

const POSTS_PER_PAGE = 5;

// --- 3. generateMetadata - 使用 category slug ---
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const categorySlug = decodeURI(params.slug);

  // (推荐优化: 调用 API 获取 category.name)
  // const category = await getCategoryBySlug(categorySlug);
  // const title = category ? category.name : categorySlug;
  const title = categorySlug; // 暂时用 slug

  return genPageMetadata({
    title: `Category: ${title}`, // 更新标题
    description: `${siteMetadata.title} posts categorized under ${title}`,
  });
}

// --- 4. generateStaticParams - 使用 API 获取所有 categories ---
export const generateStaticParams = async () => {
  const categories: DjangoCategory[] = await getAllCategories();
  return categories.map((category) => ({
    slug: encodeURI(category.slug),
  }));
};

// --- 5. Page 组件 - 获取 category slug 并调用 getPostsByCategory ---
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { page?: string };
}) {
  const categorySlug = decodeURI(params.slug);
  // (同样，推荐用 API 获取 category.name 来生成更友好的标题)
  const title = categorySlug[0].toUpperCase() + categorySlug.slice(1);

  // --- a. 使用 getPostsByCategory 获取过滤后的文章 ---
  const filteredPosts: DjangoPost[] = await getPostsByCategory(categorySlug);

  // --- b. 分页逻辑 (保持不变) ---
  const pageNumber = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);

  // 404 检查
  if (pageNumber < 1 || pageNumber > totalPages || (totalPages > 0 && isNaN(pageNumber))) {
    return notFound();
  }

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
      title={`Category: ${title}`} // 更新标题
    />
  );
}
