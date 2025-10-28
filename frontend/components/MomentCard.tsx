'use client';
import Image from './Image';
import { useState } from 'react';
// 定义组件接收的 Props 类型
interface MomentCardProps {
  // 文章数据
  title: string;
  content: string;

  // 图片数据
  imageUrl: string;
  imageAlt: string;

  // 日期数据
  dateTime: string;
  year: string;
  displayDate: string;
}
const TRUNCATE_LENGTH = 100;
const MomentCard: React.FC<MomentCardProps> = ({
  title,
  content,
  imageUrl,
  imageAlt,
  dateTime,
  year,
  displayDate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsTruncation = content.length > TRUNCATE_LENGTH;
  const displayedContent =
    isExpanded || !needsTruncation ? content : `${content.substring(0, TRUNCATE_LENGTH)}...`;
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  return (
    // --- 1. 卡片容器: 使用 flex-col 实现垂直布局 ---
    <article className="flex h-full flex-col overflow-hidden rounded bg-white shadow-md transition hover:shadow-xl dark:bg-gray-800">
      {/* --- 2. 日期部分 (移到顶部，移除 vertical/rotate) --- */}
      <div className="border-b border-gray-100 p-3 dark:border-gray-700">
        {' '}
        {/* 添加边框和内边距 */}
        <time
          dateTime={dateTime}
          // 使用 flex justify-between 让 年份 和 月/日 分开
          className="flex items-center justify-between text-xs font-medium text-gray-500 uppercase dark:text-gray-400"
        >
          <span>{displayDate}</span> {/* 月/日 在左 */}
          <span>{year}</span> {/* 年份 在右 */}
        </time>
      </div>

      {/* --- 3. 图片部分 (保持方形，宽度占满) --- */}
      {/* 移除 hidden/sm:block/basis-56 */}
      <div className="relative aspect-square w-full">
        {' '}
        {/* aspect-square 确保是正方形 */}
        <Image
          alt={imageAlt}
          src={imageUrl}
          className="object-cover" // 保持 cover
          fill // 保持 fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // 可以根据父级宽度调整
        />
      </div>

      {/* --- 4. 内容和按钮区域 (垂直排列) --- */}
      {/* 使用 flex-grow 让此区域填满剩余高度 */}
      <div className="flex flex-grow flex-col justify-between p-4 sm:p-6">
        {' '}
        {/* 增加 flex-grow */}
        {/* 文本内容 */}
        <div>
          {' '}
          {/* 包裹标题和段落 */}
          <h3 className="mb-2 font-bold text-gray-900 uppercase dark:text-gray-100">{title}</h3>
          <p className="text-sm/relaxed text-gray-700 dark:text-gray-300">{displayedContent}</p>
        </div>
        {/* 按钮 (仅在需要截断时显示) */}
        {needsTruncation && (
          // 使用 mt-auto 将按钮推到底部 (如果 flex 容器允许)
          <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
            {' '}
            {/* 添加上边框和间距 */}
            <button
              onClick={toggleExpand}
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 w-full text-center text-sm font-medium" // w-full 让按钮占满宽度
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default MomentCard;
