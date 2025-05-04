import Link from 'next/link';

const TutorPromo = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">成為導師</h2>
      <p className="text-gray-600 mb-6">
        加入我們的導師團隊，分享你的專業知識，賺取額外收入。
      </p>
      <Link href="/upgrade">
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded transition">
          立即申請成為導師
        </button>
      </Link>
    </div>
  );
};

export default TutorPromo; 