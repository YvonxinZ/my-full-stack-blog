import axios from 'axios';
// 1. 定义你的 Django API 的基础 URL
// // 我们使用 process.env 来使其在生产环境中可配置
const API_URL = process.env.NEXT_PUBLIC_API_URL;
// 2. 创建一个 axios 实例
export const api = axios.create({
  baseURL: API_URL,
  // 在这里你可以添加其他全局配置，比如超时时间
  // timeout: 1000,
});

// (未来) 当你有了 JWT 认证
// 你可以在这里设置“拦截器”，自动为每个请求添加 Token
/*
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
*/
