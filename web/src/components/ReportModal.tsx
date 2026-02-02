import { useRef, useState } from 'react';
import { X, Download, FileText, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { EvaluationResult, WorkOrderInput } from '../types/quality_inspection';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: EvaluationResult | null;
  input: WorkOrderInput;
}

export function ReportModal({ isOpen, onClose, result, input }: ReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !result) return null;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    try {
      const element = reportRef.current;
      
      // Try to generate image, with fallback to lower resolution/different format if needed
      let rawImgData: string | undefined;
      
      try {
        // First attempt: High quality PNG
        rawImgData = await toPng(element, {
          cacheBust: true,
          backgroundColor: '#ffffff',
          pixelRatio: 2, // High resolution
          width: element.offsetWidth, // STRICTLY use offsetWidth to match visual A4 width, ignoring scroll overflow
          height: element.scrollHeight,
          style: {
            height: 'auto',
            overflow: 'visible',
            maxHeight: 'none',
            boxShadow: 'none', 
            transform: 'none',
            margin: '0' // Force margin to 0 to prevent capturing centering margins
          }
        });
      } catch (e) {
        console.warn('High quality PNG generation failed, retrying with JPEG...', e);
      }

      // If PNG failed, try JPEG
      if (!rawImgData || rawImgData.length < 1000) {
         try {
           console.log('Retrying with JPEG...');
           rawImgData = await toJpeg(element, {
              cacheBust: true,
              backgroundColor: '#ffffff',
              pixelRatio: 2, 
              quality: 0.95,
              width: element.scrollWidth,
              height: element.scrollHeight,
              style: {
                height: 'auto',
                overflow: 'visible',
                maxHeight: 'none',
                boxShadow: 'none',
                transform: 'none'
              }
           });
         } catch (e) {
            console.warn('JPEG generation failed, retrying with low quality PNG...', e);
         }
      }

      // If JPEG failed, try Low Quality PNG
      if (!rawImgData || rawImgData.length < 1000) {
         console.log('Retrying with standard quality PNG...');
         rawImgData = await toPng(element, {
            cacheBust: true,
            backgroundColor: '#ffffff',
            pixelRatio: 1, 
            width: element.offsetWidth, // Use offsetWidth here too
            height: element.scrollHeight,
            style: {
              height: 'auto',
              overflow: 'visible',
              maxHeight: 'none',
              boxShadow: 'none',
              transform: 'none',
              margin: '0'
            }
         });
      }

      if (!rawImgData || rawImgData.length < 1000) {
        throw new Error('生成报告图片失败，请稍后重试');
      }
      
      // CLEANING STEP: Force convert everything to a clean JPEG via Canvas
      // This solves 'wrong PNG signature' errors by guaranteeing the data passed to jsPDF is standard
      const cleanImgData = await new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context failed'));
            return;
          }
          // Fill white background just in case
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          // Export as high quality JPEG
          resolve(canvas.toDataURL('image/jpeg', 0.98));
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = rawImgData!;
      });

      // Now we have a guaranteed valid JPEG
      const imgData = cleanImgData;
      const imgFormat = 'JPEG';

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const availableWidth = pdfWidth - (margin * 2);
      
      // Must use imgData! We validated it, but need to pass it to jsPDF
      const imgProps = pdf.getImageProperties(imgData);
      
      // Calculate scaled dimensions
      const pdfImgHeight = (imgProps.height * availableWidth) / imgProps.width;
      
      // If content fits on one page
      if (pdfImgHeight <= pdfHeight - (margin * 2)) {
        pdf.addImage(imgData, imgFormat, margin, margin, availableWidth, pdfImgHeight);
      } else {
        // Multi-page logic using Canvas slicing for better compatibility
        let heightLeft = pdfImgHeight;
        let position = 0;
        const pageContentHeight = pdfHeight - (margin * 2);
        
        // Create a temporary canvas for slicing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not create canvas context');
        
        // Calculate the scale factor between PDF points and Image pixels
        // pdfImgHeight is in PDF units (mm), imgProps.height is in pixels
        const scaleFactor = imgProps.width / availableWidth;
        
        // Set canvas width to full image width
        canvas.width = imgProps.width;
        // Set canvas height to one page worth of pixels (scaled)
        const pagePixelHeight = pageContentHeight * scaleFactor;
        canvas.height = pagePixelHeight;

        // Create an Image object from the data URL
        // We know this works because we validated it above
        const srcImg = new Image();
        srcImg.src = imgData;
        await new Promise((resolve) => { srcImg.onload = resolve; });

        // Track exact pixel position in source image
        let currentSrcY = 0;

        while (heightLeft > 0) {
          if (position > 0) {
            pdf.addPage();
          }
          
          // Determine the target height for this slice (default to full page)
          let currentSliceHeight = pagePixelHeight;
          
          // If this is not the last page, check if we need to shorten the slice to avoid cutting text
          // Only perform this check if we have enough content left to justify checking
          if (heightLeft > pageContentHeight) {
            const checkCanvas = document.createElement('canvas');
            checkCanvas.width = imgProps.width;
            checkCanvas.height = 100; // Look at bottom 100 pixels of this page
            const checkCtx = checkCanvas.getContext('2d');
            
            if (checkCtx) {
              // Draw the bottom area of what would be this page
              const potentialBottomY = currentSrcY + pagePixelHeight;
              
              // Ensure we don't read past the image end
              if (potentialBottomY <= imgProps.height) {
                  checkCtx.drawImage(srcImg, 0, potentialBottomY - 100, imgProps.width, 100, 0, 0, imgProps.width, 100);
                  const imageData = checkCtx.getImageData(0, 0, checkCanvas.width, checkCanvas.height);
                  const data = imageData.data;
                  
                  // Find white row from bottom up
                  for (let y = 99; y >= 0; y--) {
                    let isRowWhite = true;
                    // Check center 80% of width to avoid potential side borders/shadows
                    const startX = Math.floor(checkCanvas.width * 0.1);
                    const endX = Math.floor(checkCanvas.width * 0.9);
                    
                    for (let x = startX; x < endX; x += 5) { // Step by 5 for perf
                      const i = (y * checkCanvas.width + x) * 4;
                      // Strict white check: R,G,B > 250
                      if (data[i] < 250 || data[i+1] < 250 || data[i+2] < 250) {
                        isRowWhite = false;
                        break;
                      }
                    }
                    if (isRowWhite) {
                      // Found a safe cut point!
                      // Reduce slice height to cut here
                      const pixelsFromBottom = 99 - y;
                      // Add a small buffer (e.g. 5px) to ensure we cut IN the whitespace
                      currentSliceHeight -= (pixelsFromBottom + 5); 
                      break;
                    }
                  }
              }
            }
          }

          // Ensure we don't go past end of image
          // Ensure calculations result in valid numbers
          const remainingHeight = imgProps.height - currentSrcY;
          currentSliceHeight = Math.min(currentSliceHeight, remainingHeight);
          
          // Force integer height to avoid sub-pixel rendering issues
          currentSliceHeight = Math.floor(currentSliceHeight);

          // Safety check: if slice became too small (e.g. huge image with no whitespace), revert to full page
          // Also check for 0 or negative height which breaks canvas
          if (currentSliceHeight < 100 && remainingHeight >= 100) {
             currentSliceHeight = Math.min(pagePixelHeight, remainingHeight);
             currentSliceHeight = Math.floor(currentSliceHeight);
          }
          
          // Final hard stop if we ran out of pixels
          if (currentSliceHeight <= 0) break;

          // Resize canvas to fit exactly this slice
          canvas.height = currentSliceHeight;
          
          // Clear and fill white
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw the adjusted slice
          ctx.drawImage(srcImg, 0, currentSrcY, imgProps.width, currentSliceHeight, 0, 0, imgProps.width, currentSliceHeight);
          
          const sliceData = canvas.toDataURL('image/jpeg', 0.95);
          
          // Calculate PDF height for this slice safely
          let slicePdfHeight = currentSliceHeight / scaleFactor;
          
          // STRICT VALIDATION: Ensure all params passed to addImage are finite and valid
          if (!isFinite(slicePdfHeight) || slicePdfHeight <= 0.01) {
             console.warn("Invalid slice height calculated, falling back to safe minimum", slicePdfHeight);
             slicePdfHeight = 0.1; // Minimal valid height
          }
          if (!isFinite(availableWidth) || availableWidth <= 0) {
             throw new Error("Invalid PDF width detected");
          }
          
          // Centering Logic
          const xOffset = 0;
          
          try {
            pdf.addImage(sliceData, imgFormat, xOffset, 0, availableWidth, slicePdfHeight);
          } catch (e) {
            console.error("Critical error adding page slice to PDF:", e);
            // Don't crash the whole process, try to continue to next page? 
            // Or break to save at least what we have
            break; 
          }
          
          // Advance counters
          heightLeft -= slicePdfHeight; // Approximate PDF height remaining
          currentSrcY += currentSliceHeight; // Advance pixel pointer
          position++;
          
          // Safety break to prevent infinite loops
          if (position > 50) break; 
        }
      }
      
      pdf.save(`质检报告_${input.metadata.ticket_id || '未命名'}.pdf`);
    } catch (error) {
      console.error('PDF Generation failed:', error);
      // Detailed error message
      alert(`生成 PDF 失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getLevelColor = (level: string) => {
    if (level === '优秀') return 'text-green-600 bg-green-50 border-green-200';
    if (level === '合格') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (level === '存在风险') return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  // Convert single newlines to hard breaks for Markdown rendering in report
  const markdownContent = result.suggested_reply ? result.suggested_reply.replace(/\n/g, '  \n') : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-xl shrink-0">
          <div className="flex items-center gap-2 text-gray-800">
            <FileText className="text-blue-600" />
            <h2 className="text-lg font-bold">质检报告预览</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center items-start bg-gray-100">
          {/* A4 Paper Look */}
          <div 
            ref={reportRef}
            className="bg-white shadow-lg w-[210mm] min-h-[297mm] p-[15mm] text-slate-800 relative flex flex-col mx-auto shrink-0"
          >
            {/* Report Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h1 className="text-2xl font-black tracking-widest text-slate-900 mb-2">工单办理质量智能检测报告</h1>
              <p className="text-sm text-slate-500 uppercase tracking-wider">GovInsight-AI Intelligent Inspection Report</p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 block text-xs mb-1">工单编号</span>
                <span className="font-mono font-bold text-slate-700">{input.metadata.ticket_id}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 block text-xs mb-1">检测时间</span>
                <span className="font-mono font-bold text-slate-700">{new Date().toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 block text-xs mb-1">工单类别</span>
                <span className="font-bold text-slate-700">{input.metadata.category}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-100">
                <span className="text-slate-500 block text-xs mb-1">办理部门</span>
                <span className="font-bold text-slate-700">{input.metadata.handling_department}</span>
              </div>
            </div>

            {/* Work Order Details (New Section) */}
            <div className="mb-8">
              <h3 className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">一、工单详情</h3>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    群众诉求
                  </h4>
                  <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                    {input.appeal_text || '暂无内容'}
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-green-500"></span>
                     办理答复
                  </h4>
                   <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                    {input.reply_text || '暂无内容'}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Summary */}
            <div className="mb-8">
              <h3 className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">二、综合评价</h3>
              <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-lg border border-slate-100">
                <div className="text-center px-6 border-r border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">总分</div>
                  <div className={`text-4xl font-black ${
                    result.total_score >= 90 ? "text-green-600" :
                    result.total_score >= 75 ? "text-yellow-600" : "text-red-600"
                  }`}>{result.total_score}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-slate-500">评级结果:</span>
                    <span className={`px-3 py-1 rounded text-sm font-bold border ${getLevelColor(result.overall_level)}`}>
                      {result.overall_level}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">处置建议:</span>
                    {result.is_critical ? (
                      <span className="flex items-center gap-1 text-red-700 font-bold text-sm">
                        <UserCheck size={14} /> 强制人工复核
                      </span>
                    ) : result.confidence < 0.85 ? (
                      <span className="flex items-center gap-1 text-orange-600 font-bold text-sm">
                        <UserCheck size={14} /> 建议抽检
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-700 font-bold text-sm">
                        <CheckCircle size={14} /> 自动采信
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dimension Details */}
            <div className="mb-8">
              <h3 className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">三、分项指标详情</h3>
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="p-3 border-b font-bold">指标维度</th>
                    <th className="p-3 border-b font-bold w-24 text-center">得分</th>
                    <th className="p-3 border-b font-bold w-24 text-center">满分</th>
                    <th className="p-3 border-b font-bold">评估理由</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: '答非所问', key: 'relevance', max: 30 },
                    { name: '回复逻辑', key: 'logic', max: 30 },
                    { name: '回复态度', key: 'attitude', max: 20 },
                    { name: '解决情况', key: 'solution', max: 10 },
                    { name: '办理时效', key: 'timeliness', max: 10 },
                  ].map((item) => {
                    const scoreData = result.scores[item.key as keyof typeof result.scores];
                    return (
                      <tr key={item.key}>
                        <td className="p-3 font-medium text-slate-700">{item.name}</td>
                        <td className="p-3 text-center font-bold">{scoreData?.score ?? '-'}</td>
                        <td className="p-3 text-center text-slate-400">{item.max}</td>
                        <td className="p-3 text-slate-600 text-xs leading-relaxed">{scoreData?.judgement ?? '暂无评价'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Critical Reasons (Forced Review Reasons) */}
            {result.is_critical && result.critical_reasons && result.critical_reasons.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-lg border-l-4 border-red-600 pl-3 mb-4">四、强制复核原因</h3>
                <div className="bg-red-50 p-4 rounded border border-red-100">
                  <ul className="list-disc pl-5 space-y-2">
                    {result.critical_reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-red-800 font-medium">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Risk Warnings */}
            {(result.typo_check.typos.length > 0 || result.sensitive_word_check.has_sensitive_word) && (
              <div className="mb-8">
                <h3 className="font-bold text-lg border-l-4 border-orange-500 pl-3 mb-4">五、风险提示</h3>
                <div className="space-y-3">
                  {result.typo_check.typos.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded border border-orange-100">
                      <h4 className="font-bold text-orange-800 text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle size={14} /> 错别字检测
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.typo_check.typos.map((t, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-orange-200 text-orange-700">
                            {t.error} &rarr; {t.correct}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.sensitive_word_check.has_sensitive_word && (
                    <div className="bg-red-50 p-4 rounded border border-red-100">
                      <h4 className="font-bold text-red-800 text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle size={14} /> 敏感词检测
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.sensitive_word_check.words.map((w, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-red-200 text-red-700">
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggestion */}
            <div className="mb-8">
              <h3 className="font-bold text-lg border-l-4 border-blue-600 pl-3 mb-4">六、改进建议</h3>
              <div className="bg-blue-50 p-4 rounded border border-blue-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
                <h4 className="font-bold text-blue-800 mb-2">综合建议：</h4>
                {result.suggestion}
              </div>
              
              {result.suggested_reply && (
                <div className="bg-green-50 p-4 rounded border border-green-100 text-sm text-slate-700 leading-relaxed">
                  <h4 className="font-bold text-green-800 mb-2">AI 优化回复参考：</h4>
                  <div className="text-slate-700">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-strong:text-green-800 prose-strong:font-bold prose-li:my-0"
                      components={{
                        // Override strong to ensure it's bold and colored
                        strong: ({node, ...props}) => <strong className="font-bold text-green-800" {...props} />
                      }}
                    >
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
              <p>本报告由 GovInsight-AI 智能质检系统自动生成，仅供参考。</p>
              <p>生成时间: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-white rounded-b-xl flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
          >
            关闭
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-6 py-2 bg-blue-600 border border-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                生成中...
              </>
            ) : (
              <>
                <Download size={18} />
                下载 PDF 报告
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
