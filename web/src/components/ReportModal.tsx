import { useRef, useState } from 'react';
import { X, Download, FileText, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
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
      
      // Use html-to-image instead of html2canvas for better compatibility with modern CSS (like oklch colors in Tailwind v4)
      const imgData = await toPng(element, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2 // High resolution
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const availableWidth = pdfWidth - (margin * 2);
      const imgProps = pdf.getImageProperties(imgData);
      
      // Calculate scaled dimensions
      const pdfImgHeight = (imgProps.height * availableWidth) / imgProps.width;
      
      // If content height is less than one page
      if (pdfImgHeight <= pdfHeight - (margin * 2)) {
        pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, pdfImgHeight);
      } else {
        // Multi-page logic
        let heightLeft = pdfImgHeight;
        let page = 0;

        while (heightLeft > 0) {
          if (page > 0) {
            pdf.addPage();
          }
          
          // Add image at current position (negative Y moves image up to show next section)
          // We render the whole image but with a negative offset
          // Note: This is a simple "slice" approach. 
          // Ideally we would rerender specific parts, but html2canvas captures whole.
          // jsPDF clipping is tricky, but adding image with negative Y works for simple cases
          // However, standard addImage doesn't crop.
          // Better approach for multi-page long image:
          // Just place the image and let it overflow? No, jsPDF won't split it.
          // We need to calculate how much to shift.
          
          // Actually, a safer robust way for long reports is to just let it fit width and 
          // let the user handle printing if they want perfectly cut pages, 
          // OR use a different approach.
          // But for "download pdf error", often it's because the canvas is too big.
          
          // Let's try the simple fit-width first. 
          // If it's failing, it might be the canvas size.
          // Let's add try-catch around toDataURL too.
          
          // Reverting to simple single page scaling for now if it fits, 
          // but if it's super long, we might need to split.
          // Let's implement a basic splitting strategy:
          
          const pageHeight = pdfHeight - (margin * 2);
          
          // For the first page
          if (page === 0) {
            pdf.addImage(imgData, 'PNG', margin, margin, availableWidth, pdfImgHeight);
            heightLeft -= pageHeight;
          } else {
            // This is tricky with just one big image. 
            // A common workaround is adding the same image shifted up, 
            // but masking is hard in jsPDF.
            // Let's stick to single page but maybe Auto-Height PDF?
            // jsPDF allows custom page size.
          }
           
          // If we just want it to work without error, let's make the PDF page as tall as needed!
          // This is the best "digital report" experience.
          break; // Break loop, we will handle custom page size below
        }
      }
      
      // ALTERNATIVE: Create a PDF with custom height matching the content
      if (pdfImgHeight > pdfHeight - (margin * 2)) {
         const customPdf = new jsPDF('p', 'mm', [pdfWidth, pdfImgHeight + (margin * 2)]);
         customPdf.addImage(imgData, 'PNG', margin, margin, availableWidth, pdfImgHeight);
         customPdf.save(`质检报告_${input.metadata.ticket_id || '未命名'}.pdf`);
         return;
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
        <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-gray-100">
          {/* A4 Paper Look */}
          <div 
            ref={reportRef}
            className="bg-white shadow-lg w-[210mm] min-h-[297mm] p-[15mm] text-slate-800 relative flex flex-col"
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
              <div className="bg-blue-50 p-4 rounded border border-blue-100 text-sm text-slate-700 leading-relaxed mb-4">
                <h4 className="font-bold text-blue-800 mb-2">综合建议：</h4>
                {result.suggestion}
              </div>
              
              {result.suggested_reply && (
                <div className="bg-green-50 p-4 rounded border border-green-100 text-sm text-slate-700 leading-relaxed">
                  <h4 className="font-bold text-green-800 mb-2">AI 优化回复参考：</h4>
                  <div className="whitespace-pre-wrap font-mono text-xs bg-white p-3 rounded border border-green-200 text-slate-600">
                    {result.suggested_reply}
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
