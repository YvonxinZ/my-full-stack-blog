import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { getAllPosts, getAllTags } from '../lib/data.ts';
import { escape } from 'pliny/utils/htmlEscaper.js';
import siteMetadata from '../data/siteMetadata.js';

// (辅助函数) Next.js 的 sortPosts 很简单，我们可以自己实现一个
const sortPosts = (posts) => {
  return posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const outputFolder = process.env.EXPORT ? 'out' : 'public';

// --- 3. (修改) generateRssItem ---
//    使用 DjangoPost 的字段 (created_at)
const generateRssItem = (config, post) => `
  <item>
    <guid>${config.siteUrl}/blog/${post.slug}</guid>
    <title>${escape(post.title)}</title>
    <link>${config.siteUrl}/blog/${post.slug}</link>
    ${post.summary && `<description>${escape(post.summary)}</description>`}
    <pubDate>${new Date(post.created_at).toUTCString()}</pubDate> 
    <author>${config.email} (${config.author})</author>
    {/* (假设 post.tags 是 ['react', 'python']) */}
    ${post.tags && post.tags.map((t) => `<category>${t}</category>`).join('')}
  </item>
`;

// --- 4. (修改) generateRss ---
//    使用 DjangoPost 的字段 (created_at)
const generateRss = (config, posts, page = 'feed.xml') => `
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>${escape(config.title)}</title>
      <link>${config.siteUrl}/blog</link>
      <description>${escape(config.description)}</description>
      <language>${config.language}</language>
      <managingEditor>${config.email} (${config.author})</managingEditor>
      <webMaster>${config.email} (${config.author})</webMaster>
      <lastBuildDate>${new Date(posts[0].created_at).toUTCString()}</lastBuildDate> 
      <atom:link href="${config.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
      ${posts.map((post) => generateRssItem(config, post)).join('')}
    </channel>
  </rss>
`;

// --- 5. (修改) generateRSS (现在需要接收 allTags) ---
async function generateRSS(
  config,
  allPosts,
  allTags // <-- 接收从 API 获取的标签
) {
  // (假设 post.post_type 存在，如果不存在则移除 .filter())
  const publishPosts = allPosts.filter((post) => post.post_type === 'blog'); // (可选) 只为 'blog' 类型生成 RSS
  // (如果你的 API 已经过滤了草稿，可以移除 .filter(post => post.draft !== true))
  const mainFeedFileName = 'feed.xml';
  // RSS for blog post
  if (publishPosts.length > 0) {
    const rss = generateRss(config, sortPosts(publishPosts), mainFeedFileName);
    writeFileSync(`./${outputFolder}/${mainFeedFileName}`, rss);
  }

  // RSS for tags
  if (publishPosts.length > 0 && allTags.length > 0) {
    const tagFeedFileName = 'feed.xml';
    // --- (修改) 遍历从 API 获取的 allTags ---
    for (const tag of allTags) {
      // (假设 post.tags 是 ['react', 'python'] 这样的字符串数
      const filteredPosts = allPosts.filter(
        (post) => post.tags && post.tags.includes(tag.name) // 或 tag.slug，取决于你 serializer 返回的是什么
      );

      if (filteredPosts.length > 0) {
        const tagFeedRelativeUrl = `tags/${tag.slug}/${tagFeedFileName}`;
        const rss = generateRss(config, sortPosts(filteredPosts), tagFeedRelativeUrl);
        const rssPath = path.join(outputFolder, 'tags', tag.slug); // <-- 使用 tag.slug
        mkdirSync(rssPath, { recursive: true });
        writeFileSync(path.join(rssPath, tagFeedFileName), rss);
      }
    }
  }
}

// --- 6. (修改) 主函数，使其变为异步并调用 API ---
const rss = async () => {
  try {
    console.log('Fetching data from API for RSS feed...');
    const allPosts = await getAllPosts(); // <-- 从 API 获取
    const allTags = await getAllTags(); // <-- 从 API 获取

    await generateRSS(siteMetadata, allPosts, allTags);
    console.log('RSS feed generated successfully.');
  } catch (error) {
    console.error('Error generating RSS feed:', error);
  }
};

export default rss;
