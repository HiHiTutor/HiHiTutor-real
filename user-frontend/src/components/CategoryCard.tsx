import { FC } from 'react';
import Link from 'next/link';

interface CategoryCardProps {
  title: string;
  subtitle: string;
  icon: string;
  href?: string;
}

const CategoryCard: FC<CategoryCardProps> = ({ title, subtitle, icon, href }) => {
  const content = (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-sm font-medium text-gray-800 text-center">{title}</h3>
      <p className="text-xs text-gray-600 text-center mt-1 line-clamp-2">{subtitle}</p>
    </div>
  );
  return href ? (
    <Link href={href} className="block h-36 p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      {content}
    </Link>
  ) : (
    <div className="block h-36 p-4 rounded-xl bg-white shadow-md">{content}</div>
  );
};

export default CategoryCard; 