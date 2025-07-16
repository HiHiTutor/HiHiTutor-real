import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-700 text-gray-100 relative min-h-[220px] flex flex-col justify-center">
      {/* 上方白色分隔 */}
      <div className="absolute top-0 left-0 w-full h-8 bg-gray-50" style={{zIndex:1}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex flex-col justify-center max-[700px]:px-6">
        <div className="flex flex-col items-center space-y-4">
          {/* 版權信息 - 第一行 */}
          <div className="text-center">
            <p className="text-sm text-gray-200">© Copyright 2025 HiHiTutor LTD All rights reserved.</p>
          </div>
          {/* 連結 - 第二行 */}
          <div className="flex space-x-6 max-[700px]:space-x-4 max-[700px]:flex-wrap max-[700px]:justify-center">
            <a href="https://wa.me/85295011159" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-sm">聯絡我們</a>
            <Link href="/about" className="hover:text-primary transition-colors text-sm">關於我們</Link>
            <Link href="/terms" className="hover:text-primary transition-colors text-sm">服務條款</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors text-sm">私隱政策</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 