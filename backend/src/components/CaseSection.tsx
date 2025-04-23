const cases = [
  {
    id: 1,
    title: 'DSE 數學補習',
    location: '觀塘',
    price: '$300/小時',
    duration: '每週 2 次',
    tags: ['DSE', '數學', '觀塘']
  },
  {
    id: 2,
    title: 'IB 物理補習',
    location: '銅鑼灣',
    price: '$350/小時',
    duration: '每週 1 次',
    tags: ['IB', '物理', '銅鑼灣']
  },
  {
    id: 3,
    title: '英語會話練習',
    location: '中環',
    price: '$400/小時',
    duration: '每週 3 次',
    tags: ['英語', '會話', '中環']
  },
  {
    id: 4,
    title: 'A-Level 化學補習',
    location: '旺角',
    price: '$320/小時',
    duration: '每週 2 次',
    tags: ['A-Level', '化學', '旺角']
  }
];

const CaseSection = () => {
  return (
    <section className="mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-primary font-bold text-lg mb-3 border-b-2 border-primary inline-block">
          最新補習個案
        </h2>
        <div className="bg-yellow-50 rounded-2xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {cases.map((case_) => (
              <div
                key={case_.id}
                className="bg-white border border-gray-300 rounded-xl shadow-sm p-4 hover:shadow-lg transition-all duration-200"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{case_.title}</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>地點: {case_.location}</p>
                  <p>費用: {case_.price}</p>
                  <p>頻率: {case_.duration}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {case_.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button className="bg-white border border-primary text-primary rounded-md px-4 py-2 hover:bg-gray-50 transition-all duration-200">
              查看更多個案
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseSection; 