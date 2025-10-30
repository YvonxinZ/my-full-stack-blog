import { genPageMetadata } from 'app/seo';

// --- 2. (导入) 你的 API 函数、类型和布局 ---
import AuthorLayout from '@/layouts/AuthorLayout';
import { getAuthorBySlug } from '@/lib/data'; // <-- 你的新 API 函数
import type { DjangoAuthor } from '@/lib/data'; // <-- 你的新类型

// --- 3. (导入) Markdown 渲染器 (用于渲染 bio) ---
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
// (确保你已安装: yarn add react-markdown rehype-raw)

export const metadata = genPageMetadata({ title: 'About' });

export default async function Page() {
  // --- 4. (修改) 从 API 获取数据 ---
  // (模板默认查找 slug 为 'default' 的作者)
  const author = await getAuthorBySlug('default');

  // --- 5. (新增) 处理作者未找到的情况 ---
  if (!author) {
    return (
      <div className="pt-8">
        <h1 className="text-3xl font-bold">Author profile not found.</h1>
        <p>
          Could not fetch author data. Please ensure:
          <br />
          1. Your Django API is running.
          <br />
          2. You have created an Author in the Django admin with the slug 'default'.
        </p>
      </div>
    );
  }
  const bio = String(author.bio);
  try {
    return (
      <>
        <AuthorLayout content={author}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{bio}</ReactMarkdown>
        </AuthorLayout>
      </>
    );
  } catch (error) {
    console.error('Error rendering markdown:', error);
  }
}
