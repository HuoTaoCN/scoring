from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import dashscope
from dashscope import Generation
import os
import logging
import mistune
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 从环境变量获取API key
dashscope.api_key = os.getenv('DASHSCOPE_API_KEY')
if not dashscope.api_key:
    logger.error("未找到 DASHSCOPE_API_KEY 环境变量")
    raise ValueError("请在 .env 文件中设置 DASHSCOPE_API_KEY")

MODEL = "qwen-plus"

def load_negative_words():
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'negative_words.json')
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
            return config
    except Exception as e:
        return {"负面词语": [], "分类": {}}

def generate_prompt(data):
    # 加载负面词语配置
    negative_words_config = load_negative_words()
    negative_words = negative_words_config["负面词语"]
    
    return f"""
你是一个诉求回复智能质检助手。请根据以下标准对群众网上诉求数据中的"诉求回复内容"进行评分，输出结构化 JSON 结果：

【评分维度及标准】
1️⃣ 答非所问（30分）：
- 回复是否回应群众诉求重点。
  - 25-30分：精准回应。
  - 15-24分：基本回应，细节略缺。
  - 5-14分：多处未回应或跑题。
  - 0-4分：严重跑题。

2️⃣ 回复逻辑性（30分）：
- 结构清晰、语言流畅。
  - 25-30分：逻辑严谨。
  - 15-24分：表达尚可。
  - 5-14分：逻辑不清。
  - 0-4分：混乱无序。

3️⃣ 问题解决情况（10分）：
- 综合评判标准：
  - 8-10分：已解决且群众认可，回复内容清晰体现具体解决措施
  - 5-7分：基本解决但说明不够详细，或群众不完全认可
  - 0-4分：未解决/在处理中/未说明具体措施

4️⃣ 办理时长（10分）：
- 咨询类：
  - 1-2日：8-10分，办理时间越短得分越高
  - 3-5日：6-7分
  - 超5日：每超1天扣2分
- 非咨询类：
  - 1-4日：8-10分
  - 5-9日：6-7分
  - 10-15日：5分
  - 超15日：每超1天扣2分

5️⃣ 回复态度（20分）：
- 16-20分：态度友好，关怀到位
- 10-15分：语气尚可，有少量冷漠
- 5-9分：较生硬冷淡
- 0-4分：怠慢、敷衍

注意事项：
1. 问题解决情况评分时，必须同时满足以下条件才能得到8-10分：
   - 办理人员自评显示已解决
   - 群众认可
   - 回复内容中明确说明了具体解决措施
2. 如果回复内容中未体现具体解决措施，即使办理人员自评为已解决且群众认可，最高只能得7分
3. 重点关注标记规则：满足以下任一情况即标记为重点关注：
   - 答非所问得分 < 5分
   - 回复逻辑性得分 < 5分
   - 回复态度得分 < 5分
   - 存在错别字
   - 存在负面词语（包括 XXX、YYY 等）

4. 错别字检查要特别注意以下情况：
   - 同音字错误：如"按排/安排"、"在/再"、"的/地/得"等
   - 形近字错误
   - 常见错误用字

5. 负面词语检查：
   检查是否包含以下负面词语：
   {json.dumps(negative_words, ensure_ascii=False, indent=3)}

以下是群众诉求数据：
{json.dumps(data, ensure_ascii=False)}

请仔细评估每个维度，确保评分准确。特别注意检查文本中是否包含错别字和负面词语，这些都会导致重点关注标记。输出格式要求：
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
    "suggestions": "改进建议"
}}

注意：评估重点关注时，除了检查三个主要指标的低分外，还要检查是否存在错别字或负面词语，任一情况都应标记为重点关注。

请特别注意：
1. 只有得分低于上述阈值才标记为重点关注
2. 仅检查这三个维度的得分（答非所问、回复逻辑性、回复态度）
3. 问题解决情况和办理时长的低分不会导致重点关注
4. 确保评分和重点关注标记的一致性
"""

def call_model(data):
    prompt = generate_prompt(data)
    try:
        response = Generation.call(
            model=MODEL,
            messages=[{
                "role": "user", 
                "content": prompt
            }],
            result_format='message',
            temperature=0.1,
            max_tokens=2000,
            top_p=0.8,
            enable_search=True,
        )
        
        if response.status_code == 200:
            result = response.output.choices[0].message.content
            try:
                json_result = json.loads(result)
                
                # 验证并修正分值
                details = json_result.get('evaluation_details', {})
                logger.info(f"原始评分详情: {json.dumps(details, ensure_ascii=False)}")
                
                # 验证各维度分值不超过最大值
                max_scores = {
                    '答非所问': 30,
                    '回复逻辑性': 30,
                    '问题解决情况': 10,
                    '办理时长': 10,
                    '回复态度': 20
                }
                
                # 记录修正前的分数
                original_scores = {}
                for dimension, max_score in max_scores.items():
                    if dimension in details:
                        original_scores[dimension] = details[dimension].get('得分', 0)
                
                # 验证和修正分值
                for dimension, max_score in max_scores.items():
                    if dimension in details:
                        score = details[dimension].get('得分', 0)
                        if not isinstance(score, (int, float)):
                            logger.warning(f"{dimension} 得分格式错误: {score}, 设置为0")
                            score = 0
                        if score > max_score:
                            logger.warning(f"{dimension} 得分超出上限: {score} > {max_score}")
                            details[dimension]['得分'] = max_score
                            details[dimension]['评价'] += f"（原始分值 {score} 超出上限，已修正为 {max_score}）"
                        elif score < 0:
                            logger.warning(f"{dimension} 得分小于0: {score}")
                            details[dimension]['得分'] = 0
                            details[dimension]['评价'] += f"（原始分值 {score} 小于0，已修正为 0）"
                        else:
                            details[dimension]['得分'] = int(score)  # 确保分数为整数
                
                # 重新计算总分
                total_score = sum(details[dim].get('得分', 0) for dim in max_scores.keys())
                json_result['score'] = total_score
                
                # 验证重点关注标记的正确性
                should_be_concerned = False
                concern_reasons = []
                
                # 检查三个主要指标
                if details.get('答非所问', {}).get('得分', 0) < 5:
                    should_be_concerned = True
                    concern_reasons.append(f"答非所问得分过低: {details['答非所问']['得分']}分")
                
                if details.get('回复逻辑性', {}).get('得分', 0) < 5:
                    should_be_concerned = True
                    concern_reasons.append(f"回复逻辑性得分过低: {details['回复逻辑性']['得分']}分")
                
                if details.get('回复态度', {}).get('得分', 0) < 5:
                    should_be_concerned = True
                    concern_reasons.append(f"回复态度得分过低: {details['回复态度']['得分']}分")
                
                # 检查错别字
                if details.get('错别字', {}).get('存在', False):
                    should_be_concerned = True
                    错别字列表 = details['错别字'].get('错别字列表', [])
                    if 错别字列表:
                        concern_reasons.append(f"存在错别字: {', '.join(item['错误写法'] for item in 错别字列表)}")
                
                # 检查负面词语
                if details.get('负面词语', {}).get('存在', False):
                    should_be_concerned = True
                    词语列表 = details['负面词语'].get('词语列表', [])
                    if 词语列表:
                        concern_reasons.append(f"存在负面词语: {', '.join(词语列表)}")
                
                # 记录判断过程
                logger.info(f"重点关注判断结果: {should_be_concerned}")
                if concern_reasons:
                    logger.info(f"重点关注原因: {'; '.join(concern_reasons)}")
                
                # 更正重点关注标记
                json_result['重点关注'] = should_be_concerned
                
                # 记录分数修正情况
                if original_scores != {dim: details[dim].get('得分', 0) for dim in max_scores.keys()}:
                    logger.info(f"分数修正情况 - 原始分数: {original_scores}, 修正后: {json.dumps({dim: details[dim].get('得分', 0) for dim in max_scores.keys()}, ensure_ascii=False)}")
                
                return json_result
                
            except json.JSONDecodeError:
                try:
                    start = result.find('{')
                    end = result.rfind('}') + 1
                    if start >= 0 and end > start:
                        json_str = result[start:end]
                        return json.loads(json_str)
                except:
                    pass
                
                return {
                    "error": "模型返回的不是有效的JSON格式",
                    "score": 0,
                    "evaluation_details": {
                        "答非所问": {"得分": 0, "评价": "评分失败"},
                        "回复逻辑性": {"得分": 0, "评价": "评分失败"},
                        "问题解决情况": {"得分": 0, "评价": "评分失败"},
                        "办理时长": {"得分": 0, "评价": "评分失败"},
                        "回复态度": {"得分": 0, "评价": "评分失败"},
                        "错别字": {"存在": False, "错别字列表": []},
                        "负面词语": {"存在": False, "词语列表": []}
                    },
                    "重点关注": False,
                    "suggestions": "模型返回格式错误，请重试"
                }
        else:
            return {
                "error": f"API调用失败: {response.code}",
                "score": 0,
                "evaluation_details": {
                    "答非所问": {"得分": 0, "评价": "API调用失败"},
                    "回复逻辑性": {"得分": 0, "评价": "API调用失败"},
                    "问题解决情况": {"得分": 0, "评价": "API调用失败"},
                    "办理时长": {"得分": 0, "评价": "API调用失败"},
                    "回复态度": {"得分": 0, "评价": "API调用失败"},
                    "错别字": {"存在": False, "错别字列表": []},
                    "负面词语": {"存在": False, "词语列表": []}
                },
                "重点关注": False,
                "suggestions": "API调用失败，请重试"
            }
            
    except Exception as e:
        return {
            "error": f"调用出错: {str(e)}",
            "score": 0,
            "evaluation_details": {
                "答非所问": {"得分": 0, "评价": "系统错误"},
                "回复逻辑性": {"得分": 0, "评价": "系统错误"},
                "问题解决情况": {"得分": 0, "评价": "系统错误"},
                "办理时长": {"得分": 0, "评价": "系统错误"},
                "回复态度": {"得分": 0, "评价": "系统错误"},
                "错别字": {"存在": False, "错别字列表": []},
                "负面词语": {"存在": False, "词语列表": []}
            },
            "重点关注": False,
            "suggestions": "系统错误，请重试"
        }

@app.route('/batch_score', methods=['POST'])
def batch_score():
    try:
        data = request.json.get('data', [])
        if not data:
            return jsonify({"error": "没有接收到数据"}), 400
            
        results = []
        for item in data:
            results.append(call_model(item))
        
        return jsonify(results)
        
    except Exception as e:
        return jsonify({
            "error": f"处理请求时出错: {str(e)}"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})

@app.route('/negative_words', methods=['GET'])
def get_negative_words():
    config = load_negative_words()
    return jsonify(config)

@app.route('/negative_words', methods=['POST'])
def update_negative_words():
    try:
        new_config = request.json
        config_path = os.path.join(os.path.dirname(__file__), 'config', 'negative_words.json')
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(new_config, f, ensure_ascii=False, indent=4)
        return jsonify({"message": "更新成功"})
    except Exception as e:
        return jsonify({"error": f"更新失败: {str(e)}"}), 500

# 添加代码高亮支持
class HighlightRenderer(mistune.HTMLRenderer):
    def block_code(self, text, info=None):
        if info:
            try:
                lexer = get_lexer_by_name(info, stripall=True)
            except ValueError:
                lexer = get_lexer_by_name('text', stripall=True)
        else:
            lexer = get_lexer_by_name('text', stripall=True)
        formatter = HtmlFormatter(style='default')
        return highlight(text, lexer, formatter)

@app.route('/api_guide')
def serve_api_guide():
    try:
        docs_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'docs', 'api_guide.md'))
        
        if not os.path.exists(docs_path):
            logger.error(f"文档文件不存在: {docs_path}")
            return f"文档文件不存在: {docs_path}", 404
            
        try:
            with open(docs_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # 配置 Markdown 渲染器
                renderer = HighlightRenderer(escape=False)
                markdown = mistune.create_markdown(
                    renderer=renderer,
                    plugins=['strikethrough', 'footnotes', 'table']
                )
                
                # 渲染 Markdown
                html_content = markdown(content)
                
                # 获取代码高亮样式
                highlight_css = HtmlFormatter(style='default').get_style_defs('.highlight')
                
                page_content = f"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>诉求回复智能质检助手 - API调用指南</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown.min.css">
                    <style>
                        body {{
                            background-color: #ffffff;
                            margin: 0;
                            padding: 0;
                        }}
                        .markdown-body {{
                            box-sizing: border-box;
                            min-width: 200px;
                            max-width: 1200px;
                            margin: 0 auto;
                            padding: 45px;
                            background-color: #ffffff;
                        }}
                        {highlight_css}
                        .highlight {{
                            background-color: #f6f8fa;
                            border-radius: 6px;
                            margin: 1em 0;
                            border: 1px solid #e1e4e8;
                        }}
                        .highlight pre {{
                            padding: 16px;
                            margin: 0;
                            overflow: auto;
                            font-size: 85%;
                            line-height: 1.45;
                            color: #24292e;
                        }}
                        code {{
                            font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace;
                            font-size: 85%;
                            padding: 0.2em 0.4em;
                            margin: 0;
                            background-color: rgba(175,184,193,0.2);
                            border-radius: 6px;
                            color: #24292e;
                        }}
                        pre code {{
                            padding: 0;
                            margin: 0;
                            border-radius: 0;
                            background: none;
                            font-size: inherit;
                            white-space: pre;
                            color: inherit;
                        }}
                        h1, h2 {{
                            padding-bottom: 0.3em;
                            border-bottom: 1px solid #eaecef;
                            color: #24292e;
                        }}
                        p, li {{
                            color: #24292e;
                            line-height: 1.6;
                        }}
                        a {{
                            color: #0366d6;
                            text-decoration: none;
                        }}
                        a:hover {{
                            text-decoration: underline;
                        }}
                        .note {{
                            background-color: #f1f8ff;
                            border-left: 4px solid #0366d6;
                            padding: 1em;
                            margin: 1em 0;
                            border-radius: 0 6px 6px 0;
                        }}
                        .note p {{
                            margin: 0;
                            color: #24292e;
                        }}
                        .warning {{
                            background-color: #fff5f7;
                            border-left: 4px solid #d73a49;
                            padding: 1em;
                            margin: 1em 0;
                            border-radius: 0 6px 6px 0;
                        }}
                        .warning p {{
                            margin: 0;
                            color: #24292e;
                        }}
                        ul, ol {{
                            padding-left: 2em;
                        }}
                        li {{
                            margin: 0.5em 0;
                        }}
                        table {{
                            border-collapse: collapse;
                            width: 100%;
                            margin: 1em 0;
                        }}
                        th, td {{
                            border: 1px solid #e1e4e8;
                            padding: 8px 12px;
                        }}
                        th {{
                            background-color: #f6f8fa;
                        }}
                        @media (max-width: 767px) {{
                            .markdown-body {{
                                padding: 15px;
                            }}
                        }}
                    </style>
                </head>
                <body class="markdown-body">
                    {html_content}
                </body>
                </html>
                """
                return page_content, 200, {'Content-Type': 'text/html; charset=utf-8'}
        except UnicodeDecodeError as e:
            logger.error(f"文档编码错误: {str(e)}")
            return "文档编码错误，请确保文件为UTF-8编码", 500
    except Exception as e:
        logger.error(f"文档加载失败: {str(e)}")
        return f"文档加载失败: {str(e)}", 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True) 