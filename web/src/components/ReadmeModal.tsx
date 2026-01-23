import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X } from 'lucide-react';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadmeModal: React.FC<ReadmeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col relative overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
            <h2 className="text-lg font-bold text-gray-800">项目文档</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 prose prose-slate max-w-none">
           <ReactMarkdown remarkPlugins={[remarkGfm]}>
{`# GovInsight-AI 工单办理质量智能检测系统

**Intelligent Quality Inspection System for Work Order Handling**

## 核心价值与功能

本项目旨在解决政务热线中**“回复内容不规范、答非所问、解决不彻底”**等质量问题。通过 LLM 智能比对**群众诉求**与**办理结果**，实现全量自动化质检。

### 1. 🔍 多维度智能质检 (5大维度)
*   **答非所问 (Relevance)**：精准识别回复是否回避核心诉求，是否推诿扯皮。
*   **回复逻辑性 (Logic)**：评估语言通顺度、逻辑连贯性及因果关系。
*   **问题解决情况 (Solution)**：判断问题是否实质性解决，群众是否认可。
*   **办理时效 (Timeliness)**：结合业务类型（咨询/非咨询）评估办理时长。
*   **回复态度 (Attitude)**：检测服务态度、语气是否友好，是否有人文关怀。

### 2. 🛡️ 智能风险防控
*   **错别字检测**：自动识别同音字、形近字及常见错误。
*   **敏感词过滤**：检测是否包含不文明用语或禁止使用的负面词汇。
*   **强制复核机制**：对低分、低置信度或含风险词的工单，自动标记为“强制人工复核”。

### 3. 🧠 可解释的 AI 思维链
系统展示完整的推理过程：
> *"群众诉求核心是噪音扰民，但回复内容仅提及绿化修剪，属于严重跑题..."*

### 4. ✨ 智能辅助优化
针对质量不佳的回复，AI 会自动生成**建议回复内容**，供办理人员参考，提升服务水平。

## 评分标准 (总分100分)
| 维度 | 分值 | 说明 |
| :--- | :--- | :--- |
| **答非所问** | 30分 | 核心指标，低于5分直接预警 |
| **回复逻辑性** | 30分 | 核心指标，低于5分直接预警 |
| **回复态度** | 20分 | 核心指标，低于5分直接预警 |
| **问题解决** | 10分 | 关注实质性解决措施 |
| **办理时效** | 10分 | 关注办理速度 |
`}
           </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
