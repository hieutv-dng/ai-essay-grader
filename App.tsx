import React, { useState, useCallback, useRef } from 'react';
import { gradeEssay } from './services/geminiService';
import Header from './components/Header';
import ResultCard from './components/ResultCard';
import Spinner from './components/Spinner';
import { FileText, Upload, PenSquare, X } from 'lucide-react';

const App: React.FC = () => {
  const [essayText, setEssayText] = useState<string>('');
  const [essayTopic, setEssayTopic] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const [mimeType, base64] = result.split(',');
        resolve({ base64, mimeType: mimeType.replace('data:', '').replace(';base64', '') });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
            setError("Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 4MB.");
            return;
        }
      setFile(selectedFile);
      setError(null);

      if (selectedFile.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setEssayText(e.target?.result as string);
        };
        reader.readAsText(selectedFile);
      }
    }
  };
  
  const clearFile = () => {
    setFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!essayText && !file) {
      setError("Vui lòng nhập bài văn hoặc tải lên một tệp để AI chấm điểm nhé!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setFeedback('');

    try {
      let imageBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (file && file.type.startsWith('image/')) {
        const { base64: b64, mimeType: mt } = await fileToBase64(file);
        imageBase64 = b64;
        mimeType = mt;
      }
      
      const result = await gradeEssay(essayTopic, essayText, imageBase64, mimeType);
      setFeedback(result);
    } catch (err: any) {
      setError(err.message || "Đã có lỗi xảy ra trong quá trình chấm điểm.");
    } finally {
      setIsLoading(false);
    }
  }, [essayText, essayTopic, file]);

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      <main className="relative max-w-5xl mx-auto space-y-10">
        <Header />

        <div className="bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-3xl shadow-2xl border border-white/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 pb-6 border-b border-stone-200/60">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Bài làm của bạn</h2>
              <p className="mt-2 text-stone-600 text-sm md:text-base">
                Hãy nhập đề bài và nội dung bài viết để AI có thể đánh giá thật chính xác.
              </p>
            </div>
            <div className="flex items-center gap-3 text-amber-700 bg-amber-50/80 px-4 py-2 rounded-2xl border border-amber-200/80 shadow-sm">
              <PenSquare size={20} />
              <span className="text-sm font-semibold">Sẵn sàng chấm bài cho bạn!</span>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-semibold text-stone-700 mb-2">
                Đề bài (nếu có)
              </label>
              <input
                id="topic"
                type="text"
                value={essayTopic}
                onChange={(e) => setEssayTopic(e.target.value)}
                placeholder="Ví dụ: Tả một cơn mưa rào mùa hạ"
                className="w-full px-4 py-3 bg-white/80 border border-white/70 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
              />
            </div>

            <div>
              <label htmlFor="essay" className="block text-sm font-semibold text-stone-700 mb-2">
                Nội dung bài làm
              </label>
              <textarea
                id="essay"
                rows={12}
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Nhập nội dung bài văn của bạn vào đây, hoặc tải lên một tệp ở bên dưới..."
                className="w-full px-4 py-3 bg-white/80 border border-white/70 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-200/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 border border-amber-300/80 text-sm font-semibold rounded-xl text-amber-900 bg-amber-50/90 hover:bg-amber-100 transition shadow-sm"
                >
                  <Upload size={16} />
                  Tải bài viết (ảnh hoặc .txt)
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.txt"
                />
                {file && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-stone-700 bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200/80">
                    <FileText size={16} className="text-amber-500" />
                    <span className="font-medium truncate max-w-[220px]">{file.name}</span>
                    <button onClick={clearFile} className="ml-auto text-stone-400 hover:text-stone-700 transition">
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-full text-base font-semibold text-white bg-gradient-to-r from-amber-500 via-rose-400 to-amber-500 hover:from-amber-500 hover:via-rose-500 hover:to-amber-500 shadow-lg shadow-amber-500/30 transition-transform transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <PenSquare size={20} />
                {isLoading ? 'AI đang chấm bài...' : 'Gửi bài chấm điểm'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-rose-200/70 bg-rose-50/90 px-6 py-4 text-rose-800 shadow-md">
            <div className="absolute inset-y-0 left-0 w-1 bg-rose-400" aria-hidden="true" />
            <p className="font-semibold">Ôi, có lỗi rồi: <span className="font-normal">{error}</span></p>
          </div>
        )}

        {isLoading && <Spinner />}

        {feedback && <ResultCard feedback={feedback} />}
      </main>
    </div>
  );
};

export default App;