# 诉求回复智能质检助手 API 使用指南

> 版本：v0.1.0
> 更新日期：2024-03-25

## 基础信息
- 基础URL: `http://localhost:5001`
- 请求方式: POST
- 数据格式: JSON
- 编码方式: UTF-8

## 评分接口

### 批量评分
- 接口: `/batch_score`
- 方法: POST
- 请求格式:
```json
{
    "data": [
        {
            "群众诉求文本": "希望了解本地医保政策",
            "类别": "咨询",
            "办理时长": "2",
            "诉求回复内容": "我们这里管不了，XXX，YYY。",
            "办理人员自评": "已解决",
            "与群众沟通情况": "已沟通且群众认可"
        }
    ]
}
```

<div class="note">
<p>注意：仅答非所问、回复逻辑性和回复态度三个指标的低分会导致重点关注</p>
</div>

<div class="warning">
<p>重要提示：请确保请求数据包含所有必要字段，否则可能导致评分失败</p>
</div>

- 响应格式:
```json
[
    {
        "score": 35,
        "evaluation_details": {
            "答非所问": {
                "得分": 5,
                "评价": "回复内容未精准回应群众关于医保政策的诉求"
            },
            "回复逻辑性": {
                "得分": 5,
                "评价": "回复内容结构混乱，缺乏清晰表达"
            },
            "问题解决情况": {
                "得分": 10,
                "评价": "虽然办理人员自评已解决且群众认可，但回复内容未体现具体解决措施"
            },
            "办理时长": {
                "得分": 10,
                "评价": "咨询类诉求2日内办结，符合高效要求"
            },
            "回复态度": {
                "得分": 5,
                "评价": "回复语气生硬冷淡"
            },
            "错别字": {
                "存在": false,
                "错别字列表": []
            },
            "负面词语": {
                "存在": true,
                "词语列表": ["管不了", "XXX", "YYY"]
            }
        },
        "重点关注": true,
        "suggestions": "建议明确回复内容，针对群众提出的医保政策进行详细解答；优化回复逻辑，确保语言流畅、条理清晰；提升回复态度，体现政府服务的关怀和善意。"
    }
]
```

### 负面词语管理接口

#### 获取负面词语列表
- 接口: `/negative_words`
- 方法: GET
- 响应格式:
```json
{
    "负面词语": ["XXX", "YYY", "管不了", "不归我们管", "没办法"],
    "分类": {
        "推诿敷衍": ["管不了", "不归我们管", "没办法"],
        "不规范用语": ["XXX", "YYY"],
        "消极态度": ["没时间", "太忙"],
        "模糊表达": ["研究研究", "考虑考虑"]
    }
}
```

#### 更新负面词语列表
- 接口: `/negative_words`
- 方法: POST
- 请求格式: 同上述响应格式

## Python调用示例
```python
import requests
import json

def score_replies(data):
    url = "http://localhost:5001/batch_score"
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json={"data": data}, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"评分请求失败: {str(e)}")
        return None

# 使用示例
data = [{
    "群众诉求文本": "希望了解本地医保政策",
    "类别": "咨询",
    "办理时长": "2",
    "诉求回复内容": "我们这里管不了，XXX，YYY。",
    "办理人员自评": "已解决",
    "与群众沟通情况": "已沟通且群众认可"
}]

results = score_replies(data)
print(json.dumps(results, ensure_ascii=False, indent=2))
```

## 注意事项
1. 请确保请求数据包含所有必要字段
2. 建议批量处理时每批数据不超过100条
3. 接口调用频率建议不超过每秒10次
4. 如遇到错误，请查看返回的错误信息进行排查 