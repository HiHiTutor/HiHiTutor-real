export default function FindStudentCasesLayout({
  children,
}: {
  children: any;
}) {
  return (
    <div className="min-h-screen bg-blue-50">
      <div className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <h1 className="text-xl font-bold text-blue-700">補習個案</h1>
          </div>
        </div>
      </div>
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
} 