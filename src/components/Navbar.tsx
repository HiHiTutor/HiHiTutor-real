  {menuOpen && (
    <div className="absolute top-full left-0 w-full bg-white shadow-lg z-50 flex flex-col items-center space-y-4 py-6 md:hidden animate-fade-in">
      <Link href="/" className="hover:text-primary text-lg" onClick={() => setMenuOpen(false)}>主頁</Link>
      <Link href="/tutors" className="hover:text-primary text-lg" onClick={() => setMenuOpen(false)}>尋導師</Link>
      <Link href="/find-tutor-cases" className="hover:text-primary text-lg" onClick={() => setMenuOpen(false)}>補習個案</Link>
      <Link href="/recommendations" className="hover:text-primary text-lg" onClick={() => setMenuOpen(false)}>導師推薦</Link>
      <Link href="/articles" className="hover:text-primary text-lg" onClick={() => setMenuOpen(false)}>教育專欄</Link>
      <Link href="/faq" className="hover:text-primary text-lg" onClick={() => setMenuOpen(false)}>常見問題</Link>
      <div className="flex flex-col items-center space-y-2 mt-2 w-full">
        <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded w-4/5 text-center" onClick={() => setMenuOpen(false)}>用戶登入</Link>
        <Link href="/register" className="bg-green-500 text-white px-4 py-2 rounded w-4/5 text-center" onClick={() => setMenuOpen(false)}>註冊用戶</Link>
      </div>
    </div>
  )} 