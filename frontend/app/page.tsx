import axios from 'axios';
import Main from './Main';
import { getAllPosts_OnlyBlog } from '@/lib/data';
import { api } from '@/lib/api';
// --- 定义的 Django Post 类型 ---

type DjangoCategory = {
  id: number;
  name: string;
  slug: string;
};

type DjangoTag = {
  id: number;
  name: string;
  slug: string;
};

type DjangoPost = {
  id: number;
  title: string;
  slug: string;
  content: string; // 注意：在列表页，你可能不需要 content
  created_at: string;
  author: string; // 假设 API 返回 author ID
  category: number | null; // 假设 API 返回 category ID
  tags: number[]; // 假设 API 返回 tag ID 数组
  // 你可能还需要在这里添加 author_name, category_name 等
  // (这取决于你的 PostSerializer 如何配置)
};

// 创建一个函数来获取数据
async function getPostsFromDjango(): Promise<DjangoPost[]> {
  try {
    const response = await api.get('/posts/');
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }

    // 检查 DRF 的分页响应
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }

    console.error('Fetched data is not an array:', response.data);
    return [];
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    // 在生产环境中， throw new Error('Failed to fetch posts');
    return []; // 返回空数组，这样页面可以正常构建（显示 "No posts found."）
  }
}

// --- 修改你的 Page 组件 ---
export default async function Page() {
  const posts = await getAllPosts_OnlyBlog();
  return <Main posts={posts} />;
}
