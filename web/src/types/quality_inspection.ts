/**
 * Intelligent Government Service Hotline Work Order Quality Inspection System
 * Type Definitions
 * Updated for Appeal vs Reply Scoring
 */

export interface EvaluationResult {
  scores: ScoringMatrix;
  typo_check: {
    has_typo: boolean;
    typos: Array<{ error: string; correct: string }>;
  };
  sensitive_word_check: {
    has_sensitive_word: boolean;
    words: string[];
  };
  total_score: number;
  overall_level: '优秀' | '合格' | '存在风险' | '不合格';
  confidence: number;
  is_critical: boolean;
  critical_reasons: string[];
  suggestion: string;
  suggested_reply?: string;
  reasoning_trace?: string;
  // Legacy fields for compatibility (optional)
  confidence_bucket?: 'High' | 'Medium' | 'Low';
  need_human_review?: boolean;
  review_reason?: string;
}

export interface ScoringMatrix {
  relevance: ScoreDimension; // 答非所问
  logic: ScoreDimension;     // 回复逻辑性
  solution: ScoreDimension;  // 问题解决情况
  timeliness: ScoreDimension;// 办理时效
  attitude: ScoreDimension;  // 回复态度
  // Legacy fields for compatibility (optional)
  completeness?: ScoreDimension;
  consistency?: ScoreDimension;
  clarity?: ScoreDimension;
  risk_awareness?: ScoreDimension;
}

export interface ScoreDimension {
  score: number;
  judgement: string;
  issues: string[];
}

export interface WorkOrderInput {
  appeal_title: string; // 诉求标题
  appeal_text: string;  // 群众诉求内容
  reply_text: string;   // 办理结果/答复
  metadata: {
    category: string; // 咨询类/非咨询类
    duration_days: number;
    ticket_id: string;
    timestamp: string;
    handling_department: string;
    status: string;
  };
  // Legacy fields for compatibility (optional)
  transcript?: string;
  form_data?: any;
  history_factors?: any;
}
