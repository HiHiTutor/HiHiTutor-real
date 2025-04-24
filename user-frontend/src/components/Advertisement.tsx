'use client';

const Advertisement = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">廣告位置 1</h3>
          <p className="text-gray-600">這裡可以放置廣告內容</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">廣告位置 2</h3>
          <p className="text-gray-600">這裡可以放置廣告內容</p>
        </div>
      </div>
    </section>
  );
};

export default Advertisement; 