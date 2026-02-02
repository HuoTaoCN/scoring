import type { EvaluationResult, WorkOrderInput } from "../types/quality_inspection";

export interface MockCase {
  id: string;
  name: string;
  description: string;
  input: WorkOrderInput;
  result: EvaluationResult;
}

const TODAY = new Date().toLocaleDateString('zh-CN');

export const MOCK_CASES: MockCase[] = [
  {
    id: "case-001",
    name: "标准高分案例 (高置信度)",
    description: "记录准确，无遗漏，置信度高，建议自动采信。",
    input: {
      appeal_title: "幸福家园小区南门路灯损坏维修诉求",
      appeal_text: `市民反映：幸福家园小区南门路灯坏了两个，晚上太黑了，老人走路不方便，已经坏了两三天了，希望能尽快修好。`,
      reply_text: `您好！您反映的幸福家园小区南门路灯损坏问题已收悉。我局市政设施管理处已于${TODAY}上午派出维修人员前往现场核实。经查，该处确有两盏路灯因线路老化导致故障。维修人员已现场更换了老化线路和灯泡，目前路灯已恢复正常照明。感谢您对城市管理工作的支持与监督！`,
      metadata: {
        category: "求助",
        duration_days: 1,
        ticket_id: "20250101-001",
        timestamp: `${TODAY} 09:30:00`,
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
      suggested_reply: `您好！\n**一、收到诉求情况**\n您于${TODAY}通过电话反映的关于“幸福家园小区南门路灯损坏维修诉求”的问题，我单位已收悉。感谢您的信任与支持！\n**二、调查核实情况**\n我们立即安排市政设施管理处开展调查：\n• 调查方式：现场核查\n• 核实事实：经查，该处确有两盏路灯因线路老化导致故障，影响市民夜间出行。\n• 政策依据：《城市照明管理规定》第十九条\n**三、处理意见与答复**\n经研究，现答复如下：\n• 维修人员已现场更换了老化线路和灯泡，并对周边路灯进行了排查。\n• 目前，路灯已恢复正常照明。\n**四、后续说明**\n• 我们将加强日常巡检，确保照明设施完好。\n• 联系人：赵工 电话：12319\n再次感谢您的理解与监督！\n（市市政管理处）\n${TODAY}`,
      reasoning_trace: "1. **诉求分析**：市民反映路灯损坏，核心诉求是维修。\n2. **回复比对**：回复中明确了核实时间、故障原因（线路老化）、解决措施（更换线路灯泡）及结果（恢复照明）。\n3. **结论**：回复内容针对性强，解决彻底，态度良好。"
    }
  },
  {
    id: "case-002",
    name: "关键信息缺失 (中置信度)",
    description: "遗漏了“盲道被堵”的关键事实，影响部门判断，需抽检。",
    input: {
      appeal_title: "建设路共享单车乱停放",
      appeal_text: `市民反映：建设路与人民路交叉口，大量共享单车乱停放，把盲道都堵死了，刚才有个盲人差点摔倒，太危险了，请赶紧来处理。`,
      reply_text: `您好，关于您反映的共享单车乱停放问题，我单位已通知相关运营企业进行清理。感谢您的反馈。`,
      metadata: {
        category: "投诉",
        duration_days: 2,
        ticket_id: "20250102-005",
        timestamp: `${TODAY} 14:00:00`,
        handling_department: "城管局",
        status: "Completed"
      }
    },
    result: {
      scores: {
        relevance: { score: 20, judgement: "基本回应", issues: ["未回应盲道被堵这一核心痛点", "未提及安全隐患"] },
        logic: { score: 25, judgement: "逻辑清晰", issues: [] },
        solution: { score: 5, judgement: "基本解决", issues: ["仅通知清理，未反馈针对盲道的长效措施"] },
        timeliness: { score: 10, judgement: "办理及时", issues: [] },
        attitude: { score: 15, judgement: "态度一般", issues: [] }
      },
      typo_check: { has_typo: false, typos: [] },
      sensitive_word_check: { has_sensitive_word: false, words: [] },
      total_score: 75,
      overall_level: "合格",
      confidence: 0.80,
      is_critical: false,
      critical_reasons: [],
      suggestion: "回复遗漏了“堵塞盲道”和“安全隐患”的关键细节，建议补充对盲道清理的具体情况说明，体现对弱势群体的关怀。",
      suggested_reply: `您好！\n**一、收到诉求情况**\n您于${TODAY}通过电话反映的关于“建设路共享单车堵塞盲道并造成安全隐患”的问题，我单位已收悉。感谢您的信任与支持！\n**二、调查核实情况**\n我们立即安排执法大队开展调查：\n• 调查方式：现场核查\n• 核实事实：经查，建设路与人民路交叉口确实存在约50辆共享单车占用盲道情况，影响行人通行安全。\n• 政策依据：《城市道路管理条例》第二十七条\n**三、处理意见与答复**\n经研究，现答复如下：\n• 执法人员已现场约谈相关运营企业负责人，责令其立即派员清理，并开具《责令改正通知书》（编号：CG2025010201）。\n• 目前，违规停放车辆已清理完毕，盲道已恢复畅通。\n• 我们已将该区域列为重点巡查点位，加强日常监管。\n**四、后续说明**\n• 如您发现类似问题，可再次反映。\n• 联系人：张队长 电话：12319\n再次感谢您的理解与监督！\n（市城管局）\n${TODAY}`,
      reasoning_trace: "1. **诉求分析**：核心不仅是乱停放，更是“堵塞盲道”和“险些伤人”。\n2. **回复比对**：回复仅泛泛提及“清理”，未针对“盲道”这一敏感点进行说明。\n3. **结论**：虽然解决了问题，但回复不够精准，遗漏了高风险要素。"
    }
  },
  {
    id: "case-003",
    name: "风险降级 (低置信度/人工复核)",
    description: "群众情绪激进且扬言升级，工单未体现，且历史回访有投诉记录。",
    input: {
      appeal_title: "化工厂异味扰民",
      appeal_text: `这已经是第三次投诉了！每天晚上化工厂都偷排废气，味道刺鼻，孩子都咳嗽住院了。如果再不解决，我们就去市政府拉横幅，还要找媒体曝光！`,
      reply_text: `您好，您反映的异味问题已转交环保部门处理。`,
      metadata: {
        category: "投诉",
        duration_days: 1,
        ticket_id: "20250103-012",
        timestamp: `${TODAY} 10:00:00`,
        handling_department: "环保局",
        status: "Pending"
      }
    },
    result: {
      scores: {
        relevance: { score: 10, judgement: "避重就轻", issues: ["未回应‘第三次投诉’", "未关注‘孩子住院’", "忽视‘拉横幅’风险"] },
        logic: { score: 20, judgement: "逻辑简单", issues: [] },
        solution: { score: 0, judgement: "未解决", issues: ["仅转办，无实质进展"] },
        timeliness: { score: 10, judgement: "办理及时", issues: [] },
        attitude: { score: 5, judgement: "冷漠", issues: ["对群众激烈情绪无安抚"] }
      },
      typo_check: { has_typo: false, typos: [] },
      sensitive_word_check: { has_sensitive_word: false, words: [] },
      total_score: 45,
      overall_level: "存在风险",
      confidence: 0.60,
      is_critical: true,
      critical_reasons: ["风险降级", "忽视舆情风险"],
      suggestion: "严重风险预警！群众情绪极度激动且有群体性事件倾向（拉横幅），回复过于敷衍。建议立即升级为‘特急’工单，专人电话回访安抚，并联合执法。",
      suggested_reply: `您好！\n**一、收到诉求情况**\n您于${TODAY}通过电话反映的关于“化工厂异味扰民及孩子身体不适”的问题，我局已收悉。感谢您的信任与支持！\n**二、调查核实情况**\n我们立即安排环境监察支队开展调查：\n• 调查方式：突击夜查、走访周边居民\n• 核实事实：经查，该区域确有异味。执法人员对涉事化工厂进行突击检查，发现其废气处理设施运行不正常，导致部分废气直排。\n• 政策依据：《大气污染防治法》第九十九条\n**三、处理意见与答复**\n经研究，现答复如下：\n• 已对涉事企业下达《责令改正违法行为决定书》，责令其立即停产整顿。\n• 拟对该企业违法排污行为进行立案处罚，并将案件移送公安机关。\n• 针对您孩子身体不适的情况，建议及时就医，我局将协助您进行环境损害鉴定。\n**四、后续说明**\n• 我们将持续跟进整改情况，杜绝此类现象再次发生。\n• 联系人：李科长 电话：12369\n再次感谢您的理解与监督！\n（市生态环境局）\n${TODAY}`,
      reasoning_trace: "1. **诉求分析**：高风险诉求（多次投诉、健康受损、扬言闹事）。\n2. **回复比对**：回复仅一句话，完全忽视了事态的严重性。\n3. **结论**：典型的风险降级，极易引发次生舆情，必须人工介入。"
    }
  },
  {
    id: "case-004",
    name: "严重歪曲事实 (高置信度/退回重写)",
    description: "将明确的‘投诉’记录为‘咨询’，严重歪曲事实，系统判定置信度极高，建议直接退回。",
    input: {
      appeal_title: "要求查处黑网吧",
      appeal_text: `我要投诉！学府路那个网吧接纳未成年人上网，我儿子才12岁就在里面玩了一天。你们到底管不管？不管我就报警了！`,
      reply_text: `您好，关于您咨询的互联网上网服务营业场所管理条例相关政策，未成年人严禁进入网吧。建议您加强对孩子的监护。`,
      metadata: {
        category: "咨询",
        duration_days: 1,
        ticket_id: "20250104-009",
        timestamp: `${TODAY} 15:30:00`,
        handling_department: "文旅局",
        status: "Completed"
      }
    },
    result: {
      scores: {
        relevance: { score: 0, judgement: "严重跑题", issues: ["将‘投诉’定性为‘咨询’", "未启动查处程序"] },
        logic: { score: 10, judgement: "逻辑错误", issues: ["答非所问"] },
        solution: { score: 0, judgement: "未解决", issues: ["未对黑网吧进行查处"] },
        timeliness: { score: 10, judgement: "办理及时", issues: [] },
        attitude: { score: 5, judgement: "推诿", issues: ["反过来教育家长"] }
      },
      typo_check: { has_typo: false, typos: [] },
      sensitive_word_check: { has_sensitive_word: false, words: [] },
      total_score: 25,
      overall_level: "不合格",
      confidence: 0.99,
      is_critical: true,
      critical_reasons: ["工单定性错误", "严重歪曲事实"],
      suggestion: "严禁将‘投诉’件包装成‘咨询’件！群众诉求是查处违法行为，而非咨询政策。此回复属于严重的弄虚作假，建议退回重办并追责。",
      suggested_reply: `您好！\n**一、收到诉求情况**\n您于${TODAY}通过电话反映的关于“学府路网吧违规接纳未成年人”的问题，我局已收悉。感谢您的信任与支持！\n**二、调查核实情况**\n我们立即安排文化市场综合执法大队开展调查：\n• 调查方式：现场突击检查、调取监控录像\n• 核实事实：经查，该网吧（XX网咖）确实存在3名未成年人上网的情况，且未按规定核对登记上网消费者有效身份证件。\n• 政策依据：《互联网上网服务营业场所管理条例》第二十一条\n**三、处理意见与答复**\n经研究，现答复如下：\n• 依据《互联网上网服务营业场所管理条例》第三十一条之规定，对该网吧作出如下行政处罚：\n  1. 责令停业整顿15天；\n  2. 罚款人民币5000元。\n• 我们已责令该网吧立即整改，加强入口管理，杜绝未成年人进入。\n**四、后续说明**\n• 我局将加大对校园周边网吧的巡查力度，欢迎您继续监督。\n• 联系人：王队长 电话：12318\n再次感谢您的理解与监督！\n（市文旅局）\n${TODAY}`,
      reasoning_trace: "1. **诉求分析**：明确的举报投诉（黑网吧接纳未成年人）。\n2. **回复比对**：回复却在谈政策咨询和教育家长，完全回避了执法职责。\n3. **结论**：性质恶劣的定性篡改（投诉->咨询），试图规避考核。"
    }
  },
  {
    id: "case-005",
    name: "处理方式错误 (高置信度/纠正流转)",
    description: "话务员试图直接办结复杂投诉，AI 识别后强制修正为‘转办’，防止工单空转。",
    input: {
      appeal_title: "小区违建拆除",
      appeal_text: `锦绣花园5号楼顶楼业主正在违规加盖阳光房，已经盖了一半了，严重影响楼体安全，物业管不了，请政府赶紧来拆除。`,
      reply_text: `您好，您的建议我们已记录。建议您与物业协商解决。`,
      metadata: {
        category: "投诉",
        duration_days: 0,
        ticket_id: "20250105-033",
        timestamp: `${TODAY} 09:00:00`,
        handling_department: "话务中心",
        status: "Direct Closure" 
      }
    },
    result: {
      scores: {
        relevance: { score: 10, judgement: "推诿", issues: ["违建属于执法事项，非物业能管"] },
        logic: { score: 15, judgement: "逻辑一般", issues: [] },
        solution: { score: 0, judgement: "未解决", issues: ["话务员试图直接办结，未转派职能部门"] },
        timeliness: { score: 10, judgement: "办理及时", issues: [] },
        attitude: { score: 10, judgement: "敷衍", issues: [] }
      },
      typo_check: { has_typo: false, typos: [] },
      sensitive_word_check: { has_sensitive_word: false, words: [] },
      total_score: 45,
      overall_level: "不合格",
      confidence: 0.95,
      is_critical: true,
      critical_reasons: ["处理方式错误", "应当转办而未转办"],
      suggestion: "处理方式错误！‘违建拆除’属于行政执法事项，话务员无权直接办结，必须‘转办’至城管局或街道综合执法队。",
      suggested_reply: `您好！\n**一、收到诉求情况**\n您于${TODAY}通过电话反映的关于“锦绣花园5号楼顶楼违建拆除”的问题，我单位已收悉。感谢您的信任与支持！\n**二、调查核实情况**\n我们立即安排重庆市两江新区城管执法局开展调查：\n• 调查方式：现场勘验\n• 核实事实：经查，锦绣花园5号楼顶楼业主确实正在搭建阳光房，未取得规划审批手续，属于违法建设。\n• 政策依据：《重庆市城乡规划条例》第七十六条\n**三、处理意见与答复**\n经研究，现答复如下：\n• 执法人员已现场下达《责令停止违法行为通知书》，责令当事人立即停工并自行拆除。\n• 如逾期未拆除，我局将依法启动强制拆除程序。\n• 已督促物业公司加强装修管理，禁止违规材料入场。\n**四、后续说明**\n• 我们将持续跟进拆除进度。\n• 联系人：周队长 电话：12319\n再次感谢您的理解与监督！\n（重庆市两江新区城管执法局）\n${TODAY}`,
      reasoning_trace: "1. **诉求分析**：正在进行的违建，属于紧急执法事项。\n2. **回复比对**：话务员试图以‘记录建议’为由直接关单。\n3. **结论**：流程违规。必须转派执法部门现场处置，否则就是失职。"
    }
  }
];
