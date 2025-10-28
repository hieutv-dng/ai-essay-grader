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
    <div className="min-h-screen bg-stone-100 text-stone-800 py-8 px-4 sm:px-6 lg:px-8">
      <main className="max-w-4xl mx-auto">
        <Header />

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200">
          <div className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-stone-700 mb-1">
                Đề bài (nếu có)
              </label>
              <input
                id="topic"
                type="text"
                value={essayTopic}
                onChange={(e) => setEssayTopic(e.target.value)}
                placeholder="Ví dụ: Tả một cơn mưa rào mùa hạ"
                className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>
            
            <div>
              <label htmlFor="essay" className="block text-sm font-medium text-stone-700 mb-1">
                Nội dung bài làm
              </label>
              <textarea
                id="essay"
                rows={12}
                value={essayText}
                onChange={(e) => setEssayText(e.target.value)}
                placeholder="Nhập nội dung bài văn của bạn vào đây, hoặc tải lên một tệp ở bên dưới..."
                className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="mt-6 border-t border-stone-200 pt-6">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 border border-stone-300 text-sm font-medium rounded-lg text-stone-700 bg-white hover:bg-stone-50 transition shadow-sm"
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
                         <div className="mt-2 flex items-center gap-2 text-sm text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg">
                             <FileText size={16} className="text-stone-500" />
                             <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                             <button onClick={clearFile} className="ml-auto text-stone-500 hover:text-stone-800">
                                 <X size={16} />
                             </button>
                         </div>
                    )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 border border-transparent text-base font-semibold rounded-full shadow-md text-white bg-stone-800 hover:bg-stone-700 disabled:bg-stone-400 disabled:cursor-not-allowed transition transform hover:scale-105"
                >
                  <PenSquare size={20} />
                  {isLoading ? 'AI đang chấm bài...' : 'Gửi bài chấm điểm'}
                </button>
            </div>
          </div>
        </div>
        
        {error && (
            <div className="mt-6 p-4 bg-rose-100 border-l-4 border-rose-500 text-rose-800 rounded-md">
                <p><span className="font-bold">Ôi, có lỗi rồi:</span> {error}</p>
            </div>
        )}
        
        {isLoading && <Spinner />}

        {feedback && <ResultCard feedback={feedback} />}
      </main>
    </div>
  );
};

export default App;