<div className="mx-auto my-4 max-w-7xl border-2 border-[#2563eb] p-4 sm:p-6 lg:p-8">
  <div className="mb-4 flex items-center justify-between">
    <h2 className="text-xl font-bold sm:text-2xl">📄 最新學生搵導師個案</h2>
    <Link href={"/case"} className="text-sm font-medium text-gray-600">
      查看全部 →
    </Link>
  </div>
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {caseData.map((caseItem) => (
      <Link key={caseItem.id} href={"/case/" + caseItem.id}>
        <div className="cursor-pointer overflow-hidden rounded-lg border-2 border-[#2563eb] bg-white p-4 shadow transition-all hover:shadow-lg">
          // ... existing code ...
        </div>
      </Link>
    ))}
  </div>
</div> 