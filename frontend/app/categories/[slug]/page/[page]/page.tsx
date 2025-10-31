// app/category/[slug]/page/[page]/page.tsx

// --- 1. 基础导入 ---
import siteMetadata from '@/data/siteMetadata';
import ListLayout from '@/layouts/ListLayoutWithTags'; // 复用布局
import { genPageMetadata } from 'app/seo';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// --- 2. API 函数和类型导入 ---
// (导入 category 相关的函数和类型)
import { getAllCategories, getPostsByCategory } from '@/lib/data';
import type { DjangoPost, DjangoCategory } from '@/lib/data';

const POSTS_PER_PAGE = 5;

// --- 3. generateMetadata - 使用 category slug ---
export async function generateMetadata(props: {
  params: Promise<{ slug: string; page: string }>; // Params 包含 slug 和 page
}): Promise<Metadata> {
  const params = await props.params;
  const categorySlug = decodeURI(params.slug); // 使用 slug
  // (同样，推荐优化: 调用 API 获取 category.name)
  // const category = await getCategoryBySlug(categorySlug);
  // const title = category ? category.name : categorySlug;
  const title = categorySlug; // 暂时用 slug

  return genPageMetadata({
    title: `Category: ${title}`,
    description: `${siteMetadata.title} posts categorized under ${title}`,
  });
}

// --- 4. generateStaticParams - 使用 API 获取所有 categories 及其文章 ---
export const generateStaticParams = async () => {
  const categories: DjangoCategory[] = await getAllCategories(); // a. 获取所有分类
  const paths: { slug: string; page: string }[] = [];

  // b. 对每个分类，计算其页数
  for (const category of categories) {
    const postsForCategory = await getPostsByCategory(category.slug); // c. 获取该分类的文章
    const totalPages = Math.max(1, Math.ceil(postsForCategory.length / POSTS_PER_PAGE)); // d. 计算页数

    // e. 为该分类的每一页生成路径
    for (let i = 1; i <= totalPages; i++) {
      paths.push({
        slug: encodeURI(category.slug), // 使用 category.slug
        page: i.toString(),
      });
    }
  }

  return paths;
};

// --- 5. Page 组件 - 使用 API 数据和分页 ---
export default async function CategoryPage(props: {
  params: Promise<{ slug: string; page: string }>; // Props 包含 slug 和 page
}) {
  const params = await props.params;
  const categorySlug = decodeURI(params.slug); // 使用 slug
  const pageNumber = parseInt(params.page as string);
  // (同样，推荐用 API 获取 category.name 来生成更友好的标题)
  const title = categorySlug[0].toUpperCase() + categorySlug.slice(1); // 简单格式化 slug

  // --- a. 从 API 获取该分类下的 *所有* 文章 ---
  const filteredPosts: DjangoPost[] = await getPostsByCategory(categorySlug); // <-- 使用 getPostsByCategory

  // --- b. 分页逻辑 (保持不变) ---
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

  // --- c. 渲染布局 ---
  return (
    <ListLayout
      posts={filteredPosts} // 传入 *所有* 属于该分类的文章
      initialDisplayPosts={initialDisplayPosts} // 传入 *当前页* 的文章
      pagination={pagination}
      title={`Category: ${title}`} // 分类标题
    />
  );
}
