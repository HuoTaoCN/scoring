import type { EvaluationResult, WorkOrderInput } from "../types/quality_inspection";

export interface MockCase {
  id: string;
  name: string;
  description: string;
  input: WorkOrderInput;
  result: EvaluationResult;
}

export const MOCK_CASES: MockCase[] = [
  {
    id: "case-001",
    name: "标准高分案例 (完美回复)",
    description: "针对路灯损坏诉求，回复及时、态度好、解决措施明确。",
    input: {
      appeal_title: "幸福家园小区南门路灯损坏维修诉求",
      appeal_text: `市民反映：幸福家园小区南门路灯坏了两个，晚上太黑了，老人走路不方便，已经坏了两三天了，希望能尽快修好。`,
      reply_text: `您好！您反映的幸福家园小区南门路灯损坏问题已收悉。我局市政设施管理处已于1月2日上午派出维修人员前往现场核实。经查，该处确有两盏路灯因线路老化导致故障。维修人员已现场更换了老化线路和灯泡，目前路灯已恢复正常照明。感谢您对城市管理工作的支持与监督！`,
      metadata: {
        category: "求助",
        duration_days: 1,
        ticket_id: "20250101-001",
        timestamp: "2025-01-01 09:30:00",
        handling_department: "市市政管理处",
        status: "Completed"
      }
    },
    result: {
      scores: {
        relevance: { score: 30, judgement: "精准回应", issues: [] },
        logic: { score: 30, judgement: "逻辑严谨", issues: [] },
        solution: { score: 10, judgement: "已解决", issues: [] },
        timeliness: { score: 10, judgement: "办理及时", issues: [] },
        attitude: { score: 20, judgement: "态度友好", issues: [] }
      },
      typo_check: { has_typo: false, typos: [] },
      sensitive_word_check: { has_sensitive_word: false, words: [] },
      total_score: 100,
      overall_level: "优秀",
      confidence: 0.98,
      is_critical: false,
      critical_reasons: [],
      suggestion: "办理质量优秀，请继续保持。",
      suggested_reply: undefined,
      reasoning_trace: "1. **诉求分析**：市民反映路灯损坏，核心诉求是维修。\n2. **回复比对**：回复中明确了核实时间、故障原因（线路老化）、解决措施（更换线路灯泡）及结果（恢复照明）。\n3. **结论**：回复内容针对性强，解决彻底，态度良好。"
    }
  },
  {
    id: "case-002",
    name: "低分案例 (答非所问)",
    description: "市民投诉噪音扰民，回复内容却是在谈绿化修剪，严重跑题。",
    input: {
      appeal_title: "阳光花园3号楼下烧烤店噪音扰民",
      appeal_text: `市民来电投诉：阳光花园3号楼楼下的烧烤店每天晚上营业到凌晨2点，噪音非常大，严重影响居民休息。要求相关部门查处。`,
      reply_text: `您好，关于您反映的小区环境问题，我单位已安排工作人员对小区内的绿化带进行了修剪和清理，目前环境卫生状况良好。感谢您的反馈。`,
      metadata: {
        category: "投诉",
        duration_days: 3,
        ticket_id: "20250102-005",
        timestamp: "2025-01-02 14:00:00",
        handling_department: "街道办事处",
        status: "Completed"
      }
    },
    result: {
      scores: {
        relevance: { score: 0, judgement: "严重跑题", issues: ["未回应噪音扰民问题", "回复内容与诉求无关"] },
        logic: { score: 15, judgement: "逻辑一般", issues: ["回复内容自身通顺但与上文脱节"] },
        solution: { score: 0, judgement: "未解决", issues: ["未采取针对噪音的措施"] },
        timeliness: { score: 10, judgement: "办理及时", issues: [] },
        attitude: { score: 10, judgement: "态度一般", issues: ["敷衍了事"] }
      },
      typo_check: { has_typo: false, typos: [] },
      sensitive_word_check: { has_sensitive_word: false, words: [] },
      total_score: 35,
      overall_level: "不合格",
      confidence: 0.95,
      is_critical: true,
      critical_reasons: ["答非所问得分过低"],
      suggestion: "回复严重跑题，请务必针对市民提出的‘噪音扰民’问题进行调查处理，而不是回复绿化问题。",
      suggested_reply: "您好！关于您反映的阳光花园3号楼下烧烤店噪音扰民问题，我街道执法中队已于1月3日晚进行现场突击检查。经查，该店确存在夜间经营噪音超标情况。执法人员已现场下达整改通知书，责令其严格控制营业时间和音量，避免扰民。后续我们将加强夜间巡查力度。感谢您的监督！",
      reasoning_trace: "1. **诉求分析**：核心痛点是‘烧烤店噪音扰民’。\n2. **回复比对**：回复内容全是关于‘绿化修剪’，与噪音完全无关。\n3. **结论**：典型的答非所问，属于严重质量事故。"
    }
  },
  {
    id: "case-003",
    name: "中等得分 (解释不清/低置信度)",
    description: "医保报销政策咨询，回复内容过于专业难懂，且未直接回答核心问题，AI 判定置信度较低。",
    input: {
      appeal_title: "异地就医门诊费用报销比例咨询",
      appeal_text: `我想咨询一下，我退休后在上海居住，如果我在上海的医院看门诊，报销比例是多少？需要先备案吗？`,
      reply_text: `您好，根据《关于进一步做好基本医疗保险跨省异地就医直接结算工作的通知》文件精神，异地就医需遵循参保地政策。具体比例请参照统筹区相关规定执行。如有疑问请拨打咨询电话。`,
      metadata: {
        category: "咨询",
        duration_days: 1,
        ticket_id: "20250103-012",
        timestamp: "2025-01-03 10:00:00",
        handling_department: "医保局",
        status: "Completed"
      }
    },
    result: {
      scores: {
        relevance: { score: 15, judgement: "基本回应", issues: ["未直接回答具体比例", "未明确回答是否需要备案"] },
        logic: { score: 20, judgement: "逻辑尚可", issues: ["官话套话较多"] },
        solution: { score: 5, judgement: "基本解决", issues: ["仅提供政策依据，未提供直观答案"] },
        timeliness: { score: 10, judgement: "办理及时", issues: [] },
        attitude: { score: 15, judgement: "态度一般", issues: ["语气生硬"] }
      },
      typo_check: { has_typo: false, typos: [] },
      sensitive_word_check: { has_sensitive_word: false, words: [] },
      total_score: 65,
      overall_level: "合格",
      confidence: 0.75,
      is_critical: false,
      critical_reasons: [],
      suggestion: "回复过于官方，建议直接给出具体的报销比例范围和备案操作指引，方便群众理解。",
      suggested_reply: "您好！关于异地就医门诊报销问题：1. 需要先备案。您可以通过国家医保服务平台APP自助办理异地就医备案。2. 备案后在上海定点医院看门诊，报销比例通常与在参保地就医一致（例如退休人员通常为XX%），具体取决于您的参保类型（职工/居民）。建议您登录APP查询具体额度或拨打0571-12345转医保专席详细查询。感谢您的咨询！",
      reasoning_trace: "1. **诉求分析**：群众问两个具体问题：报销比例是多少？需要备案吗？\n2. **回复比对**：回复引用了文件，但没有给出具体数字，也没有明确说“需要”或“不需要”备案，属于答非所问的边缘。\n3. **结论**：虽然回复了政策，但未解决实际困惑，体验较差。"
    }
  },
  {
    id: "case-004",
    name: "风险案例 (态度恶劣/敏感词)",
    description: "回复中包含不当言辞和推诿态度，触发敏感词报警。",
    input: {
      appeal_title: "投诉社区办事效率低",
      appeal_text: `我去社区办理居住证明，工作人员态度很差，玩手机，让我等了半个小时，最后还说电脑坏了办不了，让我改天再来。`,
      reply_text: `您反映的情况我们知道了。电脑坏了就是办不了，这是客观原因，不要没事找事，瞎投诉。我们工作人员也很辛苦，请互相理解。`,
      metadata: {
        category: "投诉",
        duration_days: 2,
        ticket_id: "20250104-009",
        timestamp: "2025-01-04 15:30:00",
        handling_department: "某社区",
        status: "Completed"
      }
    },
    result: {
      scores: {
        relevance: { score: 20, judgement: "基本回应", issues: [] },
        logic: { score: 20, judgement: "逻辑清晰", issues: [] },
        solution: { score: 0, judgement: "未解决", issues: ["未解决办事难问题"] },
        timeliness: { score: 10, judgement: "办理及时", issues: [] },
        attitude: { score: 0, judgement: "态度恶劣", issues: ["使用训斥语气", "缺乏服务意识"] }
      },
      typo_check: { has_typo: false, typos: [] },
      sensitive_word_check: { has_sensitive_word: true, words: ["没事找事", "瞎投诉"] },
      total_score: 50,
      overall_level: "不合格",
      confidence: 0.99,
      is_critical: true,
      critical_reasons: ["回复态度得分过低", "存在敏感词"],
      suggestion: "回复态度极其恶劣，使用了‘没事找事’、‘瞎投诉’等禁止用语，严重损害政府形象，建议立即对相关人员进行严肃处理并向市民道歉。",
      suggested_reply: "您好！对于您在社区办事遇到的不愉快经历，我们深表歉意。经核实，当时确实存在网络故障，但工作人员在解释过程中态度生硬、服务不规范，我们已对当事人进行了严肃批评教育，并扣除当月绩效。关于您的居住证明，社区已安排专人与您联系，提供预约办理或上门服务。再次向您致歉，感谢您的监督！",
      reasoning_trace: "1. **诉求分析**：投诉办事效率低及工作人员态度差。\n2. **回复比对**：回复中出现‘不要没事找事’、‘瞎投诉’等攻击性语言。\n3. **结论**：严重的服务态度问题，触发敏感词拦截。"
    }
  },
  {
    id: "case-005",
    name: "优秀案例 (意见建议采纳)",
    description: "市民建议增设公交站点，回复态度诚恳并已纳入规划。",
    input: {
      appeal_title: "建议在科技园北门增设公交站点",
      appeal_text: `科技园北门上班族很多，最近的公交站要走1公里，很不方便，建议在北门附近增设一个公交站点，方便大家出行。`,
      reply_text: `您好！非常感谢您提出的宝贵建议。随着科技园入驻企业的增加，北门附近的出行需求确实日益增长。我局交通运输管理处已会同公交公司进行了现场勘察。经研究，初步计划在北门向东200米处增设“科技园北”站点，目前正在进行公示和审批流程，预计下个月可投入使用。感谢您对城市公共交通发展的关心！`,
      metadata: {
        category: "意见建议",
        duration_days: 5,
        ticket_id: "20250105-033",
        timestamp: "2025-01-05 09:00:00",
        handling_department: "交通运输局",
        status: "Completed"
      }
    },
    result: {
      scores: {
        relevance: { score: 30, judgement: "精准回应", issues: [] },
        logic: { score: 30, judgement: "逻辑严谨", issues: [] },
        solution: { score: 10, judgement: "已采纳", issues: [] },
        timeliness: { score: 10, judgement: "办理及时", issues: [] },
        attitude: { score: 20, judgement: "态度诚恳", issues: [] }
      },
      typo_check: { has_typo: false, typos: [] },
      sensitive_word_check: { has_sensitive_word: false, words: [] },
      total_score: 100,
      overall_level: "优秀",
      confidence: 0.95,
      is_critical: false,
      critical_reasons: [],
      suggestion: "回复质量很高，不仅态度好，而且有实质性的调查和规划反馈。",
      suggested_reply: undefined,
      reasoning_trace: "1. **诉求分析**：建议增设公交站点。\n2. **回复比对**：回复肯定了建议的价值，并给出了具体的勘察结果和后续计划（增设站点、预计时间）。\n3. **结论**：完美的意见建议类回复范本。"
    }
  }
];
