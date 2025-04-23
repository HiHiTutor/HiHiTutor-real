const categories = [
  { id: 1, name: '中小學補習', description: '針對性提升學科成績', icon: '📚' },
  { id: 2, name: '語言學習', description: '英語、日語、韓語等', icon: '🗣️' },
  { id: 3, name: '音樂藝術', description: '鋼琴、繪畫、舞蹈等', icon: '🎨' },
  { id: 4, name: '運動健身', description: '游泳、瑜伽、健身等', icon: '🏃' },
];

const CategorySection = () => {
  return (
    <section className="mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-primary font-bold text-xl mb-2 border-b-2 border-primary inline-block">
          課程分類
        </h2>
        <div className="bg-yellow-50 p-4 rounded-2xl shadow-sm mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection; 