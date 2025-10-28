import Link from '@/components/Link';
import { genPageMetadata } from 'app/seo';

// --- 2. (导入) Category 相关的数据获取函数和类型 ---
import { getAllCategories } from '@/lib/data'; // 确保你已经在 lib/data.ts 中创建了这个函数
import type { DjangoCategory } from '@/lib/data'; // 确保你导出了 DjangoCategory 类型
import { buildCategoryTree } from '@/lib/utils';
import CategoryTreeNode from '@/components/CategoryTreeNode';
// --- 3. (修改) 更新页面元数据 ---
export const metadata = genPageMetadata({
  title: 'Categories',
  description: 'Browse content by category',
});

// --- Page 组件 ---
export default async function Page() {
  // --- 从 API 获取 Categories ---
  const categoriesFlat: DjangoCategory[] = await getAllCategories();
  const categoryTree = buildCategoryTree(categoriesFlat);
  const studyRootNode = categoryTree.find((node) => node.slug === 'study');

  return (
    <div className="divide-y divide-gray-200 md:mt-16 dark:divide-gray-700">
      {' '}
      {/* 调整了 mt */}
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          Categories
        </h1>
      </div>
      <div className="pt-8">
        {' '}
        {/* 添加上边距 */}
        {studyRootNode && studyRootNode.children && studyRootNode.children.length > 0 ? (
          // 如果 study 节点存在且有子节点
          studyRootNode.children.map((studyChild) => (
            // 直接渲染子节点，并将它们的 level 设为 0 (顶级)
            <CategoryTreeNode key={studyChild.slug} category={studyChild} level={0} />
          ))
        ) : (
          // 如果没找到 study 或 study 没有子节点
          <p>No sub-categories found under 'study'.</p>
        )}
      </div>
    </div>
  );
}
