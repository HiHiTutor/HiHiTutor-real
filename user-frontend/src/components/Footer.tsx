import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-700 text-gray-100 relative min-h-[220px] flex flex-col justify-center">
      {/* 上方白色分隔 */}
      <div className="absolute top-0 left-0 w-full h-8 bg-gray-50" style={{zIndex:1}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center">
        <div className="flex flex-col md:flex-row justify-between items-center w-full h-full">
          {/* 左下版權（大螢幕靠左，手機置中） */}
          <div className="mb-6 md:mb-0">
            <p className="text-sm text-gray-200">© Copyright 2025 HiHiTutor LTD All rights reserved.</p>
          </div>
          {/* 右上連結（大螢幕靠右，手機置中） */}
          <div className="flex space-x-8">
            <Link href="/contact" className="hover:text-primary transition-colors border-r border-gray-400 pr-4 last:border-none">聯絡我們</Link>
            <Link href="/about" className="hover:text-primary transition-colors border-r border-gray-400 pr-4 last:border-none">關於我們</Link>
            <Link href="/terms" className="hover:text-primary transition-colors border-r border-gray-400 pr-4 last:border-none">服務條款</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors pr-0">私隱政策</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 