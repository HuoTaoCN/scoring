# 诉求回复智能质检助手

![License](https://img.shields.io/badge/license-MIT-blue.svg)  
![Version](https://img.shields.io/badge/version-0.1.0-orange.svg)  
![Python](https://img.shields.io/badge/python-3.9-blue.svg)

📝 **项目简介**  
诉求回复智能质检助手是一个专门用于评估和优化政务服务中群众诉求回复质量的系统。该系统能够智能分析回复内容的质量，提供评分和改进建议，帮助提升政务服务水平。

---

## 🚀 功能特性

- **智能评分**: 自动评估诉求回复内容的质量和完整性
- **数据分析**: 支持Excel格式的数据导入和分析
- **用户友好**: 提供直观的Web界面，便于操作和使用
- **实时反馈**: 即时生成评分结果和改进建议

---

## 📦 安装指南

### 依赖项
确保已安装以下依赖：
- Python 3.9 或更高版本
- pip (Python包管理器)

### 安装步骤
1. 克隆仓库：
   ```bash
   git clone https://github.com/HuoTaoCN/scoring.git
   ```
2. 进入项目目录：
   ```bash
   cd scoring
   ```
3. 创建并激活虚拟环境：
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # 或
   .\venv\Scripts\activate  # Windows
   ```
4. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

### 配置 API Key
1. 在项目根目录下创建 `.env` 文件：
   ```bash
   touch .env  # Linux/Mac
   # 或
   type nul > .env  # Windows
   ```

2. 在 `.env` 文件中添加你的 API Key：
   ```
   # 大语言模型 API 配置
   DASHSCOPE_API_KEY=your_dashscope_key_here  # 阿里云通义千问 API Key
   ```

3. 获取 API Key：
   - 阿里云通义千问 API Key: 访问 [通义千问开放平台](https://dashscope.console.aliyun.com/) 注册并获取

⚠️ **注意事项**：
- 请勿将包含真实 API Key 的 `.env` 文件提交到代码仓库
- `.env` 文件已在 `.gitignore` 中配置为忽略
- 首次使用时需要替换为自己的 API Key
- 如果没有配置 API Key，系统将无法正常工作

---

## 🛠 使用说明

### 启动服务
1. 启动后端服务：
   ```bash
   # 确保在项目根目录下，且虚拟环境已激活
   cd backend
   python app.py
   ```
   后端服务将在 http://localhost:5001 启动

2. 启动前端页面：
   ```bash
   # 在新的终端窗口中
   cd frontend
   ```
   有两种方式可以打开前端页面：
   - 使用 Python 内置的 HTTP 服务器：
     ```bash
     # Python 3.x
     python -m http.server 5002
     ```
     然后在浏览器中访问 http://localhost:5002

   - 或直接在浏览器中打开 `frontend/index.html` 文件

### 使用流程
1. 在浏览器中打开前端页面
2. 上传 Excel 文件（文件格式参考下方说明）
3. 点击"开始评分"按钮
4. 等待评分结果显示
5. 可以导出评分结果为 Excel 文件

### 数据格式
系统支持的 Excel 文件应包含以下字段：
- 群众诉求文本
- 诉求类别
- 办理时长
- 诉求回复内容
- 办理人员自评
- 与群众沟通情况

### 常见问题
1. 如果遇到跨域问题，请确保：
   - 后端服务正常运行在 5001 端口
   - 前端页面通过 HTTP 服务器访问（不要直接双击打开 HTML 文件）

2. 如果遇到 API 调用失败：
   - 检查 `.env` 文件中的 API Key 是否正确配置
   - 确保网络连接正常
   - 查看后端服务控制台的错误日志

---

## 🧪 测试

可以使用示例数据进行测试：
1. 运行 `create_example.py` 生成示例数据
2. 通过Web界面上传生成的Excel文件
3. 查看评分结果和建议

---

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：
1. Fork 项目
2. 创建新分支 (`git checkout -b feature/YourFeatureName`)
3. 提交更改 (`git commit -m 'Add some feature'`)
4. 推送分支 (`git push origin feature/YourFeatureName`)
5. 提交 Pull Request

---

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 发布。

---

## 📞 联系方式

如有问题，请通过以下方式联系：
- 提交 Issue
- 发送 Pull Request 