'use client';

// 导入所有客户端需要的库
import { useState } from 'react';
import { components } from '@/components/MDXComponents';
import PDFModal from '@/components/PDFModal';
import { DjangoPost, PDFAttachment } from '@/lib/data'; // 导入您的类型
// 导入新的渲染器
import ReactMarkdown, { Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import siteMetadata from '@/data/siteMetadata';

// 导入布局 (它们也必须是客户端组件或兼容的)
import PostSimple from '@/layouts/PostSimple';
import PostLayout from '@/layouts/PostLayout';
import PostBanner from '@/layouts/PostBanner';

const defaultLayout = 'PostLayout';
const layouts = {
  PostSimple,
  PostLayout,
  PostBanner,
};

// 4. 定义此组件将从服务器组件接收的 Props
interface PostPageClientProps {
  post: DjangoPost;
  prev: DjangoPost | null;
  next: DjangoPost | null;
  // 保持与您 page.tsx 一致
}

export default function PostPageClient({ post, prev, next }: PostPageClientProps) {
  // 6. 您的状态和处理函数现在可以正常工作了！
  const [modalPdfUrl, setModalPdfUrl] = useState<string | null>(null);
  const handleOpenModal = (url: string) => {
    console.log('Received URL:', url);
    setModalPdfUrl(url);
  };

  const handleCloseModal = () => {
    setModalPdfUrl(null);
  };

  const Layout = layouts[defaultLayout];
  const authorDetails = [
    {
      name: siteMetadata.author,
      avatar: siteMetadata.image,
    },
  ];
  // 7. 渲染 UI (这部分是从 page.tsx 移动过来的)
  return (
    <>
      <Layout content={post} authorDetails={authorDetails} next={prev} prev={next}>
        <div className="prose dark:prose-dark max-w-none">
          <ReactMarkdown
            components={components as Options['components']}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {post.content}
          </ReactMarkdown>
          <div className="divide-y divide-gray-200 xl:col-span-3 xl:row-span-2 xl:pb-0 dark:divide-gray-700">
            {/* 渲染 PDF 按钮 */}
            {post.pdf_attachments && post.pdf_attachments.length > 0 && (
              <div className="my-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  PDF资料
                </h3>
                <ul className="space-y-2">
                  {(post.pdf_attachments as PDFAttachment[]).map((pdf) => (
                    <li key={pdf.id}>
                      <button
                        onClick={() => handleOpenModal(pdf.file)}
                        className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200"
                      >
                        📄 {pdf.description || '点击查看'}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* 渲染 Modal */}
      <PDFModal
        isOpen={modalPdfUrl !== null}
        onClose={handleCloseModal}
        pdfUrl={modalPdfUrl || undefined}
      />
    </>
  );
}
