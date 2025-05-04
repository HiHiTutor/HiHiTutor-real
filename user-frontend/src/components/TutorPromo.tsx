import Link from 'next/link';
import Image from 'next/image';

const TutorPromo = () => {
  return (
    <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
      {/* 左側圖片 */}
      <div className="flex items-center justify-center w-full md:w-1/2 p-4">
        <Image
          src="/tutor-hero.jpg"
          alt="成為導師"
          width={400}
          height={300}
          className="rounded-lg shadow-md object-cover"
          priority
        />
      </div>
      {/* 右側內容 */}
      <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-4">成為導師</h2>
        <p className="text-gray-600 mb-6">
          加入我們的導師團隊，分享你的專業知識，賺取額外收入。
        </p>
        <Link href="/upgrade" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 bg-yellow-600 bg-opacity-90 rounded w-max">
          <span>🆙</span>
          <span>申請成為導師</span>
        </Link>
      </div>
    </div>
  );
};

export default TutorPromo; 