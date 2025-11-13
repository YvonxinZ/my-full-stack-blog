// app/blog/[...slug]/page.tsx

import { Metadata } from 'next';
import siteMetadata from '@/data/siteMetadata';
import { notFound } from 'next/navigation';
// ---  我们的新数据获取函数和类型 ---
import { getAllPosts, getPostBySlug } from '@/lib/data';

// --- 模板的布局 (保持不变) ---
import PostSimple from '@/layouts/PostSimple';
import PostLayout from '@/layouts/PostLayout';
import PostBanner from '@/layouts/PostBanner';

const defaultLayout = 'PostLayout';
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
};
import PostPageClient from './PostPageClient.tsx';
// --- 5. (修改) generateMetadata - 从 API 获取数据 ---
export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const slug = decodeURI(params.slug.join('/'));
  const post = await getPostBySlug(slug); // <-- (新) 从 API 获取

  if (!post) {
    return;
  }

  // (简化) 我们简化了 author 和 image 逻辑，因为 API 还不支持
  const authors = [siteMetadata.author];
  const ogImages = [
    {
      url: siteMetadata.siteUrl + siteMetadata.socialBanner,
    },
  ];

  return {
    title: post.title,
    description: post.summary, // 使用我们 serializer 里的 summary
    openGraph: {
      title: post.title,
      description: post.summary,
      siteName: siteMetadata.title,
      locale: 'en_US',
      type: 'article',
      publishedTime: new Date(post.created_at).toISOString(),
      url: './',
      images: ogImages,
      authors: authors,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [siteMetadata.socialBanner],
    },
  };
}

// --- 6. (修改) generateStaticParams - 从 API 获取数据 ---
export const generateStaticParams = async () => {
  const posts = await getAllPosts(); // <-- (新) 从 API 获取
  return posts.map((p) => ({ slug: p.slug.split('/') }));
};

// --- 7. (修改) Page 组件 - 从 API 获取数据并使用 ReactMarkdown ---
export default async function Page(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params;
  const slug = decodeURI(params.slug.join('/'));

  // --- a. 获取文章数据 ---
  const allPosts = await getAllPosts(); // (新) 获取所有文章，用于计算 prev/next
  const postIndex = allPosts.findIndex((p) => p.slug === slug);
  if (postIndex === -1) {
    return notFound();
  }

  const prev = allPosts[postIndex + 1] || null; // (新) 上一篇
  const next = allPosts[postIndex - 1] || null; // (新) 下一篇
  const post = await getPostBySlug(slug); // (新) 获取这篇*完整*的文章

  // --- 结束关键步骤 ---
  if (!post) {
    return notFound(); // 再次检查
  }

  return <PostPageClient post={post} prev={prev} next={next} />;
}
