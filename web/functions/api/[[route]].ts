import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import OpenAI from 'openai';

const app = new Hono().basePath('/api');

// Define the shape of environment variables
type Bindings = {
  QWEN_API_KEY: string;
  QWEN_BASE_URL: string;
  QWEN_MODEL_NAME: string;
};

app.post('/analyze', async (c) => {
  try {
    const { appeal_text, reply_text, metadata } = await c.req.json();
    const env = c.env as Bindings;

    console.log("Analyze request received");
    console.log("API Key configured:", !!env.QWEN_API_KEY);
    console.log("Model Name:", env.QWEN_MODEL_NAME);

    if (!env.QWEN_API_KEY) {
      console.error("Missing API Key");
      return c.json({ error: 'Missing QWEN_API_KEY' }, 500);
    }

    const openai = new OpenAI({
      apiKey: env.QWEN_API_KEY,
      baseURL: env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

    const modelName = env.QWEN_MODEL_NAME || "qwen-plus-2025-12-01";

    const prompt = `
You are an expert Government Work Order Quality Inspector. Your task is to evaluate the quality of a "Reply" given to a citizen's "Appeal".

**Input Data:**
- Appeal Title: ${metadata?.appeal_title || 'N/A'}
- Appeal Content: "${appeal_text}"
- Reply Content: "${reply_text}"
- Metadata: ${JSON.stringify(metadata)}

**Evaluation Criteria (Total 100 points):**
1. **Relevance (30%)**: Does the reply directly address the core issue? Is it evasive?
2. **Logic (30%)**: Is the reply logically sound, coherent, and factually consistent?
3. **Solution (10%)**: Does it provide a concrete solution or clear explanation?
4. **Timeliness (10%)**: (Context only) Is it handled in time?
5. **Attitude (20%)**: Is the tone polite, professional, and empathetic?

**Additional Checks:**
- **Typo Check**: Identify any typos.
- **Sensitive Word Check**: Check for negative/banned words (e.g., "don't complain", "fake news").
- **Critical Issues**: If score < 60 or specific fatal errors (e.g., fact distortion, risk downgrading), flag as critical.

**Output Format:**
Return a JSON object strictly adhering to this structure:
{
  "scores": {
    "relevance": { "score": number, "judgement": string, "issues": string[] },
    "logic": { "score": number, "judgement": string, "issues": string[] },
    "solution": { "score": number, "judgement": string, "issues": string[] },
    "timeliness": { "score": number, "judgement": string, "issues": string[] },
    "attitude": { "score": number, "judgement": string, "issues": string[] }
  },
  "typo_check": { "has_typo": boolean, "typos": [{ "error": string, "correct": string }] },
  "sensitive_word_check": { "has_sensitive_word": boolean, "words": string[] },
  "total_score": number,
  "overall_level": "优秀" | "合格" | "存在风险" | "不合格",
  "confidence": number,
  "is_critical": boolean,
  "critical_reasons": string[],
  "suggestion": string,
  "suggested_reply": string,
  "reasoning_trace": string
}

Ensure the "reasoning_trace" provides a step-by-step analysis in Chinese.
Ensure "suggested_reply" is a high-quality, rewritten reply if the original is poor.
`;

    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: "You are a helpful and strict quality assurance assistant." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(content);
    return c.json(result);

  } catch (error: any) {
    console.error("Analysis Error:", error);
    return c.json({ error: error.message }, 500);
  }
});

export const onRequest = handle(app);
