// lib/utils.ts
import type { DjangoCategory } from './data'; // 导入你的类型

// 扩展 DjangoCategory 类型以包含 children
export interface CategoryNode extends DjangoCategory {
  children: CategoryNode[];
}

export const buildCategoryTree = (categories: DjangoCategory[]): CategoryNode[] => {
  const map: { [key: number]: CategoryNode } = {};
  const tree: CategoryNode[] = [];

  // 1. 初始化 map，并为每个节点添加 children 数组
  categories.forEach((cat) => {
    map[cat.id] = { ...cat, children: [] };
  });

  // 2. 构建树形结构
  Object.values(map).forEach((catNode) => {
    if (catNode.parent && map[catNode.parent]) {
      // 如果有父级，把自己添加到父级的 children 数组中
      map[catNode.parent].children.push(catNode);
    } else {
      // 如果没有父级（或父级在 map 中找不到），是顶级分类
      tree.push(catNode);
    }
  });

  // (可选) 对每个层级的 children 进行排序
  const sortChildren = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach((node) => sortChildren(node.children));
  };
  sortChildren(tree);

  return tree;
};
