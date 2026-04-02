/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Image as ImageIcon, Loader2, Copy, Check, Sparkles, AlertCircle, Settings, X, RotateCcw } from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SYSTEM_INSTRUCTION = `Bạn là một chuyên gia phân tích creative quảng cáo và viết prompt tạo ảnh theo hướng compliant, informational, soft-sell, native, và tối ưu để dùng với AI tạo ảnh.
KHI TÔI UPLOAD 1 ẢNH, NHIỆM VỤ CỦA BẠN LÀ LÀM ĐÚNG THEO QUY TRÌNH SAU:
========================
I. MỤC TIÊU CHÍNH
Phân tích ảnh tôi gửi để hiểu:
ngách / niche của quảng cáo
ngôn ngữ chính của ảnh
bố cục tổng thể
headline chính
subheadline / supporting text
kiểu CTA hiện tại
kiểu visual hero image hiện tại
xem ảnh có đang mang cảm giác quảng cáo quá mạnh hay không
xem có phần nào nên chuyển sang dạng gạch đầu dòng thông tin để nhìn compliant, tự nhiên và ít mang tính dụ nhấp hơn không
Tự đề xuất cho tôi 4 ý thông tin phù hợp nhất với ngách đó, sao cho:
đúng insight người xem
hợp niche
ngắn
dễ đưa vào bố cục
thu hút nhưng không giật gân
compliant
informational
không hard-sell
không mang nghĩa giao dịch quá mạnh
không giống nút bấm / option click
Sau đó tạo cho tôi 5 prompt hoàn chỉnh để AI tạo ảnh, theo đúng yêu cầu visual của tôi và theo đúng form của ảnh gốc hoặc form phù hợp nhất với ngách.
========================
II. NGUYÊN TẮC BẮT BUỘC
A. Về compliant / rule
Phải luôn ưu tiên:
informational
soft-sell
compliant
native ad feeling
không exaggerate mạnh
không hứa hẹn kết quả
không đảm bảo hiệu quả
không dùng wording quá hard CTA
không tạo cảm giác giao dịch trực tiếp nếu không cần thiết
không trình bày nội dung theo kiểu khiến người xem có cảm giác phải bấm chọn ngay
Tuyệt đối tránh các CTA hoặc wording kiểu:
Hiring Now, Apply Today, Open Positions, Search Jobs
Instant Interview, Book Now, Join Now
Get Results Fast, Guaranteed Results, Instant Approval
Start Today, Free Money, Earn $...
Cure / Fix / Prevent tuyệt đối nếu mang nghĩa claim mạnh
Click here, Tap below, Choose now, Get started
mọi kiểu wording quá hứa hẹn, quá trực diện, quá transactional
Nếu niche là health / finance / jobs / clinical trial / education / support services thì càng phải dùng ngôn ngữ mềm, trung tính, informational hơn.
B. Về khối thông tin dạng gạch đầu dòng
Mặc định ưu tiên:
4 ý thông tin ngắn
trình bày như các nhóm thông tin nổi bật
không trình bày như button, tab, option card, selector, checklist CTA
mỗi ý nhìn như 1 bullet point thông tin, không phải lựa chọn để bấm
Mỗi gạch đầu dòng phải:
ngắn, rõ, dễ đọc
từ 2 đến 6 từ nếu có thể
đúng insight của niche
mang tính mô tả / định hướng thông tin
không mang nghĩa giao dịch trực tiếp
không dùng động từ thúc ép hành động quá mạnh
Không dùng dòng CTA nhỏ bên dưới từng bullet.
Không dùng “Learn more” dưới từng dòng.
Không làm mỗi bullet trông giống 1 card có tính click.
C. Về top line
Mặc định thêm một dòng nhỏ ở trên đỉnh ảnh, mang nghĩa:
“Read more about” hoặc
“More to know about” hoặc
“A closer look at”
(Dịch sang đúng ngôn ngữ gốc của creative, theo cách tự nhiên nhất.)
D. Về ngôn ngữ
Chỉ dùng 1 ngôn ngữ duy nhất theo ngôn ngữ gốc của ảnh / ngách.
Không trộn 2 ngôn ngữ.
E. Về visual / hero image
Mặc định hero image phải đi theo hướng:
real people, candid moment, documentary photography, editorial realism
indoor real-life setting khi phù hợp, natural interaction, authentic expressions
believable environment, not posed like a fashion ad
not illustration, cartoon, vector, flat design, or overly polished AI beauty style
Nếu ảnh mẫu dạng split-screen transformation:
bám đúng kiểu split-screen (cùng 1 người / 2 trạng thái, contrast rõ, background tối giản, vibe viral native social, wording compliant)
F. Về Headline / Câu Hook chính (CỰC KỲ QUAN TRỌNG)
Khi tạo hoặc tối ưu Headline chính cho ngách, KHÔNG dùng các câu trần thuật nhàm chán. Luôn áp dụng 1 trong 3 công thức tạo sự tò mò (Curiosity Gap) và an toàn (compliant) sau đây (dịch sang đúng ngôn ngữ của ảnh):
The "Is This" Challenger
Cấu trúc:
"Is This + [Tên Thương hiệu/Chủ đề] + [Tính từ tò mò nhất] + [Sản phẩm/Giải pháp] + Yet?"
The "Why Are..." Shift
Cấu trúc:
"Why Are + [Tệp khách hàng] + Switching To + [Khái niệm mới/Sản phẩm]?"
The "Unseen/Hidden" Discovery
Cấu trúc:
"A Look Inside + [Sự vật/Sự việc/Sản phẩm] + You Didn't Know About."
Lưu ý:
Ưu tiên hook mang tính khám phá, tìm hiểu, quan sát
Không dùng hook mang sắc thái khẳng định mạnh
Không tạo cảm giác lừa nhấp hoặc giật tít quá đà
Hook phải hợp với phần nội dung gạch đầu dòng bên dưới
========================
III. CÁCH PHÂN TÍCH ẢNH
Khi tôi gửi ảnh, bạn phải tự phân tích:
Đây là ngách gì?
Ngôn ngữ chính là gì?
Headline hiện tại đã đủ thu hút chưa? (Phải áp dụng 3 công thức Hook ở mục II.F để chọn ra câu Hook bén nhất nhưng vẫn compliant.)
Hero image hiện tại đang truyền thông điệp gì?
Bối cục hiện tại là kiểu nào? Có nên chuyển sang form headline + 4 gạch đầu dòng thông tin không?
4 gạch đầu dòng nào là hợp nhất với ngách này?
Top line nên dùng từ gì theo đúng ngôn ngữ gốc?
Hero image mới nên đi theo bối cảnh nào để đúng ngách và thu hút hơn?
Có điểm nào cần tránh để sạch rule hơn?
Có chi tiết nào đang khiến bố cục giống quảng cáo click-driven quá mức không?
========================
IV. CÁCH TRẢ KẾT QUẢ
CHỈ TRẢ VỀ DUY NHẤT 5 PROMPT HOÀN CHỈNH TRONG MỘT KHỐI VĂN BẢN.
TUYỆT ĐỐI KHÔNG TRẢ VỀ PHẦN PHÂN TÍCH NGÁCH, NGÔN NGỮ, HAY GỢI Ý BULLET TRONG KẾT QUẢ CUỐI CÙNG.
KHÔNG GIẢI THÍCH GÌ THÊM.
TUYỆT ĐỐI KHÔNG DÙNG CÁC NHÃN NHƯ "Prompt:", "Text:", "Visual:", "Layout:", "Negative Instructions:", "Headline:".
========================
V. CÁCH VIẾT 5 PROMPT (LƯU Ý ĐẶC BIỆT VỀ FORMAT)
Bạn phải tổng hợp thành 1 block prompt duy nhất để tôi dễ copy.
5 prompt phải nằm trong 1 ô copy.
Mỗi prompt cách nhau 1 dòng trống.
Mỗi prompt phải được viết liền thành 1 dòng duy nhất (không ngắt dòng giữa chừng trong cùng 1 prompt).
Mỗi prompt là một đoạn mô tả hình ảnh (visual description) lồng ghép nội dung chữ (exact text to display) một cách tự nhiên.
Ghi rõ nội dung chữ cần hiển thị, layout, visual style, negative instructions lồng ghép vào trong 1 câu/đoạn duy nhất, không chia mục.
Phần text hiển thị trong prompt phải ưu tiên:
1 top line nhỏ
1 headline chính
4 gạch đầu dòng thông tin ngắn
Không trình bày text theo kiểu option card, button, selector, hoặc UI choice block trừ khi tôi yêu cầu rõ.
========================
VI. LOGIC CHỌN BULLET INFORMATION
Bullet bám đúng insight chính của niche.
Bullet phải ngắn, dễ đọc, dễ cân layout.
Bullet phải mang tính thông tin, không mang tính hành động.
Nếu niche nhạy cảm (health, finance, jobs...), bullet càng phải informational và trung tính hơn.
4 bullet nên tạo cảm giác “những điều đáng chú ý / những chủ điểm chính / các nhóm thông tin nổi bật”, không phải “các lựa chọn để bấm”.
========================
VII. MẶC ĐỊNH VỀ THIẾT KẾ
Ảnh vuông 1080x1080, mobile-first.
Headline rõ, đậm.
Bên dưới là 4 gạch đầu dòng thông tin rõ ràng, clean spacing, dễ đọc.
Có thể dùng text block nền sáng/tối nhẹ để tăng readability, nhưng không làm thành 4 card dạng nút bấm.
Thiết kế tối giản, native, clean, editorial, compliant.
========================
VIII. NEGATIVE INSTRUCTIONS MẶC ĐỊNH
Tránh:
illustration
cartoon
fake logos
watermark
extra text
overdesigned clutter
hard CTA buttons
option cards that look clickable
tab UI
app-like selector boxes
unrealistic anatomy
AI plastic skin
========================
IX. KHI TÔI CHỈ MUỐN THAY ẢNH HERO
Nếu tôi bảo "chỉ thay hero", giữ nguyên 100% text gốc và form, chỉ đổi visual (đảm bảo real-life / compliant).
========================
X. ĐIỀU QUAN TRỌNG NHẤT
Hành động như một chuyên gia:
tự phân tích niche
chọn hook tốt nhất từ 3 công thức
chọn 4 gạch đầu dòng phù hợp nhất
giữ đúng ngôn ngữ
tối ưu bố cục để nhìn như nội dung thông tin tự nhiên, không giống clickbait ad
viết 5 prompt chuẩn format 1 dòng
Không trả lời chung chung.
Bây giờ hãy chờ tôi gửi ảnh và bắt đầu làm đúng toàn bộ quy trình trên.`;

export default function App() {
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<number, string>>({});
  const [failedIndices, setFailedIndices] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(() => {
    try {
      const saved = localStorage.getItem('system_prompt');
      return saved || SYSTEM_INSTRUCTION;
    } catch (e) {
      return SYSTEM_INSTRUCTION;
    }
  });

  // Explicit save function
  const saveSystemPrompt = (newPrompt: string) => {
    setSystemPrompt(newPrompt);
    try {
      localStorage.setItem('system_prompt', newPrompt);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  // Save system prompt to localStorage when it changes (auto-save)
  React.useEffect(() => {
    try {
      localStorage.setItem('system_prompt', systemPrompt);
    } catch (e) {
      // Silent fail for auto-save
    }
  }, [systemPrompt]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      let loadedCount = 0;

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            setImages(prev => {
              const updated = [...prev, ...newImages];
              if (selectedIndex === null && updated.length > 0) {
                setSelectedIndex(0);
              }
              return updated;
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (selectedIndex === index) {
        setSelectedIndex(updated.length > 0 ? 0 : null);
      } else if (selectedIndex !== null && selectedIndex > index) {
        setSelectedIndex(selectedIndex - 1);
      }
      return updated;
    });
    // Also remove result and shift keys if exists
    setResults(prev => {
      const newResults: Record<number, string> = {};
      Object.entries(prev).forEach(([key, value]) => {
        const k = parseInt(key);
        if (k < index) {
          newResults[k] = value;
        } else if (k > index) {
          newResults[k - 1] = value;
        }
      });
      return newResults;
    });
    
    // Update failedIndices
    setFailedIndices(prev => {
      const filtered = prev.filter(i => i !== index);
      return filtered.map(i => i > index ? i - 1 : i);
    });
  };

  const generateAllPrompts = async () => {
    if (images.length === 0) return;

    setLoading(true);
    setError(null);
    setFailedIndices([]);

    // Process images one by one
    for (let i = 0; i < images.length; i++) {
      await processImage(i);
    }
    
    setLoading(false);
  };

  const retryFailedPrompts = async () => {
    if (failedIndices.length === 0) return;

    const toRetry = [...failedIndices];
    setLoading(true);
    setError(null);
    setFailedIndices([]); // Clear current failures as we retry them

    for (const i of toRetry) {
      await processImage(i);
    }

    setLoading(false);
  };

  const processImage = async (i: number) => {
    setSelectedIndex(i); // Focus on current image being processed
    setResults(prev => ({ ...prev, [i]: "" }));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const imageData = images[i];
      const base64Data = imageData.split(',')[1];
      const mimeType = imageData.split(';')[0].split(':')[1];

      const responseStream = await ai.models.generateContentStream({
        model: model,
        contents: [
          {
            parts: [
              { text: "Hãy phân tích ảnh này và tạo 5 prompt theo đúng quy trình đã được thiết lập." },
              { inlineData: { data: base64Data, mimeType } }
            ]
          }
        ],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.4,
        }
      });

      let fullText = "";
      for await (const chunk of responseStream) {
        const chunkText = chunk.text || "";
        fullText += chunkText;
        setResults(prev => ({ ...prev, [i]: fullText }));
      }
      
      // If we got here, it succeeded, so ensure it's not in failedIndices
      setFailedIndices(prev => prev.filter(idx => idx !== i));
    } catch (err) {
      console.error(`Error processing image ${i}:`, err);
      setFailedIndices(prev => [...new Set([...prev, i])]);
      setError(`Lỗi khi xử lý một số ảnh. Bạn có thể thử lại các ảnh bị lỗi.`);
    }
  };

  const currentResult = selectedIndex !== null ? results[selectedIndex] : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAllPrompts = () => {
    const allPrompts = Object.values(results)
      .map(res => extractPrompts(res))
      .filter(p => p.length > 0)
      .join("\n\n");
    
    if (allPrompts) {
      copyToClipboard(allPrompts);
    }
  };

  const extractPrompts = (text: string) => {
    // Clean up markdown code blocks if present
    let cleaned = text.replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```/g, '').trim();
    });

    // Remove common labels that AI might add despite instructions
    const labelsToRemove = [
      /^Prompt\s*\d*[:\s-]*/gim,
      /^Text[:\s-]*/gim,
      /^Visual[:\s-]*/gim,
      /^Layout[:\s-]*/gim,
      /^Negative\s*Instructions[:\s-]*/gim,
      /^Headline[:\s-]*/gim,
      /^Visual\s*Description[:\s-]*/gim
    ];

    let final = cleaned;
    labelsToRemove.forEach(regex => {
      final = final.replace(regex, '');
    });

    return final.trim();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
          <div className="flex-1 hidden sm:flex items-center">
            {/* Left side empty for balance */}
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center gap-1"
          >
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-200"
              >
                <Sparkles className="text-white w-7 h-7" />
              </motion.div>
              <motion.h1 
                className="font-black text-3xl sm:text-4xl tracking-tighter text-[#1A1A1A] whitespace-nowrap"
              >
                Master Promt <span className="text-orange-500">By Ival Nguyen</span>
              </motion.h1>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-[11px] font-mono text-gray-400 uppercase tracking-[0.3em] hidden sm:block"
            >
              Professional Prompt Engineering Tool
            </motion.div>
          </motion.div>

          <div className="flex-1 flex justify-end items-center">
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPromptEditor(true)}
              className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-orange-500"
              title="Chỉnh sửa Prompt gốc"
            >
              <Settings className="w-7 h-7" />
            </motion.button>
          </div>
        </div>
      </header>

      {/* Prompt Editor Modal */}
      {showPromptEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-lg">Cấu hình System Prompt</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => saveSystemPrompt(SYSTEM_INSTRUCTION)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Khôi phục mặc định
                </button>
                <button 
                  onClick={() => setShowPromptEditor(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <p className="text-sm text-gray-500 mb-4">
                Đây là hướng dẫn cốt lõi điều khiển AI. Bạn có thể thay đổi quy trình, số lượng prompt, hoặc các nguyên tắc bắt buộc tại đây.
              </p>
              <textarea 
                value={systemPrompt}
                onChange={(e) => saveSystemPrompt(e.target.value)}
                className="w-full h-[500px] p-4 font-mono text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none bg-gray-50"
                placeholder="Nhập System Instruction tại đây..."
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={() => {
                  saveSystemPrompt(systemPrompt);
                  setShowPromptEditor(false);
                }}
                className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-200/50"
              >
                Lưu và Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Preview */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Creative Gallery ({images.length})
                </h2>
                {images.length > 0 && (
                  <button 
                    onClick={() => { setImages([]); setSelectedIndex(null); setResults({}); }}
                    className="text-[10px] font-bold text-red-500 uppercase tracking-wider hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>
              
              {/* Main Preview */}
              <div 
                onClick={() => images.length === 0 && fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-square rounded-xl border-2 border-dashed transition-all overflow-hidden group mb-4",
                  images.length > 0 ? "border-orange-500 bg-orange-50/30" : "border-gray-200 hover:border-orange-400 hover:bg-gray-50 cursor-pointer"
                )}
              >
                {selectedIndex !== null && images[selectedIndex] ? (
                  <img src={images[selectedIndex]} alt="Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-gray-400 group-hover:text-orange-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Kéo thả hoặc nhấp để tải ảnh</p>
                    <p className="text-xs text-gray-400 mt-1">Hỗ trợ JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>

              {/* Thumbnails Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-4 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img 
                        src={img} 
                        onClick={() => setSelectedIndex(idx)}
                        className={cn(
                          "w-full h-full object-cover rounded-lg cursor-pointer border-2 transition-all",
                          selectedIndex === idx ? "border-orange-500 scale-95" : 
                          failedIndices.includes(idx) ? "border-red-500" : "border-transparent hover:border-orange-200"
                        )}
                        referrerPolicy="no-referrer"
                      />
                      {failedIndices.includes(idx) && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm pointer-events-none">
                          <AlertCircle className="w-3 h-3" />
                        </div>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <span className="text-[10px] font-bold">×</span>
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-orange-400 hover:bg-gray-50 transition-all"
                  >
                    <Upload className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                multiple
                className="hidden" 
              />

              <button
                disabled={images.length === 0 || loading}
                onClick={generateAllPrompts}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                  images.length === 0 || loading 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                    : "bg-[#1A1A1A] text-white hover:bg-orange-600 shadow-lg shadow-orange-200/50"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý {selectedIndex !== null ? selectedIndex + 1 : ""}/{images.length}...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {Object.keys(results).length > 0 ? "Phân tích lại tất cả" : `Phân tích tất cả ${images.length} ảnh`}
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex flex-col gap-2 text-red-600 text-xs">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                  {failedIndices.length > 0 && (
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-red-200">
                      <span className="font-bold">Số ảnh lỗi: {failedIndices.length}</span>
                      <button 
                        onClick={retryFailedPrompts}
                        disabled={loading}
                        className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-3 h-3" /> Thử lại các ảnh lỗi
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="bg-[#1A1A1A] text-white rounded-2xl p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-3">Quy trình AI</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex gap-3">
                  <span className="text-orange-500 font-mono">01</span>
                  <span>Phân tích ngách & ngôn ngữ gốc</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-500 font-mono">02</span>
                  <span>Tối ưu Headline theo Curiosity Gap</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-500 font-mono">03</span>
                  <span>Đề xuất 4 gạch đầu dòng Compliant</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-orange-500 font-mono">04</span>
                  <span>Xuất 5 prompt 1-line chuẩn format</span>
                </li>
              </ul>
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            {Object.keys(results).length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Kết quả phân tích ({Object.keys(results).length})
                </h2>
                <button 
                  onClick={copyAllPrompts}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
                >
                  <Copy className="w-3.5 h-3.5" /> Sao chép tất cả prompt
                </button>
              </div>
            )}

            {images.length === 0 && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-white/50 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <ImageIcon className="w-8 h-8 text-gray-200" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Chưa có dữ liệu</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs">
                  Tải ảnh quảng cáo của bạn lên để bắt đầu quy trình phân tích và tạo prompt chuyên nghiệp.
                </p>
              </div>
            )}

            {images.length > 0 && Object.keys(results).length === 0 && !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Sẵn sàng phân tích</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs">
                  Chọn ảnh và nhấn nút "Tạo 5 Prompt Chuyên Nghiệp" để bắt đầu xử lý.
                </p>
              </div>
            )}

            <div className="space-y-8">
              {images.map((img, idx) => {
                const result = results[idx];
                if (!result && idx !== selectedIndex) return null;
                if (!result && idx === selectedIndex && !loading) return null;

                return (
                  <div key={idx} className={cn(
                    "space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
                    selectedIndex === idx ? "ring-2 ring-orange-500 ring-offset-4 rounded-2xl" : ""
                  )}>
                    {/* Result Block */}
                    <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden shadow-xl border border-white/5">
                      <div className="px-6 py-4 bg-[#262626] border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10">
                            <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <h2 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                            Creative #{idx + 1} {loading && selectedIndex === idx && <Loader2 className="w-3 h-3 animate-spin inline ml-2" />}
                          </h2>
                        </div>
                        {result && (
                          <button 
                            onClick={() => copyToClipboard(extractPrompts(result))}
                            className={cn(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                              copied && selectedIndex === idx ? "bg-green-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                            )}
                          >
                            {copied && selectedIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied && selectedIndex === idx ? "Đã sao chép!" : "Sao chép block này"}
                          </button>
                        )}
                      </div>
                      <div className="p-6">
                        {loading && selectedIndex === idx && !result ? (
                          <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Đang xử lý...</p>
                          </div>
                        ) : (
                          <div className="bg-black/30 rounded-xl p-4 font-mono text-[13px] leading-relaxed text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-[500px] custom-scrollbar">
                            {result ? extractPrompts(result) : "Đang chờ phân tích..."}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-200 mt-12 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2 text-orange-500">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Master Promt By Ival Nguyen</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            Powered by Gemini 3.0 Flash & Master Promt Expert Logic
          </p>
        </motion.div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
