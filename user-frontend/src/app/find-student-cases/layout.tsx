export default function FindStudentCasesLayout({
  children,
}: {
  children: any;
}) {
  return (
    <div className="min-h-screen bg-blue-50">
      {/* 刪除 header 區塊，只保留 main */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
} 