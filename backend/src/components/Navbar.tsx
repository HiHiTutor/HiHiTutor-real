import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-100 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="HiHiTutor Logo"
                width={160}
                height={40}
                className="h-12 w-auto"
                priority
              />
            </Link>
            <div className="hidden md:ml-12 md:flex md:space-x-8">
              <Link 
                href="/" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-primary"
              >
                主頁
              </Link>
              <Link 
                href="/tutors" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-900 transition-all duration-200"
              >
                尋導師
              </Link>
              <Link 
                href="/students" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-900 transition-all duration-200"
              >
                招學生
              </Link>
              <Link 
                href="/articles" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-900 transition-all duration-200"
              >
                教學專欄
              </Link>
              <Link 
                href="/legal" 
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-900 transition-all duration-200"
              >
                常見問題
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="bg-primary text-gray-900 px-6 py-2.5 rounded-lg hover:bg-hihitutor-yellow-600 transition-all duration-200 font-medium shadow-soft hover:shadow-hover">
              尋導師
            </button>
            <button className="bg-secondary text-white px-6 py-2.5 rounded-lg hover:bg-hihitutor-blue-600 transition-all duration-200 font-medium shadow-soft hover:shadow-hover">
              招學生
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 