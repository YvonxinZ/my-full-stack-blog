// app/categories/CategoryTreeNode.tsx
import Link from '@/components/Link';
import type { CategoryNode } from '@/lib/utils'; // 导入我们扩展后的类型

interface CategoryTreeNodeProps {
  category: CategoryNode;
  level?: number;
}

export default function CategoryTreeNode({ category, level = 0 }: CategoryTreeNodeProps) {
  // 根据层级计算缩进 (使用 Tailwind 的 margin-left)
  const indentationClass = `ml-${level * 8}`; // ml-0, ml-4, ml-8 etc.

  return (
    <div className={`py-4 ${indentationClass}`}>
      <Link
        href={`/categories/${category.slug}`}
        className="hover:text-primary-600 dark:hover:text-primary-400 text-lg font-medium text-gray-800 transition-colors duration-200 ease-in-out dark:text-gray-200"
      >
        {/* <span className="mr-2">📄</span> */}
        {category.name}
      </Link>
      {category.children && category.children.length > 0 && (
        <div className="mt-2 border-l-2 border-gray-300 dark:border-gray-700">
          {' '}
          {/* 添加左边框和内边距 */}
          {category.children.map((child) => (
            <CategoryTreeNode key={child.slug} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
