import { useState } from 'react';
import { MOCK_CASES } from './data/mock_cases';
import { ScoreCard } from './components/ScoreCard';
import { CaseEditor } from './components/CaseEditor';
import { Tooltip } from './components/Tooltip';
import { Logo } from './components/Logo';
import { Activity, BrainCircuit, Play, ShieldCheck, UserCheck, CheckCircle, Edit3, HelpCircle, AlertTriangle, Github, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import type { EvaluationResult, WorkOrderInput } from './types/quality_inspection';

const CUSTOM_CASE_ID = 'custom-case';

// Initial empty state for custom case
const INITIAL_CUSTOM_INPUT: WorkOrderInput = {
  appeal_title: '',
  appeal_text: '',
  reply_text: '',
  metadata: {
    category: '投诉',
    duration_days: 1,
    ticket_id: '20250114-NEW',
    timestamp: new Date().toLocaleString(),
    handling_department: '待分配',
    status: 'Draft'
  }
};

import { RevisionView } from './components/RevisionView';

import { ReadmeModal } from './components/ReadmeModal';

function App() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(MOCK_CASES[0].id);
  const [customInput, setCustomInput] = useState<WorkOrderInput>(INITIAL_CUSTOM_INPUT);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EvaluationResult | null>(null);
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);

  const isCustomMode = true; // Always enable editing mode

  // Helper to get current input data
  const getCurrentInput = () => {
    return customInput;
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setShowResult(false);
    setAnalysisResult(null);

    const inputData = getCurrentInput();

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appeal_text: inputData.appeal_text,
          reply_text: inputData.reply_text,
          metadata: inputData.metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      console.log("API Result:", result); 
      setAnalysisResult(result);
      setShowResult(true);
    } catch (error) {
      console.error("Failed to analyze:", error);
      
      // Fallback for demo if API fails
      if (!isCustomMode) {
        alert("AI 服务暂时不可用。");
      } else {
        const msg = "AI 分析失败。请检查：\n1. 后端服务是否已启动？\n2. 请尝试访问 http://localhost:8788 (Wrangler 端口)\n3. 检查控制台是否有 API 报错信息";
        alert(msg);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCaseChange = (id: string) => {
    setSelectedCaseId(id);
    setAnalysisResult(null);
    
    // When a case is selected (Mock or Custom), populate the input form
    if (id === CUSTOM_CASE_ID) {
      setShowResult(false);
    } else {
      // If switching to a Mock Case, LOAD it into the customInput state so it's editable
      const mockCase = MOCK_CASES.find(c => c.id === id);
      if (mockCase) {
        setCustomInput(mockCase.input);
        // We want to effectively treat this as "Custom Mode" but pre-filled
        setSelectedCaseId(CUSTOM_CASE_ID); 
        
        // Restore the mock result initially so the user sees the demo state
        setAnalysisResult(mockCase.result);
        setShowResult(true);
      } else {
        setShowResult(false);
      }
    }
  };

  const currentMockCase = MOCK_CASES.find(c => c.id === selectedCaseId);
  // Fallback to mock result if analysisResult is null and we are not in custom mode
  const displayResult = analysisResult || (selectedCaseId !== CUSTOM_CASE_ID ? currentMockCase?.result : null);

  // Helper to localize overall_level
  const getLocalizedLevel = (level: string) => {
    return level; // The API returns Chinese directly now
  };

  // Helper to get action status and color
  const getActionStatus = (result: EvaluationResult) => {
    const isBadQuality = ['不合格', '存在风险'].includes(result.overall_level);
    const isCritical = result.is_critical;
    
    // 逻辑判定优先级
    if (isCritical) {
       return { type: 'review', label: '强制复核 (Mandatory Review)', color: 'bg-red-600' };
    }
    
    if (result.confidence < 0.85) {
       return { type: 'review', label: '抽检复核 (Sampling)', color: 'bg-orange-500' };
    }

    if (isBadQuality) {
       return { type: 'rewrite', label: '退回重写 (Rewrite)', color: 'bg-red-600' };
    }

    return { type: 'pass', label: '自动采信 (Auto-Pass)', color: 'bg-green-600' };
  };

  const actionStatus = displayResult ? getActionStatus(displayResult) : null;

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md shrink-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="text-blue-400" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">工单办理质量智能检测系统 <span className="text-xs font-normal text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded ml-2">V0.5.0</span></h1>
              <p className="text-xs text-slate-400">Intelligent Quality Inspection System for Work Order Handling</p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:scale-95 active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                AI 正在质检...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                开始智能质检
              </>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 grid grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Sidebar: Case Selector */}
        <div className="col-span-12 lg:col-span-2 flex flex-col h-full overflow-hidden">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 shrink-0">测试案例</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {MOCK_CASES.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCaseChange(c.id)}
                className={clsx(
                  "w-full text-left p-3 rounded-lg border transition-all text-sm",
                  selectedCaseId === c.id
                    ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500"
                    : "bg-white border-gray-200 hover:border-blue-300 text-gray-600"
                )}
              >
                <div className="font-bold mb-1">{c.name}</div>
                <div className="text-xs text-gray-400 line-clamp-2">{c.description}</div>
              </button>
            ))}
            
            {/* Custom Case Button */}
            <button
              onClick={() => handleCaseChange(CUSTOM_CASE_ID)}
              className={clsx(
                "w-full text-left p-3 rounded-lg border-2 border-dashed transition-all text-sm flex items-center gap-2 group",
                isCustomMode
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "bg-transparent border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600"
              )}
            >
              <div className="bg-white p-1.5 rounded-full border shadow-sm group-hover:scale-110 transition-transform">
                <Edit3 size={14} />
              </div>
              <div className="font-bold">手动录入测试</div>
            </button>
          </div>
        </div>

        {/* Center: Work Order Input (Appeal & Reply) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col h-full gap-3 overflow-hidden">
            <CaseEditor 
              input={customInput} 
              onChange={setCustomInput} 
            />
        </div>

        {/* Right: AI Analysis Result */}
        <div className="col-span-12 lg:col-span-3 flex flex-col h-full gap-3 overflow-hidden">
          <div className="shrink-0 flex items-center gap-2 mb-0">
            <BrainCircuit size={18} className="text-purple-600" />
            <h2 className="text-lg font-bold text-gray-800">2. AI 质检报告</h2>
          </div>

          {/* Score Card Container */}
          <div className="flex-[2.33] min-h-0 bg-white rounded-lg border border-blue-200 shadow-sm ring-2 ring-blue-50 flex flex-col">
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-2.5 flex items-center gap-2 shrink-0 rounded-t-lg">
               <Activity size={18} className="text-blue-700" />
               <h3 className="font-bold text-blue-800">质检得分</h3>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto">
              {showResult && displayResult ? (
                <div className="space-y-3">
                  {/* Total Score Summary */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                     <div>
                       <div className="text-xs text-gray-500 uppercase font-bold">综合评分</div>
                       <div className={clsx(
                          "text-3xl font-black mt-0.5",
                          displayResult.total_score >= 90 ? "text-green-600" :
                          displayResult.total_score >= 75 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {displayResult.total_score}
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-sm font-bold text-gray-600">{getLocalizedLevel(displayResult.overall_level)}</div>
                     </div>
                  </div>

                  {/* Score Cards (Updated Dimensions) */}
                  <div className="space-y-2">
                      <ScoreCard 
                        title="A. 答非所问 (30%)" 
                        data={displayResult.scores.relevance} 
                        maxScore={30} 
                        description={[
                          "回复是否回应群众诉求重点",
                          "是否存在回避、推诿",
                          "事实认定是否清楚"
                        ]}
                      />
                      <ScoreCard 
                        title="B. 回复逻辑性 (30%)" 
                        data={displayResult.scores.logic} 
                        maxScore={30} 
                        description={[
                          "结构清晰，因果关系明确",
                          "语言通顺流畅",
                          "无前后矛盾"
                        ]}
                      />
                      <ScoreCard 
                        title="C. 问题解决情况 (10%)" 
                        data={displayResult.scores.solution} 
                        maxScore={10} 
                        description={[
                          "明确说明具体解决措施",
                          "问题已解决且群众认可",
                          "非咨询类标准更严"
                        ]}
                      />
                      <ScoreCard 
                        title="D. 办理时效 (10%)" 
                        data={displayResult.scores.timeliness} 
                        maxScore={10} 
                        description={[
                          "办理及时，符合时限要求",
                          "滞后是否有合理解释"
                        ]}
                      />
                       <ScoreCard 
                        title="E. 回复态度 (20%)" 
                        data={displayResult.scores.attitude} 
                        maxScore={20} 
                        description={[
                          "态度友好，体现人文关怀",
                          "无生硬、冷淡或不当言辞"
                        ]}
                      />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <div className="bg-gray-50 p-3 rounded-full mb-3">
                    <Activity size={24} className="opacity-20" />
                  </div>
                  <p className="text-xs font-medium">待评分...</p>
                </div>
              )}
            </div>
          </div>

          {/* Reasoning Container */}
          <div className="flex-1 min-h-0 bg-white rounded-lg border border-blue-200 shadow-sm overflow-hidden ring-2 ring-blue-50 flex flex-col">
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center gap-2 shrink-0">
               <BrainCircuit size={18} className="text-blue-700" />
               <h3 className="font-bold text-blue-800">思考过程</h3>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
               {showResult && displayResult && displayResult.reasoning_trace ? (
                 <div className="bg-gray-50 text-gray-700 p-4 rounded-lg border border-gray-200 text-sm leading-relaxed font-mono h-full overflow-y-auto">
                    <div className="whitespace-pre-wrap">
                      {displayResult.reasoning_trace.split(/(?:;|\d+\.)/).map((segment, index) => {
                        const trimmed = segment.trim();
                        if (!trimmed) return null;
                        const cleanText = trimmed.replace(/\*\*/g, '');
                        return (
                          <div key={index} className="mb-2 last:mb-0">
                            {index > 0 ? `${index}. ` : ''}{cleanText}
                          </div>
                        );
                      })}
                    </div>
                 </div>
               ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <div className="bg-gray-50 p-3 rounded-full mb-3">
                    <BrainCircuit size={24} className="opacity-20" />
                  </div>
                  <p className="text-xs font-medium">待推理...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Column: 3. Action & Revision */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-full gap-3 overflow-hidden">
          <div className="shrink-0 flex items-center gap-2 mb-0">
            <ShieldCheck size={18} className="text-green-600" />
            <h2 className="text-lg font-bold text-gray-800">3. 处置建议与优化</h2>
          </div>

          {/* Confidence & Action Card */}
          <div className="flex-1 min-h-0 bg-white rounded-lg border border-blue-200 shadow-sm ring-2 ring-blue-50 flex flex-col">
            <div className="bg-blue-50 border-b border-blue-100 px-4 py-3 flex justify-between items-center rounded-t-lg shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-blue-700" />
                <h3 className="font-bold text-blue-800">置信度和处置建议</h3>
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              {showResult && displayResult ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-bold text-gray-500 uppercase">置信度评估</div>
                    <div className={clsx(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border",
                        displayResult.confidence >= 0.85 
                          ? "bg-green-50 text-green-700 border-green-200"
                          : displayResult.confidence >= 0.7
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      )}>
                        {displayResult.confidence >= 0.85 ? "High" : displayResult.confidence >= 0.7 ? "Medium" : "Low"} ({displayResult.confidence})
                    </div>
                  </div>

                  {displayResult.is_critical ? (
                    <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <UserCheck size={16} />
                        强制人工复核
                      </div>
                      <ul className="list-disc pl-4 text-xs opacity-90 leading-snug">
                        {displayResult.critical_reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                     <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800 text-sm">
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <CheckCircle size={16} />
                        建议自动采信
                      </div>
                      <div className="text-xs opacity-90">系统判断稳定，无需人工介入</div>
                    </div>
                  )}

                  {displayResult.typo_check.typos.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-3 text-orange-800 text-sm">
                       <div className="font-bold mb-1 flex items-center gap-2">
                          <AlertTriangle size={14} /> 发现错别字
                       </div>
                       <ul className="text-xs list-disc pl-4">
                         {displayResult.typo_check.typos.map((t, i) => (
                           <li key={i}>{t.error} &rarr; {t.correct}</li>
                         ))}
                       </ul>
                    </div>
                  )}

                  {displayResult.sensitive_word_check && displayResult.sensitive_word_check.has_sensitive_word && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
                       <div className="font-bold mb-1 flex items-center gap-2">
                          <AlertTriangle size={14} /> 发现敏感词/负面词
                       </div>
                       <ul className="text-xs list-disc pl-4">
                         {displayResult.sensitive_word_check.words.map((w, i) => (
                           <li key={i}>{w}</li>
                         ))}
                       </ul>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-2">改进建议</div>
                    <div className="mb-2 flex items-center gap-2">
                      {actionStatus && (
                        <span className={`${actionStatus.color} text-white px-3 py-1 rounded text-sm font-bold shadow-sm`}>
                          {actionStatus.label}
                        </span>
                      )}

                      {/* Tooltip for Strategy Explanation */}
                      <Tooltip 
                        position="bottom"
                        content={
                          <div className="w-72">
                            <div className="font-bold mb-2 text-gray-700 border-b pb-1">AI 处置建议判定规则</div>
                            <div className="space-y-2.5">
                              <div className="flex items-start gap-2">
                                <span className="w-2 h-2 mt-1.5 rounded-full bg-red-600 shrink-0 shadow-sm"></span>
                                <div>
                                  <span className="font-bold text-gray-800">退回重写 / 强制复核</span>
                                  <div className="text-gray-500 scale-90 origin-top-left mt-0.5">存在严重质量问题（答非所问等）或触发敏感词/错别字。</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="w-2 h-2 mt-1.5 rounded-full bg-green-600 shrink-0 shadow-sm"></span>
                                <div>
                                  <span className="font-bold text-gray-800">自动采信</span>
                                  <div className="text-gray-500 scale-90 origin-top-left mt-0.5">工单质量优秀/合格，且 AI 置信度高。</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      >
                        <HelpCircle size={15} className="text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                      </Tooltip>
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded leading-relaxed">
                      {displayResult.suggestion}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <div className="bg-gray-50 p-3 rounded-full mb-3">
                    <ShieldCheck size={24} className="opacity-20" />
                  </div>
                  <p className="text-xs font-medium">待生成...</p>
                </div>
              )}
            </div>
          </div>

          {/* Auto-generated Revision */}
          <div className="flex-1 min-h-0 flex flex-col">
            <RevisionView 
              isAnalyzed={showResult && !!displayResult}
              suggestedReply={displayResult?.suggested_reply}
            />
          </div>
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-4 shrink-0 text-xs text-gray-500">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3">
          {/* Left: Copyright & Contact */}
          <div className="flex items-center gap-4">
             <span className="font-medium text-gray-600">&copy; {new Date().getFullYear()} GovInsight-AI</span>
          </div>

          {/* Right: Links & Credit */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReadmeOpen(true)}
              className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
            >
              <FileText size={14} />
              <span>项目文档 (README)</span>
            </button>
            <a 
              href="https://github.com/HuoTaoCN/GovInsight-AI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      <ReadmeModal 
        isOpen={isReadmeOpen} 
        onClose={() => setIsReadmeOpen(false)} 
      />
    </div>
  );
}

export default App;
