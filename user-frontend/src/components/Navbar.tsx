import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="HiHiTutor"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary">
              主頁
            </Link>
            <Link href="/find-tutor" className="text-gray-700 hover:text-primary">
              尋導師
            </Link>
            <Link href="/find-student" className="text-gray-700 hover:text-primary">
              招學生
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-primary">
              教學專欄
            </Link>
            <Link href="/faq" className="text-gray-700 hover:text-primary">
              常見問題
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button className="bg-yellow-400 text-white px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors">
              尋導師
            </button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              招學生
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 