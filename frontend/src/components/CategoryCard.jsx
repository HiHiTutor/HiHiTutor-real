import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  const getCategoryIcon = (categoryName) => {
    switch (categoryName) {
      case '幼兒教育':
        return '🧸';
      case '中小學教育':
        return '📚';
      case '興趣班':
        return '🎭';
      case '大專補習課程':
        return '🎓';
      case '成人教育':
        return '💼';
      default:
        return '📚';
    }
  };

  return (
    <Link 
      to={`/categories/${category.id}`}
      className="block h-36 p-4 rounded-xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex flex-col items-center justify-center h-full">
        <span className="text-3xl mb-2">{getCategoryIcon(category.name)}</span>
        <h3 className="text-sm font-medium text-gray-800 text-center">{category.name}</h3>
        <p className="text-xs text-gray-600 text-center mt-1 line-clamp-2">{category.description}</p>
      </div>
    </Link>
  );
};

export default CategoryCard; 