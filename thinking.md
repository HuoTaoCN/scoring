
群众诉求回复内容评分系统



# 📄 群众诉求回复内容评分系统 - 完整提示词

---

## 🎯 **任务目标**

请对输入的群众网上诉求数据中的“诉求回复内容”进行评分，重点考察办理回复质量，群众诉求文本本身质量**不纳入评价**。

要求综合以下 5 个维度评分，并检查错别字与负面词语，最终输出结构化 JSON，需增加 **“重点关注”字段**，用于标记需特别关注的内容。

---

## 📊 **评分维度及详细标准**

| 维度                 | 权重 | 评分细则                                                                                                   |
|--------------------|-----|----------------------------------------------------------------------------------------------------------|
| 1️⃣ 答非所问           | 30分 | - 是否精准回应诉求类别和重点<br>**25-30分**：回应精准到位<br>**15-24分**：基本回应，细节略有遗漏<br>**5-14分**：多处未回应或偏题<br>**0-5分**：严重跑题，未回应诉求核心 |
| 2️⃣ 回复逻辑性         | 30分 | - 回复结构是否清晰，语言是否流畅，前后是否逻辑连贯<br>**25-30分**：表达流畅，逻辑严谨<br>**15-24分**：整体尚清晰，少量句式冗长或逻辑跳跃<br>**5-14分**：逻辑不清，表达晦涩<br>**0-5分**：混乱无序 |
| 3️⃣ 问题解决情况       | 10分 | - 结合“办理人员自评”与“群众沟通情况”判断是否切实解决诉求<br>**8-10分**：已解决且群众认可<br>**5-7分**：已解决但群众不认可或未解释充分<br>**0-4分**：未解决/解决中，说明不到位 |
| 4️⃣ 办理时长           | 10分 | - 咨询类 ≤5个工作日、非咨询类 ≤15个工作日，办理迅速适度加分，超期扣分<br>**见前述细则** |
| 5️⃣ 回复态度（语气、情感） | 20分 | - 语气是否诚恳，体现政府关怀<br>**16-20分**：态度友好，关怀到位<br>**10-15分**：语气尚可，有少量冷漠<br>**5-9分**：较生硬冷淡<br>**0-4分**：怠慢、敷衍 |

---

## 🟡 **额外检测项**

1. **错别字检查**  
   - 是否存在错别字，列出错误词及正确写法。
2. **负面词语检测**  
   - 检查是否出现负面、敷衍、推脱等词语（例如 **XXX、YYY** 作为占位符表示）。

---

## 🚩 **重点关注 标记规则**

输出结果需新增字段 `重点关注`，满足以下任一情况即标记：
- **答非所问得分 ≤ 5**
- **回复逻辑性得分 ≤ 5**
- **存在错别字**
- **存在负面词语（出现 XXX 或 YYY）**

---

## 📥 **输入数据示例**

```json
{
  "群众诉求文本": "希望了解本地医保政策",
  "诉求类别": "咨询",
  "办理时长": 2,
  "诉求回复内容": "我们这里管不了，XXX，YYY。",
  "办理人员自评": "已解决",
  "与群众沟通情况": "已沟通且群众认可"
}
```

---

## 📤 **输出要求**

请以如下结构化 JSON 输出：

```json
{
  "score": 75,
  "evaluation_details": {
    "答非所问": {
      "得分": 5,
      "评价": "回复未针对群众诉求重点，内容偏题。"
    },
    "回复逻辑性": {
      "得分": 4,
      "评价": "表达不清，逻辑混乱，难以理解。"
    },
    "问题解决情况": {
      "得分": 7,
      "评价": "自评已解决，群众认可，但回复内容缺乏具体细节。"
    },
    "办理时长": {
      "得分": 7,
      "评价": "2个工作日内办结，办理迅速。"
    },
    "回复态度": {
      "得分": 9,
      "评价": "语气冷漠，存在推脱情绪。"
    },
    "错别字": {
      "存在": true,
      "错别字列表": [
        {
          "错误写法": "管不了",
          "正确写法": "会协调处理"
        }
      ]
    },
    "负面词语": {
      "存在": true,
      "词语列表": ["XXX", "YYY"]
    }
  },
  "重点关注": true,
  "suggestions": "请删除回复中的负面词语，重新明确回应群众关切，调整语气态度，避免敷衍推脱，并改正错别字。"
}
```

---

## ✅ **总结要求**

1. 按照上述 5 个评分维度进行逐项打分并简要评价。
2. **错别字和负面词语**需分别列出列表。
3. 满足重点关注条件时，`重点关注` 字段设为 `true`，否则为 `false`。
4. 最终以完整 JSON 格式输出。

---

# Python API 调用

封装一个 **Python 接口调用模板**，你可以直接用于调用大模型 API，实现自动传入诉求数据并接收评分结果，适合本地调用或集成到系统里。

以下模板默认使用 OpenAI 的 API（例如 GPT-4-Turbo），你也可以根据实际接入的大模型 API 进行修改。

---

## 🚀 **Python API 调用完整示例**

```python
import openai
import json

# 1️⃣ 设置 API Key（以 OpenAI 为例，换其他模型改对应参数）
openai.api_key = "YOUR_API_KEY"

# 2️⃣ 准备输入数据
input_data = {
    "群众诉求文本": "希望了解本地医保政策",
    "诉求类别": "咨询",
    "办理时长": 2,
    "诉求回复内容": "我们这里管不了，XXX，YYY。",
    "办理人员自评": "已解决",
    "与群众沟通情况": "已沟通且群众认可"
}

# 3️⃣ 定义完整提示词（嵌入评分标准 + 输出格式要求）
prompt = f"""
你是一个办件答复质检评分助手。请根据以下标准对群众网上诉求数据中的“诉求回复内容”进行评分，输出结构化 JSON 结果：

【评分维度及标准】

1️⃣ 答非所问（30分）：
- 回复是否回应群众诉求重点。
  - 25-30分：精准回应。
  - 15-24分：基本回应，细节略缺。
  - 5-14分：多处未回应或跑题。
  - 0-5分：严重跑题。

2️⃣ 回复逻辑性（30分）：
- 结构清晰、语言流畅。
  - 25-30分：逻辑严谨。
  - 15-24分：表达尚可。
  - 5-14分：逻辑不清。
  - 0-5分：混乱无序。

3️⃣ 问题解决情况（10分）：
- 结合“办理人员自评”和“群众沟通情况”判断：
  - 已解决+认可：8-10分。
  - 已解决+不认可或解释不足：5-7分。
  - 未解决/解决中/群众不认可：0-4分。

4️⃣ 办理时长（10分）：
- 咨询类 ≤5工作日，非咨询类 ≤15工作日。
  - 咨询类：3~5日得4-5分，1~2日6-7分。
  - 非咨询类：10~15日5分，5~9日6-7分，1~4日8-10分。
  - 超期每超1天扣2分，最多扣完10分。

5️⃣ 回复态度（语气情感）（20分）：
- 体现政府诚恳态度。
  - 16-20分：态度友好。
  - 10-15分：态度尚可。
  - 5-9分：冷淡生硬。
  - 0-4分：怠慢敷衍。

【错别字检查】：列出错误词及正确写法，若无则标“无”。
【负面词语检查】：如出现“XXX”“YYY”视为负面词语，需列出。

【重点关注规则】：
如存在以下任一情况，将重点关注标记为 true：
- 答非所问得分 ≤5
- 回复逻辑性得分 ≤5
- 存在错别字
- 存在负面词语（如 XXX, YYY）

【输出格式】：
请务必输出以下结构化 JSON：
{{
  "score": 总分,
  "evaluation_details": {{
    "答非所问": {{"得分": 整数, "评价": "说明"}},
    "回复逻辑性": {{"得分": 整数, "评价": "说明"}},
    "问题解决情况": {{"得分": 整数, "评价": "说明"}},
    "办理时长": {{"得分": 整数, "评价": "说明"}},
    "回复态度": {{"得分": 整数, "评价": "说明"}},
    "错别字": {{
      "存在": true/false,
      "错别字列表": [{{"错误写法": "XXX", "正确写法": "YYY"}}]
    }},
    "负面词语": {{
      "存在": true/false,
      "词语列表": ["XXX", "YYY"]
    }}
  }},
  "重点关注": true/false,
  "suggestions": "针对扣分项的改进建议"
}}

以下是群众诉求数据：
{json.dumps(input_data, ensure_ascii=False)}

请根据上述标准认真评分并输出符合 JSON 结构的结果。
"""

# 4️⃣ 发送请求
response = openai.ChatCompletion.create(
    model="gpt-4-turbo",
    messages=[{"role": "user", "content": prompt}],
    temperature=0
)

# 5️⃣ 获取并解析输出
result = response.choices[0].message['content']

# 6️⃣ 可直接解析为 JSON
try:
    json_result = json.loads(result)
    print("评分结果：")
    print(json.dumps(json_result, indent=2, ensure_ascii=False))
except json.JSONDecodeError:
    print("模型返回内容非标准JSON，请检查输出：")
    print(result)
```

---

## ✅ **核心要点总结**

- **提示词**内嵌了完整的评分标准、重点关注规则、JSON输出结构示例，直接调用无需再调整。
- 检测关键项：
  - 答非所问 ≤5分
  - 逻辑性 ≤5分
  - 存在错别字
  - 存在负面词语（XXX/YYY）
- **输出格式严格为 JSON**，易于后续系统自动化接入。
- **模型调用可切换为其他大模型**（如本地模型、国内API），只需替换 API Key 和接口调用部分。

---

好的，我帮你封装一个 **Python 接口调用模板**，你可以直接用于调用大模型 API，实现自动传入诉求数据并接收评分结果，适合本地调用或集成到系统里。

以下模板默认使用 OpenAI 的 API（例如 GPT-4-Turbo），你也可以根据实际接入的大模型 API 进行修改。

---

## 🚀 **Python API 调用完整示例**

```python
import openai
import json

# 1️⃣ 设置 API Key（以 OpenAI 为例，换其他模型改对应参数）
openai.api_key = "YOUR_API_KEY"

# 2️⃣ 准备输入数据
input_data = {
    "群众诉求文本": "希望了解本地医保政策",
    "诉求类别": "咨询",
    "办理时长": 2,
    "诉求回复内容": "我们这里管不了，XXX，YYY。",
    "办理人员自评": "已解决",
    "与群众沟通情况": "已沟通且群众认可"
}

# 3️⃣ 定义完整提示词（嵌入评分标准 + 输出格式要求）
prompt = f"""
你是一个办件答复质检评分助手。请根据以下标准对群众网上诉求数据中的“诉求回复内容”进行评分，输出结构化 JSON 结果：

【评分维度及标准】

1️⃣ 答非所问（30分）：
- 回复是否回应群众诉求重点。
  - 25-30分：精准回应。
  - 15-24分：基本回应，细节略缺。
  - 5-14分：多处未回应或跑题。
  - 0-5分：严重跑题。

2️⃣ 回复逻辑性（30分）：
- 结构清晰、语言流畅。
  - 25-30分：逻辑严谨。
  - 15-24分：表达尚可。
  - 5-14分：逻辑不清。
  - 0-5分：混乱无序。

3️⃣ 问题解决情况（10分）：
- 结合“办理人员自评”和“群众沟通情况”判断：
  - 已解决+认可：8-10分。
  - 已解决+不认可或解释不足：5-7分。
  - 未解决/解决中/群众不认可：0-4分。

4️⃣ 办理时长（10分）：
- 咨询类 ≤5工作日，非咨询类 ≤15工作日。
  - 咨询类：3~5日得4-5分，1~2日6-7分。
  - 非咨询类：10~15日5分，5~9日6-7分，1~4日8-10分。
  - 超期每超1天扣2分，最多扣完10分。

5️⃣ 回复态度（语气情感）（20分）：
- 体现政府诚恳态度。
  - 16-20分：态度友好。
  - 10-15分：态度尚可。
  - 5-9分：冷淡生硬。
  - 0-4分：怠慢敷衍。

【错别字检查】：列出错误词及正确写法，若无则标“无”。
【负面词语检查】：如出现“XXX”“YYY”视为负面词语，需列出。

【重点关注规则】：
如存在以下任一情况，将重点关注标记为 true：
- 答非所问得分 ≤5
- 回复逻辑性得分 ≤5
- 存在错别字
- 存在负面词语（如 XXX, YYY）

【输出格式】：
请务必输出以下结构化 JSON：
{{
  "score": 总分,
  "evaluation_details": {{
    "答非所问": {{"得分": 整数, "评价": "说明"}},
    "回复逻辑性": {{"得分": 整数, "评价": "说明"}},
    "问题解决情况": {{"得分": 整数, "评价": "说明"}},
    "办理时长": {{"得分": 整数, "评价": "说明"}},
    "回复态度": {{"得分": 整数, "评价": "说明"}},
    "错别字": {{
      "存在": true/false,
      "错别字列表": [{{"错误写法": "XXX", "正确写法": "YYY"}}]
    }},
    "负面词语": {{
      "存在": true/false,
      "词语列表": ["XXX", "YYY"]
    }}
  }},
  "重点关注": true/false,
  "suggestions": "针对扣分项的改进建议"
}}

以下是群众诉求数据：
{json.dumps(input_data, ensure_ascii=False)}

请根据上述标准认真评分并输出符合 JSON 结构的结果。
"""

# 4️⃣ 发送请求
response = openai.ChatCompletion.create(
    model="gpt-4-turbo",
    messages=[{"role": "user", "content": prompt}],
    temperature=0
)

# 5️⃣ 获取并解析输出
result = response.choices[0].message['content']

# 6️⃣ 可直接解析为 JSON
try:
    json_result = json.loads(result)
    print("评分结果：")
    print(json.dumps(json_result, indent=2, ensure_ascii=False))
except json.JSONDecodeError:
    print("模型返回内容非标准JSON，请检查输出：")
    print(result)
```

---

## ✅ **核心要点总结**

- **提示词**内嵌了完整的评分标准、重点关注规则、JSON输出结构示例，直接调用无需再调整。
- 检测关键项：
  - 答非所问 ≤5分
  - 逻辑性 ≤5分
  - 存在错别字
  - 存在负面词语（XXX/YYY）
- **输出格式严格为 JSON**，易于后续系统自动化接入。
- **模型调用可切换为其他大模型**（如本地模型、国内API），只需替换 API Key 和接口调用部分。

---

# 适配国内大模型 API(如通义千问、DeepSeek)

好的！我帮你适配成 **通义千问** 和 **DeepSeek** 两个大模型的调用版本，保持提示词完整不变，只调整 API 调用方式，保证你可以无缝接入这两个平台的接口。

---

## 🟢 **通义千问（DashScope）API 调用示例**

通义千问的 API 官方 SDK 是 **dashscope**，支持类似 Chat API 的调用方式。

### **安装 SDK：**

```bash
pip install dashscope
```

### **Python 调用示例：**

```python
from dashscope import Generation
import json

# 设置 API KEY
api_key = "YOUR_DASHSCOPE_API_KEY"

# 输入数据
input_data = {
  "群众诉求文本": "希望了解本地医保政策",
  "诉求类别": "咨询",
  "办理时长": 2,
  "诉求回复内容": "我们这里管不了，XXX，YYY。",
  "办理人员自评": "已解决",
  "与群众沟通情况": "已沟通且群众认可"
}

# 构建提示词
prompt = f"""
你是一个办件答复质检评分助手。请根据以下标准对群众网上诉求数据中的“诉求回复内容”进行评分，输出结构化 JSON 结果：

【评分维度及标准】

1️⃣ 答非所问（30分）：
- 回复是否回应群众诉求重点。
  - 25-30分：精准回应。
  - 15-24分：基本回应，细节略缺。
  - 5-14分：多处未回应或跑题。
  - 0-5分：严重跑题。

2️⃣ 回复逻辑性（30分）：
- 结构清晰、语言流畅。
  - 25-30分：逻辑严谨。
  - 15-24分：表达尚可。
  - 5-14分：逻辑不清。
  - 0-5分：混乱无序。

3️⃣ 问题解决情况（10分）：
- 结合“办理人员自评”和“群众沟通情况”判断：
  - 已解决+认可：8-10分。
  - 已解决+不认可或解释不足：5-7分。
  - 未解决/解决中/群众不认可：0-4分。

4️⃣ 办理时长（10分）：
- 咨询类 ≤5工作日，非咨询类 ≤15工作日。
  - 咨询类：3~5日得4-5分，1~2日6-7分。
  - 非咨询类：10~15日5分，5~9日6-7分，1~4日8-10分。
  - 超期每超1天扣2分，最多扣完10分。

5️⃣ 回复态度（语气情感）（20分）：
- 体现政府诚恳态度。
  - 16-20分：态度友好。
  - 10-15分：态度尚可。
  - 5-9分：冷淡生硬。
  - 0-4分：怠慢敷衍。

【错别字检查】：列出错误词及正确写法，若无则标“无”。
【负面词语检查】：如出现“XXX”“YYY”视为负面词语，需列出。

【重点关注规则】：
如存在以下任一情况，将重点关注标记为 true：
- 答非所问得分 ≤5
- 回复逻辑性得分 ≤5
- 存在错别字
- 存在负面词语（如 XXX, YYY）

【输出格式】：
请务必输出以下结构化 JSON：
{{
  "score": 总分,
  "evaluation_details": {{
    "答非所问": {{"得分": 整数, "评价": "说明"}},
    "回复逻辑性": {{"得分": 整数, "评价": "说明"}},
    "问题解决情况": {{"得分": 整数, "评价": "说明"}},
    "办理时长": {{"得分": 整数, "评价": "说明"}},
    "回复态度": {{"得分": 整数, "评价": "说明"}},
    "错别字": {{
      "存在": true/false,
      "错别字列表": [{{"错误写法": "XXX", "正确写法": "YYY"}}]
    }},
    "负面词语": {{
      "存在": true/false,
      "词语列表": ["XXX", "YYY"]
    }}
  }},
  "重点关注": true/false,
  "suggestions": "针对扣分项的改进建议"
}}

以下是群众诉求数据：
{json.dumps(input_data, ensure_ascii=False)}

请根据上述标准认真评分并输出符合 JSON 结构的结果。
"""

# 调用 DashScope API
response = Generation.call(
    model="qwen-plus",  # 可选 "qwen-plus" 或 "qwen-max"
    messages=[{"role": "user", "content": prompt}],
    api_key=api_key,
    temperature=0.1
)

# 获取内容
result_text = response['output']['choices'][0]['message']['content']
print("评分结果：")
print(result_text)

# 尝试 JSON 解析
try:
    result_json = json.loads(result_text)
    print(json.dumps(result_json, indent=2, ensure_ascii=False))
except:
    print("模型返回非标准JSON，需人工核查。")
```

---

## 🔵 **DeepSeek API 调用示例**

DeepSeek 同样兼容 OpenAI 接口规范，调用非常相似。

### **Python 调用示例：**

```python
import requests
import json

API_KEY = "YOUR_DEEPSEEK_API_KEY"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

input_data = {
  "群众诉求文本": "希望了解本地医保政策",
  "诉求类别": "咨询",
  "办理时长": 2,
  "诉求回复内容": "我们这里管不了，XXX，YYY。",
  "办理人员自评": "已解决",
  "与群众沟通情况": "已沟通且群众认可"
}

prompt = f"""
【完整提示词同上，保持一致】...

以下是群众诉求数据：
{json.dumps(input_data, ensure_ascii=False)}
"""

data = {
    "model": "deepseek-chat",  # 或 deepseek-coder
    "messages": [{"role": "user", "content": prompt}],
    "temperature": 0.1
}

response = requests.post(
    "https://api.deepseek.com/v1/chat/completions",
    headers=headers,
    json=data
)

result = response.json()
result_text = result['choices'][0]['message']['content']
print("评分结果：")
print(result_text)

# 尝试 JSON 解析
try:
    result_json = json.loads(result_text)
    print(json.dumps(result_json, indent=2, ensure_ascii=False))
except:
    print("模型返回非标准JSON，需人工校对。")
```

---

## 🚩 **总结**

| 大模型      | 关键库/接口                 | 备注                               |
|---------|-------------------------|----------------------------------|
| 通义千问   | `dashscope` SDK          | 官方 SDK，支持流式/完整回复                      |
| DeepSeek | OpenAI 兼容 REST API      | 可直接用 `requests` 请求，类似 GPT API         |

---


# 适配批量处理脚本

---

## 🚀 **完整批量处理脚本**

### 📁 目录结构建议

```
project/
├── input_data.json        # 输入数据，存放多条诉求
├── output_results/        # 存放评分结果 JSON 文件
├── log.txt                # 错误日志
└── batch_processor.py     # 主脚本
```

---

## 📄 **batch_processor.py**

```python
import json
import os
import time
import requests
from dashscope import Generation  # 通义千问 SDK

# ---------------------
# 配置参数
# ---------------------

# 通义千问
DASHSCOPE_API_KEY = "YOUR_DASHSCOPE_API_KEY"
DASHSCOPE_MODEL = "qwen-plus"  # or qwen-max

# DeepSeek
DEEPSEEK_API_KEY = "YOUR_DEEPSEEK_API_KEY"
DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"

# 批量数据文件
INPUT_FILE = "input_data.json"

# 结果保存目录
OUTPUT_DIR = "output_results"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 日志文件
LOG_FILE = "log.txt"

# ---------------------
# 通用提示词模板
# ---------------------

def generate_prompt(data):
    return f"""
你是一个办件答复质检评分助手。请根据以下标准对群众网上诉求数据中的“诉求回复内容”进行评分，输出结构化 JSON 结果：

【评分维度及标准】

1️⃣ 答非所问（30分）：
- 回复是否回应群众诉求重点。
  - 25-30分：精准回应。
  - 15-24分：基本回应，细节略缺。
  - 5-14分：多处未回应或跑题。
  - 0-5分：严重跑题。

2️⃣ 回复逻辑性（30分）：
- 结构清晰、语言流畅。
  - 25-30分：逻辑严谨。
  - 15-24分：表达尚可。
  - 5-14分：逻辑不清。
  - 0-5分：混乱无序。

3️⃣ 问题解决情况（10分）：
- 结合“办理人员自评”和“群众沟通情况”判断：
  - 已解决+认可：8-10分。
  - 已解决+不认可或解释不足：5-7分。
  - 未解决/解决中/群众不认可：0-4分。

4️⃣ 办理时长（10分）：
- 咨询类 ≤5工作日，非咨询类 ≤15工作日。
  - 咨询类：3~5日得4-5分，1~2日6-7分。
  - 非咨询类：10~15日5分，5~9日6-7分，1~4日8-10分。
  - 超期每超1天扣2分，最多扣完10分。

5️⃣ 回复态度（语气情感）（20分）：
- 体现政府诚恳态度。
  - 16-20分：态度友好。
  - 10-15分：态度尚可。
  - 5-9分：冷淡生硬。
  - 0-4分：怠慢敷衍。

【错别字检查】：列出错误词及正确写法，若无则标“无”。
【负面词语检查】：如出现“XXX”“YYY”视为负面词语，需列出。

【重点关注规则】：
如存在以下任一情况，将重点关注标记为 true：
- 答非所问得分 ≤5
- 回复逻辑性得分 ≤5
- 存在错别字
- 存在负面词语（如 XXX, YYY）

【输出格式】：
请务必输出以下结构化 JSON：
{{
  "score": 总分,
  "evaluation_details": {{
    "答非所问": {{"得分": 整数, "评价": "说明"}},
    "回复逻辑性": {{"得分": 整数, "评价": "说明"}},
    "问题解决情况": {{"得分": 整数, "评价": "说明"}},
    "办理时长": {{"得分": 整数, "评价": "说明"}},
    "回复态度": {{"得分": 整数, "评价": "说明"}},
    "错别字": {{
      "存在": true/false,
      "错别字列表": [{{"错误写法": "XXX", "正确写法": "YYY"}}]
    }},
    "负面词语": {{
      "存在": true/false,
      "词语列表": ["XXX", "YYY"]
    }}
  }},
  "重点关注": true/false,
  "suggestions": "针对扣分项的改进建议"
}}

以下是群众诉求数据：
{json.dumps(data, ensure_ascii=False)}
"""

# ---------------------
# 通义千问调用
# ---------------------

def call_dashscope(data):
    prompt = generate_prompt(data)
    try:
        response = Generation.call(
            model=DASHSCOPE_MODEL,
            messages=[{"role": "user", "content": prompt}],
            api_key=DASHSCOPE_API_KEY,
            temperature=0.1
        )
        result = response['output']['choices'][0]['message']['content']
        return result
    except Exception as e:
        return f"Error: {str(e)}"

# ---------------------
# DeepSeek调用
# ---------------------

def call_deepseek(data):
    prompt = generate_prompt(data)
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1
    }
    try:
        response = requests.post(DEEPSEEK_URL, headers=headers, json=payload)
        result = response.json()['choices'][0]['message']['content']
        return result
    except Exception as e:
        return f"Error: {str(e)}"

# ---------------------
# 主处理函数
# ---------------------

def process_batch(use_model="dashscope"):  # 可改为 deepseek
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data_list = json.load(f)

    for idx, data in enumerate(data_list):
        print(f"正在处理第 {idx+1} 条...")

        # 选择模型
        if use_model == "dashscope":
            result_text = call_dashscope(data)
        else:
            result_text = call_deepseek(data)

        # 保存
        try:
            result_json = json.loads(result_text)
            output_path = os.path.join(OUTPUT_DIR, f"result_{idx+1}.json")
            with open(output_path, 'w', encoding='utf-8') as out_f:
                json.dump(result_json, out_f, ensure_ascii=False, indent=2)
            print(f"✅ 第 {idx+1} 条处理完成，已保存 {output_path}")
        except Exception as e:
            print(f"❌ 第 {idx+1} 条处理失败，记录到日志")
            with open(LOG_FILE, 'a', encoding='utf-8') as log_f:
                log_f.write(f"第 {idx+1} 条出错: {str(e)}\n返回内容: {result_text}\n\n")
        time.sleep(1)  # 防止速率限制

# ---------------------
# 执行
# ---------------------

if __name__ == "__main__":
    process_batch(use_model="dashscope")  # 改为 deepseek 切换平台
```

---

## 📥 **输入数据样例 input_data.json**

```json
[
  {
    "群众诉求文本": "希望了解本地医保政策",
    "诉求类别": "咨询",
    "办理时长": 2,
    "诉求回复内容": "我们这里管不了，XXX，YYY。",
    "办理人员自评": "已解决",
    "与群众沟通情况": "已沟通且群众认可"
  },
  {
    "群众诉求文本": "举报乱倒垃圾",
    "诉求类别": "举报",
    "办理时长": 7,
    "诉求回复内容": "我们将会安排处理，谢谢您的反馈。",
    "办理人员自评": "已解决",
    "与群众沟通情况": "已沟通且群众认可"
  }
]
```

---

## 🚀 **使用说明**

1. 填好你的 **API Key**。
2. 将多条群众诉求数据存到 `input_data.json`。
3. 运行：

```bash
python batch_processor.py
```

4. 处理完成后，所有评分结果会自动保存到 `output_results/` 文件夹，每条单独一个 JSON 文件。
5. 出现错误的条目会记录到 `log.txt`。

---
封装一个**Flask 接口服务**，让你可以通过 HTTP 接口提交一条群众诉求数据，实时调用通义千问或 DeepSeek 模型进行评分，并返回标准 JSON 结果。

---

# 🚀 Flask 实时评分接口服务

---

## 📁 目录结构建议

```
project/
├── app.py                     # Flask 主接口服务
├── log.txt                    # 错误日志
└── output_results/            # 可选：保存历史评分结果
```

---

## 📄 app.py —— 主服务脚本

```python
from flask import Flask, request, jsonify
import json
import requests
import os
from dashscope import Generation  # 通义千问 SDK

# ------------------------
# 配置
# ------------------------

DASHSCOPE_API_KEY = "YOUR_DASHSCOPE_API_KEY"
DEEPSEEK_API_KEY = "YOUR_DEEPSEEK_API_KEY"

DASHSCOPE_MODEL = "qwen-plus"
DEEPSEEK_MODEL = "deepseek-chat"
DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"

OUTPUT_DIR = "output_results"
LOG_FILE = "log.txt"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ------------------------
# 初始化 Flask
# ------------------------

app = Flask(__name__)

# ------------------------
# 生成提示词
# ------------------------

def generate_prompt(data):
    return f"""
你是一个办件答复质检评分助手。请根据以下标准对群众网上诉求数据中的“诉求回复内容”进行评分，输出结构化 JSON 结果：

【评分维度及标准】……（略）……【与之前提示词一致，完整嵌入】

以下是群众诉求数据：
{json.dumps(data, ensure_ascii=False)}
"""

# ------------------------
# 模型调用函数
# ------------------------

def call_dashscope(data):
    prompt = generate_prompt(data)
    try:
        response = Generation.call(
            model=DASHSCOPE_MODEL,
            messages=[{"role": "user", "content": prompt}],
            api_key=DASHSCOPE_API_KEY,
            temperature=0.1
        )
        return response['output']['choices'][0]['message']['content']
    except Exception as e:
        return f"Error: {str(e)}"

def call_deepseek(data):
    prompt = generate_prompt(data)
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1
    }
    try:
        response = requests.post(DEEPSEEK_URL, headers=headers, json=payload)
        return response.json()['choices'][0]['message']['content']
    except Exception as e:
        return f"Error: {str(e)}"

# ------------------------
# Flask 路由 - 接口
# ------------------------

@app.route('/score', methods=['POST'])
def score_data():
    req_data = request.get_json()
    model = req_data.get("model", "dashscope")  # 默认通义千问
    data = req_data.get("data")

    if not data:
        return jsonify({"error": "Missing 'data' in request"}), 400

    # 调用模型
    if model == "dashscope":
        result_text = call_dashscope(data)
    elif model == "deepseek":
        result_text = call_deepseek(data)
    else:
        return jsonify({"error": "Invalid model name"}), 400

    # 尝试解析JSON结果
    try:
        result_json = json.loads(result_text)
        # 可选保存
        save_path = os.path.join(OUTPUT_DIR, f"result_{data.get('诉求类别', '未知')}_{data.get('办理时长', 0)}.json")
        with open(save_path, 'w', encoding='utf-8') as f:
            json.dump(result_json, f, ensure_ascii=False, indent=2)
        return jsonify(result_json)
    except Exception as e:
        with open(LOG_FILE, 'a', encoding='utf-8') as log_f:
            log_f.write(f"解析失败: {str(e)}\n内容: {result_text}\n\n")
        return jsonify({"error": "模型返回非标准JSON", "raw_result": result_text}), 500

# ------------------------
# 启动服务
# ------------------------

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

---

## 📥 请求格式（POST）

### URL：
```
http://<服务器IP>:5000/score
```

### 请求 JSON 示例：

```json
{
  "model": "dashscope",  // 或 deepseek
  "data": {
    "群众诉求文本": "希望了解本地医保政策",
    "诉求类别": "咨询",
    "办理时长": 2,
    "诉求回复内容": "我们这里管不了，XXX，YYY。",
    "办理人员自评": "已解决",
    "与群众沟通情况": "已沟通且群众认可"
  }
}
```

---

## 📤 返回示例

成功时：
```json
{
  "score": 75,
  "evaluation_details": {
    "答非所问": {"得分": 5, "评价": "回复未针对诉求"},
    "回复逻辑性": {"得分": 4, "评价": "表达不清"},
    ...
    "错别字": {"存在": true, "错别字列表": [...]},
    "负面词语": {"存在": true, "词语列表": ["XXX"]}
  },
  "重点关注": true,
  "suggestions": "请删除负面词语..."
}
```

失败时：
```json
{
  "error": "模型返回非标准JSON",
  "raw_result": "原始文本"
}
```

---

## 🚀 启动服务

```bash
python app.py
```

接口就监听在 `http://localhost:5000/score`

---

## 🚩 可扩展

- ✅ 支持接收文件上传批量评分
- ✅ 增加历史评分查询
- ✅ 接入认证与权限管理

---

# 前后端一体化

1. **前端页面**  
   - 支持 **批量导入 Excel 文件**（群众诉求数据）
   - 显示上传的诉求数据列表
   - **一键批量提交评分**
   - 实时展示评分进度 & 结果
   - **导出评分结果为 Excel 文件**

2. **后端接口扩展**  
   - 增加 **Excel 文件上传接口**
   - 增加 **批量评分接口**
   - 增加 **导出评分结果为 Excel 文件接口**

---

## 🚀 技术选型建议

| 部分   | 技术 |
|--------|----------------------------------------------------------|
| 前端   | **React + Ant Design + axios + xlsx.js (处理Excel)** |
| 后端   | Flask（你已有） + Flask-CORS（跨域） + pandas (处理Excel) |
| 接口调用 | 你已有通义千问 & DeepSeek 调用逻辑保持 |

---

## 📄 方案设计

---

### 1️⃣ **前端核心功能**

- **Excel文件上传**：
  - 使用 `<input type="file">` 上传 `.xlsx` 文件
  - 使用 `xlsx.js` 解析数据为 JSON
  - 表格显示上传的群众诉求内容

- **批量评分按钮**：
  - 点击后，循环调用 `/score` 接口
  - 进度条实时展示

- **评分结果展示**：
  - 显示各条诉求的评分总分 + 是否重点关注

- **导出评分结果**：
  - 使用 `xlsx` 库将评分结果导出为 `.xlsx` 文件

---

### 2️⃣ **后端接口扩展**

- **/upload_excel**  
  - 接收 Excel 文件，解析成 JSON，返回给前端展示

- **/batch_score**  
  - 接收批量数据 JSON
  - 循环调用已有的评分逻辑
  - 返回全部评分结果

- **/export_excel**  
  - 返回评分结果 Excel 文件

---
