import { api } from './api.ts';
import axios from 'axios'; // <-- 导入 axios 实例
export async function getAuthorBySlug(slug: string): Promise<DjangoAuthor | null> {
  try {
    // 请求新的 /api/authors/[slug]/ 端点
    const response = await api.get(`/authors/${slug}/`);
    return response.data as DjangoAuthor;
  } catch (error) {
    console.error(`Failed to fetch author with slug ${slug}:`, error);
    // 可能是 404
    return null;
  }
}

export type PDFAttachment = {
  id: number;
  file: string; // 这将是一个 URL，例如 http://.../media/file.pdf
  description: string | null;
};

export type DjangoAuthor = {
  id: number;
  name: string;
  slug: string;
  avatar_url: string | null; // 匹配 model
  occupation: string | null;
  company: string | null;
  email: string | null;
  twitter: string | null;
  linkedin: string | null;
  github: string | null;
  bio: string | null;
};
// --- 在这里定义 TypeScript 类型 ---
export type DjangoPost = {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  created_at: string;
  author: number;
  category: number | null;
  tags: string[];
  post_type: 'blog' | 'moment'; // 类型是 'blog' 或 'moment'
  image_url?: string | null; // 图片 URL (可选)
  image_alt?: string | null; // 图片 Alt 文本 (可选
  pdf_attachments?: PDFAttachment[] | null;
};

// --- 1. 获取所有文章 (用于 /page.tsx 和 /blog/page.tsx) ---
export async function getAllPosts(): Promise<DjangoPost[]> {
  // 请求 /api/posts/ (不带 type 参数)
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const url = `${API_URL}/posts/`;
  try {
    const response = await axios.get(url);
    //const response = await api.get('/posts/');
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results as DjangoPost[];
    }
    // (添加对非分页数组的检查，以防万一)
    if (response.data && Array.isArray(response.data)) {
      return response.data as DjangoPost[];
    }
    console.error('Unexpected API response format for getAllPosts:', response.data);
    return [];
  } catch (error) {
    console.error('Failed to fetch all posts:', error);
    throw new Error('Failed to fetch posts'); // 重新抛出错误
  }
}

export async function getAllPosts_OnlyBlog(): Promise<DjangoPost[]> {
  try {
    // 请求 /api/posts/?type=blog
    const response = await api.get('/posts/', { params: { type: 'blog' } });
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results as DjangoPost[];
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data as DjangoPost[];
    }
    console.error('Unexpected API response format for getAllPosts:', response.data);
    return [];
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    throw new Error('Failed to fetch blog posts');
  }
}
export async function getAllMoments(): Promise<DjangoPost[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const url = `${API_URL}/posts/?type=moment`;
  try {
    // 请求 /api/posts/?type=moment
    const response = await axios.get(url);
    //const response = await api.get('/posts/', {
    //  params: { type: 'moment' }, // <-- 关键：添加 type 参数
    //});

    // 处理响应 (逻辑和 getAllPosts 类似)
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results as DjangoPost[];
    }
    if (response.data && Array.isArray(response.data)) {
      return response.data as DjangoPost[];
    }
    console.error('Unexpected API response format for getAllMoments:', response.data);
    return [];
  } catch (error) {
    console.error('Failed to fetch moments:', error);
    throw new Error('Failed to fetch moments'); // 重新抛出错误
  }
}
export type DjangoTag = {
  id: number;
  name: string;
  slug: string;
};

export type DjangoCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
};

export async function getAllTags(): Promise<DjangoTag[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const url = `${API_URL}/tags/`;
  try {
    const response = await axios.get(url);
    // 检查 DRF 分页
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data; // 否则，假设它是一个简单数组
  } catch (error) {
    console.error('Failed to fetch all tags:', error);
    return [];
  }
}

export async function getPostsByTag(slug: string): Promise<DjangoPost[]> {
  try {
    // Use the 'tag_slug' query parameter we defined in Django's PostViewSet
    const response = await api.get('/posts/', {
      params: { tag_slug: slug },
    });

    // Handle pagination response if necessary
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data; // Fallback if no pagination
  } catch (error) {
    console.error(`Failed to fetch posts for tag ${slug}:`, error);
    return []; // Return empty array on error
  }
}

export async function getAllCategories(): Promise<DjangoCategory[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const url = `${API_URL}/categories/`;
  try {
    // const response = await api.get('/categories/');
    const response = await axios.get(url);
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all categories:', error);
    return [];
  }
}

// --- 根据 Category Slug 获取文章 (用于 /category/[slug]/page.tsx) ---
export async function getPostsByCategory(slug: string): Promise<DjangoPost[]> {
  try {
    const response = await api.get('/posts/', {
      params: { category_slug: slug }, // 使用 category_slug 查询参数
    });

    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch posts for category ${slug}:`, error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<DjangoPost | null> {
  try {
    const response = await api.get(`/posts/${slug}/`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch post with slug ${slug}:`, error);
    return null;
  }
}
