import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-50 p-6 text-center text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* App Store Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <Link href="#" className="hover:opacity-80 transition-opacity">
            <Image
              src="/app-store.png"
              alt="App Store"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <Link href="#" className="hover:opacity-80 transition-opacity">
            <Image
              src="/google-play.png"
              alt="Google Play"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <Link href="#" className="hover:opacity-80 transition-opacity">
            <Image
              src="/app-gallery.png"
              alt="App Gallery"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Links */}
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="/about" className="hover:text-primary transition-colors">
            關於我們
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors">
            聯絡方式
          </Link>
          <Link href="/terms" className="hover:text-primary transition-colors">
            服務條款
          </Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">
            私隱政策
          </Link>
        </div>

        {/* Copyright */}
        <p>© 2025 HiHiTutor Limited. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 