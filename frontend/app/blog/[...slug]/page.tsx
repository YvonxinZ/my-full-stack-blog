// app/blog/[...slug]/page.tsx

// --- 1. (清理) 导入
import 'css/prism.css';
import 'katex/dist/katex.css';

import { components } from '@/components/MDXComponents';
import { Metadata } from 'next';
import siteMetadata from '@/data/siteMetadata';
import { notFound } from 'next/navigation';
import rehypeRaw from 'rehype-raw'; //允许文章中的超链接
// ---  我们的新数据获取函数和类型 ---
import { getAllPosts, getPostBySlug } from '@/lib/data';
import type { DjangoPost } from '@/lib/data';

// --- 3. 导入新的渲染器 ---
import ReactMarkdown, { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- 4. (导入) 模板的布局 (保持不变) ---
import PostSimple from '@/layouts/PostSimple';
import PostLayout from '@/layouts/PostLayout';
import PostBanner from '@/layouts/PostBanner';

const defaultLayout = 'PostLayout';
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
};

// --- 5. (修改) generateMetadata - 从 API 获取数据 ---
export async function generateMetadata({
  params,
}: {
  params: { slug: string[] };
}): Promise<Metadata | undefined> {
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
export default async function Page(
  { params }: any
  //{ params: { slug: string | string[] } }
) {
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

  if (!post) {
    return notFound(); // 再次检查
  }

  // --- b. 简化作者数据 ---
  // (模板原来的作者逻辑很复杂，我们先用默认作者)
  const authorDetails = [
    {
      name: siteMetadata.author,
      avatar: siteMetadata.image,
      // ... 其他你可能在 siteMetadata 中定义的字段
    },
  ];

  // --- c. (保持不变) 选择布局 ---
  // (我们没有 layout 字段，所以总是使用 defaultLayout)
  const Layout = layouts[defaultLayout];

  return (
    <>
      <Layout content={post} authorDetails={authorDetails} next={prev} prev={next}>
        {/* --- d. (核心替换) ---
          用 ReactMarkdown 替换 MDXLayoutRenderer
          我们把从 API 拿到的纯 Markdown 字符串 (post.content) 传给它
          并告诉它使用 MDXComponents 里的组件来美化 HTML 标签
        */}
        <div className="prose dark:prose-dark max-w-none">
          {' '}
          <ReactMarkdown
            components={components as Options['components']}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </Layout>
    </>
  );
}
