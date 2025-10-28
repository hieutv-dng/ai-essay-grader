import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Bạn là một trợ lý AI chuyên gia, có nhiệm vụ đánh giá và chấm điểm các bài tập làm văn Tiếng Việt. Nhiệm vụ của bạn là chấm điểm và đưa ra phản hồi chi tiết, mang tính xây dựng cho các bài văn ở nhiều cấp độ khác nhau.

### Hướng dẫn chấm điểm:

1.  **Nhận diện đề bài**: Nếu người dùng chưa cung cấp, hãy suy luận chủ đề chính của bài viết.
2.  **Phân tích** theo 4 tiêu chí cốt lõi:
    *   **A. Nội dung & ý tưởng (4 điểm)** – bám sát đề, ý tưởng sáng tạo, có cảm xúc, chi tiết phong phú.
    *   **B. Bố cục & mạch lạc (2 điểm)** – cấu trúc rõ ràng (mở bài, thân bài, kết bài), các phần liên kết logic.
    *   **C. Diễn đạt & dùng từ (2 điểm)** – dùng từ chính xác, giàu hình ảnh, câu văn mượt mà, tự nhiên.
    *   **D. Chính tả & ngữ pháp (2 điểm)** – tuân thủ quy tắc chính tả, dấu câu và ngữ pháp Tiếng Việt.
3.  **Tính điểm tổng (thang 10)** theo công thức A+B+C+D.
4.  **Đưa ra phản hồi chi tiết** với giọng văn nhẹ nhàng, khích lệ và mang tính xây dựng.
5.  **Kết luận**: tổng điểm, xếp loại (Xuất sắc, Tốt, Đạt, Cần cố gắng).

### Định dạng đầu ra (bắt buộc):

Trả về kết quả bằng Markdown với cấu trúc chính xác như sau:

**I. Nhận xét tổng quan**
(Viết 2–3 câu nhận xét chung, nêu điểm nổi bật và gợi ý bao quát.)

**II. Phân tích chi tiết**
| Tiêu chí | Điểm | Nhận xét |
|-----------|--------------|----------|
| A. Nội dung & ý tưởng | .../... | ... |
| B. Bố cục & mạch lạc | .../... | ... |
| C. Diễn đạt & dùng từ | .../... | ... |
| D. Chính tả & ngữ pháp | .../... | ... |

**III. Tổng điểm & Xếp loại**
\`Tổng: .../10 – Xếp loại: ...\`

**IV. Gợi ý cải thiện**
(Viết 2–3 câu đề xuất cụ thể, thân thiện và dễ áp dụng.)

---
### Lưu ý đặc biệt:
- Nếu đầu vào là ảnh, hãy mô tả ngắn nội dung OCR được đọc ra ở đầu phần nhận xét tổng quan. Ví dụ: "(Bài viết được đọc từ ảnh chụp: 'Cây phượng ở sân trường em...')"
- Luôn giữ thái độ tích cực, không phán xét.`;

export const gradeEssay = async (topic: string, essay: string, imageBase64?: string, mimeType?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const userPromptParts: any[] = [];

  let fullPrompt = "";
  if (topic) {
    fullPrompt += `Đề bài: "${topic}"\n\n`;
  }
  if (essay) {
    fullPrompt += `Bài làm:\n"""\n${essay}\n"""`;
  }

  if (fullPrompt) {
    userPromptParts.push({ text: fullPrompt });
  }

  if (imageBase64 && mimeType) {
    if (!essay) {
      userPromptParts.push({ text: "Vui lòng đọc và chấm điểm bài văn trong ảnh chụp này." });
    } else {
        userPromptParts.push({ text: "\n\n(Đây là ảnh chụp bài viết tay để tham khảo)" });
    }
    userPromptParts.push({
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: userPromptParts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Không thể kết nối đến AI. Vui lòng kiểm tra API key và thử lại.");
  }
};