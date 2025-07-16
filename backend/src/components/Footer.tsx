import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center space-y-8">
          {/* App Store Buttons */}
          <div className="flex space-x-4">
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image
                src="/app-store.png"
                alt="Download on App Store"
                width={140}
                height={42}
                className="h-[42px] w-auto"
              />
            </Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image
                src="/google-play.png"
                alt="Get it on Google Play"
                width={140}
                height={42}
                className="h-[42px] w-auto"
              />
            </Link>
            <Link href="#" className="hover:opacity-80 transition-opacity">
              <Image
                src="/app-gallery.png"
                alt="Get it on AppGallery"
                width={140}
                height={42}
                className="h-[42px] w-auto"
              />
            </Link>
          </div>

          {/* Links */}
          <div className="flex space-x-6">
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              關於我們
            </Link>
            <a href="https://wa.me/85295011159" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
              聯絡方式
            </a>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">
              服務條款
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              私隱政策
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-gray-500 text-sm">
            © 2025 HiHiTutor Limited. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 