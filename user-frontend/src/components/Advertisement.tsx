'use client';

const Advertisement = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 max-sm:px-4 max-sm:py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-sm:gap-3">
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm max-sm:p-3">
          <h3 className="text-lg font-semibold mb-2 max-sm:text-base max-sm:mb-1">廣告位置 1</h3>
          <p className="text-gray-600 max-sm:text-sm">這裡可以放置廣告內容</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm max-sm:p-3">
          <h3 className="text-lg font-semibold mb-2 max-sm:text-base max-sm:mb-1">廣告位置 2</h3>
          <p className="text-gray-600 max-sm:text-sm">這裡可以放置廣告內容</p>
        </div>
      </div>
    </section>
  );
};

export default Advertisement; 