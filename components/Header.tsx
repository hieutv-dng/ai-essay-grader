import React from 'react';
import { BookOpen } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 md:mb-12">
      <div className="flex justify-center items-center gap-3">
        <BookOpen className="text-amber-600" size={32} />
        <h1 className="text-4xl md:text-5xl font-bold text-stone-800">
          Trợ lý chấm Văn AI
        </h1>
      </div>
      <p className="text-lg text-stone-600 mt-3">
        Tải lên bài viết của bạn để nhận được những phân tích và góp ý chi tiết từ AI.
      </p>
      <div className="w-24 h-0.5 bg-amber-300 mx-auto mt-6"></div>
    </header>
  );
};

export default Header;