import React from 'react';
import { BookOpen } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-10 md:mb-14 text-white space-y-5">
      <div className="inline-flex items-center gap-4 px-6 py-3 rounded-full bg-white/10 border border-white/20 shadow-lg backdrop-blur-lg">
        <BookOpen className="text-amber-300" size={34} />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Trợ lý chấm Văn AI
        </h1>
      </div>
      <p className="mx-auto max-w-2xl text-base md:text-lg text-stone-200">
        Tải lên bài viết của bạn để nhận được những phân tích và góp ý chi tiết từ AI, giúp nâng tầm từng câu chữ.
      </p>
      <div className="mx-auto h-1 w-28 rounded-full bg-gradient-to-r from-amber-400 via-rose-300 to-amber-400"></div>
    </header>
  );
};

export default Header;