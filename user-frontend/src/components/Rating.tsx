'use client';

import React from 'react';

interface RatingProps {
  rating: number;
}

const Rating: React.FC<RatingProps> = ({ rating }) => {
  if (!rating || rating <= 0) {
    return null; // 不顯示任何內容
  }

  const stars = [];
  // 四捨五入到最近的 0.5
  const roundedRating = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(roundedRating);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`star-${i}`} className="text-yellow-400 max-sm:text-sm max-[700px]:text-base">⭐</span>);
  }
  
  // 如果需要半星顯示
  if (roundedRating - fullStars === 0.5) {
    stars.push(<span key="half-star" className="max-sm:text-sm max-[700px]:text-base">🌟</span>);
  }

  return <div className="flex items-center max-sm:gap-0.5 max-[700px]:gap-1">{stars}</div>;
};

export default Rating; 