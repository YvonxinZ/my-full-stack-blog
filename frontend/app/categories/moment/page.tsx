// app/moment/page.tsx
import { genPageMetadata } from 'app/seo';
import { getAllMoments } from '@/lib/data'; // 导入获取 Moments 的函数
import type { DjangoPost } from '@/lib/data'; // 导入 Post 类型 (Moments 也是 Post)
import MomentCard from '@/components/MomentCard'; // <-- 导入你的 MomentCard 组件 (请确认路径!)
import siteMetadata from '@/data/siteMetadata'; // 用于获取占位图片 (可选)

// --- 2. Metadata ---
export const metadata = genPageMetadata({
  title: 'Moments',
  description: 'A collection of moments and snapshots.',
});

// --- 3. Page Component ---
export default async function MomentPage() {
  // --- a. Fetch Moments ---
  const moments: DjangoPost[] = await getAllMoments();

  return (
    <div className="divide-y divide-gray-200 md:mt-16 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          Moments
        </h1>
        {/* (可选) 在这里加一段描述 */}
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Snapshots from life, travel, and thought.
        </p>
      </div>

      {/* --- b. Grid Layout for Cards --- */}
      <div className="container py-12">
        <div className="-m-4 flex flex-wrap">
          {' '}
          {/* 使用 Flexbox 换行 */}
          {!moments || moments.length === 0 ? (
            <p className="w-full text-center text-gray-500 dark:text-gray-400">
              No moments found yet. Stay tuned!
            </p>
          ) : (
            moments.map((moment) => {
              // --- c. Prepare Props for MomentCard ---

              // Date Formatting
              const dateObj = new Date(moment.created_at);
              const year = dateObj.getFullYear().toString();
              // 你可以自定义日期格式 'en-US' / 'de-DE' 等
              const displayDate = dateObj.toLocaleDateString(siteMetadata.locale || 'en-US', {
                month: 'short',
                day: 'numeric',
              });

              // Image Handling (使用 siteMetadata 中的占位图)
              const imageUrl =
                moment.image_url || siteMetadata.socialBanner || '/static/images/placeholder.png'; // 提供多重后备
              const imageAlt = moment.image_alt || moment.title || 'Moment image'; // 提供后备 alt 文本

              return (
                // --- d. Render MomentCard ---
                <div key={moment.slug} className="w-full p-4 md:w-1/2 lg:w-1/3">
                  {' '}
                  {/* 控制卡片宽度 */}
                  <MomentCard
                    title={moment.title}
                    // Moment 卡片可能用 summary 更合适
                    content={moment.content} // 使用 summary 或截断 content
                    imageUrl={imageUrl}
                    imageAlt={imageAlt}
                    dateTime={moment.created_at} // 传递 ISO 字符串
                    year={year}
                    displayDate={displayDate}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* --- Grid End --- */}
    </div>
  );
}
