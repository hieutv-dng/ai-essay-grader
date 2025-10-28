import React, { useMemo } from 'react';
import type { ParsedFeedback, CriterionFeedback } from '../types';
import { Lightbulb } from 'lucide-react';

interface ResultCardProps {
  feedback: string;
}

const parseFeedback = (markdownText: string): ParsedFeedback | null => {
  try {
    const sections = markdownText.split(/\n\*\*([A-ZÀ-ỹ\s\d.]+)\*\*/);
    if (sections.length < 5) return null;

    const overview = sections[0].replace('**I. Nhận xét tổng quan**\n', '').trim();
    
    const detailsText = sections[2].replace(' Phân tích chi tiết**\n', '').trim();
    const detailRows = detailsText.split('\n').slice(2);
    const details: CriterionFeedback[] = detailRows.map(row => {
      const parts = row.split('|').map(p => p.trim());
      return {
        name: parts[1] || '',
        score: parts[2] || '',
        comment: parts[3] || ''
      };
    });

    const totalScore = sections[4].replace(' Tổng điểm & Xếp loại**\n', '').replace(/`/g, '').trim();
    const suggestions = sections[6].replace(' Gợi ý cải thiện**\n', '').trim();

    return { overview, details, totalScore, suggestions };
  } catch (error)
  {
    console.error("Failed to parse feedback:", error);
    return null;
  }
};

const markdownToHtml = (markdown: string): string => {
    let html = markdown;

    // Process tables first as they are multi-line entities
    const tableRegex = /^\|(.+)\|\s*\r?\n\|( *[-:]+ *\|)+((?:\s*\r?\n\|.*\|)*)/gm;
    html = html.replace(tableRegex, (tableMatch) => {
        const rows = tableMatch.trim().split('\n');
        if (rows.length < 2) return tableMatch;

        const headerCells = rows[0]
            .split('|').slice(1, -1)
            .map(cell => `<th class="px-4 py-2 text-left font-semibold text-stone-900 bg-stone-100">${cell.trim()}</th>`).join('');

        const bodyRows = rows.slice(2)
            .map(row => `<tr>${row.split('|').slice(1, -1).map(cell => `<td class="px-4 py-2 border-t border-stone-200 text-stone-800 bg-white">${cell.trim()}</td>`).join('')}</tr>`).join('');

        return `<div class="overflow-x-auto my-4">
                    <table class="w-full border-collapse border border-stone-200 rounded-lg text-stone-900">
                        <thead><tr>${headerCells}</tr></thead>
                        <tbody>${bodyRows}</tbody>
                    </table>
                </div>`;
    });
    
    const parts = html.split(/(<div class="overflow-x-auto.*?<\/div>)/s);
    
    for (let i = 0; i < parts.length; i++) {
        if (!parts[i].startsWith('<div')) {
            parts[i] = parts[i]
                .replace(/^\*\*(I+\..*?)\*\*/gm, '<h3 class="text-xl font-bold text-stone-800 mt-6 mb-3">$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.*?)`/g, '<code class="bg-stone-100 text-stone-800 px-2 py-1 rounded-md text-sm font-mono">$1</code>')
                .replace(/\n/g, '<br />');
        }
    }
    
    return parts.join('');
};


const ResultCard: React.FC<ResultCardProps> = ({ feedback }) => {
  const parsedData = useMemo(() => parseFeedback(feedback), [feedback]);

  if (!parsedData) {
    const htmlToRender = markdownToHtml(feedback);
    return (
      <div className="mt-10 rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">Kết quả đánh giá</h2>
        <div
            className="text-stone-700 font-sans leading-relaxed prose prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlToRender }}
        />
      </div>
    );
  }

  const getScoreColor = (scoreLine: string) => {
    if (scoreLine.includes('Xuất sắc')) return 'text-emerald-800 bg-emerald-100';
    if (scoreLine.includes('Tốt')) return 'text-sky-800 bg-sky-100';
    if (scoreLine.includes('Đạt')) return 'text-amber-800 bg-amber-100';
    if (scoreLine.includes('Cần cố gắng')) return 'text-rose-800 bg-rose-100';
    return 'text-stone-700 bg-stone-100';
  }

  return (
    <div className="mt-12 animate-fade-in">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-2xl backdrop-blur-xl">
            <div className="p-6 md:p-8 bg-gradient-to-r from-white/95 to-amber-50/80">
                <h2 className="text-2xl font-bold text-stone-900 mb-4 pb-2 border-b-2 border-amber-300 inline-block">I. Nhận xét tổng quan</h2>
                <p className="text-stone-700 leading-relaxed mt-4">{parsedData.overview}</p>
            </div>

            <div className="bg-white/75 p-6 md:p-8 border-y border-stone-200/60">
                <h2 className="text-2xl font-bold text-stone-900 mb-5 pb-2 border-b-2 border-amber-300 inline-block">II. Phân tích chi tiết</h2>
                <div className="space-y-4 mt-4">
                    {parsedData.details.map((item, index) => (
                        <div key={index} className="bg-white/95 p-4 rounded-xl border border-stone-200/80 transition hover:shadow-lg hover:border-amber-300">
                            <div className="flex justify-between items-start gap-4">
                                <h3 className="font-bold text-stone-900 text-base">{item.name}</h3>
                                <span className="text-sm font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full whitespace-nowrap">{item.score}</span>
                            </div>
                            <p className="text-stone-600 mt-1 text-sm">{item.comment}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8 items-start bg-white/85">
                <div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-4 pb-2 border-b-2 border-amber-300 inline-block">III. Tổng điểm</h2>
                    <div className={`text-lg font-bold px-4 py-2 mt-4 rounded-lg inline-block shadow-sm ${getScoreColor(parsedData.totalScore)}`}>
                        {parsedData.totalScore}
                    </div>
                </div>
                <div className="bg-amber-50/80 border border-amber-200/80 p-5 rounded-2xl shadow-inner">
                    <h2 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <Lightbulb size={20} />
                      <span>IV. Gợi ý cải thiện</span>
                    </h2>
                    <p className="text-amber-800 leading-relaxed text-sm">{parsedData.suggestions}</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ResultCard;