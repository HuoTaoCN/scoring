#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
- 群众诉求回复内容评分系统示例数据生成脚本
+ 诉求回复智能质检助手示例数据生成脚本
"""

import sys
import os
import json

# 添加用户级别的 Python 包路径
user_site_packages = os.path.expanduser('~/Library/Python/3.9/lib/python/site-packages')
sys.path.append(user_site_packages)

import pandas as pd

def create_example_file():
    print("开始创建示例文件...")
    
    # 确保 example 目录存在
    try:
        os.makedirs('example', exist_ok=True)
        print("已确保 example 目录存在")
    except Exception as e:
        print(f"创建目录时出错：{str(e)}")
        return

    # 创建示例数据
    data = {
        '群众诉求文本': [
            '希望了解本地医保政策',
            '反映小区垃圾清运不及时',
            '建议增设公交站台'
        ],
        '诉求类别': ['咨询', '投诉', '建议'],
        '办理时长': [2, 5, 7],
        '诉求回复内容': [
            '我们这里管不了，XXX，YYY。',
            '已安排环卫部门处理，将加强监管。',
            '感谢您的建议，我们将认真研究。'
        ],
        '办理人员自评': ['已解决', '已解决', '已解决'],
        '与群众沟通情况': [
            '已沟通且群众认可',
            '已沟通且群众认可',
            '已沟通但群众不认可'
        ]
    }

    # 在生成示例数据后，打印确认数据格式
    print("生成的示例数据:")
    print(json.dumps(data, ensure_ascii=False, indent=2))

    try:
        # 创建DataFrame
        print("正在创建DataFrame...")
        df = pd.DataFrame(data)
        
        # 获取当前脚本的绝对路径
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        # 构建输出文件的完整路径
        output_path = os.path.join(current_dir, 'example', 'example.xlsx')
        
        # 保存为Excel文件
        print(f"正在保存到：{output_path}")
        df.to_excel(output_path, index=False)
        print(f"示例文件已成功创建：{output_path}")
        
        # 验证文件是否创建成功
        if os.path.exists(output_path):
            print(f"文件创建成功，大小：{os.path.getsize(output_path)} 字节")
        else:
            print("文件似乎没有被创建")
            
    except Exception as e:
        print(f"创建示例文件时出错：{str(e)}")
        print(f"Python版本：{sys.version}")
        print(f"pandas版本：{pd.__version__}")

if __name__ == "__main__":
    create_example_file() 