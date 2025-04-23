import Image from 'next/image';
import { hotSubjects } from '@/data/mockData';

const HeroSection = () => {
  return (
    <section className="mb-6 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <div className="relative h-[500px] rounded-2xl shadow-sm mb-6 overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-[url('/hero-illustration.png')] bg-cover bg-center"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-white/95 via-white/80 to-transparent backdrop-blur-sm" />
          
          {/* Content */}
          <div className="relative z-20 h-full flex flex-col justify-center p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              找到最適合你的
              <span className="text-primary"> 私人補習導師</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              HiHiTutor 幫你配對最合適的導師，讓學習更有效率
            </p>
            <div className="flex gap-4">
              <button className="bg-yellow-400 text-white font-semibold rounded px-6 py-3 hover:bg-yellow-500 transition-all duration-200">
                立即尋找導師
              </button>
              <button className="bg-white text-gray-900 px-6 py-3 rounded font-semibold shadow-sm hover:bg-gray-50 transition-all duration-200 border border-gray-200">
                了解更多
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar and Hot Subjects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <div className="bg-white border border-yellow-300 p-4 rounded-md shadow-sm">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="輸入科目、導師或課程關鍵字"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                />
                <button className="bg-yellow-400 text-white px-8 py-2 rounded-lg hover:bg-yellow-500 transition-all duration-200 font-semibold">
                  搜尋
                </button>
              </div>
            </div>
          </div>

          {/* Hot Subjects */}
          <div className="bg-white border rounded-md p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">熱門科目</h3>
            <div className="space-y-4">
              {hotSubjects.map((subject) => (
                <div key={subject.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{subject.name}</span>
                    <span className="text-gray-600">{subject.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${subject.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Advertisement Banners */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            廣告位置 1
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
            廣告位置 2
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 