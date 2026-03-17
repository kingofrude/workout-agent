# Knowledge Capture - 知识管理工作流

自动化的知识捕获和发布工具，帮助你快速记录和整理知识内容。

## 🎯 功能特性

- **智能触发**：支持 `/summary` 命令和自然语言触发
- **多种内容源**：对话总结、文章链接、截图分析、纯文本
- **自动分类**：基于关键词和上下文智能推荐分类
- **三种模板**：精简版、标准版、详细版，自动选择
- **图片支持**：自动上传到图床并嵌入文档
- **Git 集成**：自动推送到远程仓库
- **本地备份**：失败时保存到本地，支持重试

## 📦 安装

### 1. 安装 Knowledge Capture Skill

```bash
# 克隆或下载此仓库
cd /Users/gui/Desktop/code/my-skills/skills/knowledge-capture

# 确保文件结构正确
tree
# .
# ├── README.md
# ├── SKILL.md
# └── references
#     ├── categories.md
#     └── templates.md
```

### 2. 安装依赖 Skills

**必需依赖：**

- **Git Action Skill**（处理 Git 操作）
  - 如果你还没有这个 Skill，需要先安装
  - 或者手动使用 Bash 工具执行 Git 命令

**可选依赖：**

- **图床上传 Skill**（上传图片到 GitHub）
  - 没有这个 Skill 也能正常工作，只是无法自动上传图片

### 3. 配置知识库仓库

设置环境变量（可选）：

```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
export KNOWLEDGE_REPO=/path/to/your/knowledge-repo

# 如果使用图床
export IMAGE_REPO=/path/to/your/image-repo
```

如果不设置环境变量，首次使用时 AI 会询问你的仓库路径。

## 🚀 使用方法

### 触发方式

**命令触发：**
```
/summary
/summary https://example.com/article
```

**自然语言触发：**
```
"帮我总结一下刚才的对话"
"保存这篇文章"
"把这个记录到知识库"
"整理成文档"
"记录下来"
```

### 使用场景

#### 场景 1：对话总结

```
# 1. 与 AI 讨论问题（比如讨论 Redis 持久化机制）
你：Redis 的持久化机制有哪些？
AI：[解释 RDB 和 AOF...]

# 2. 对话结束后，触发总结
你：帮我总结一下

# 3. AI 自动分析对话，生成文档并推送
```

#### 场景 2：保存文章

```
# 提供文章链接
你：/summary https://example.com/microservices-best-practices

# 或使用自然语言
你：保存这篇文章 https://example.com/microservices-best-practices

# AI 会抓取文章内容，生成摘要，并推送到仓库
```

#### 场景 3：截图记录

```
# 上传截图并说明
你：[上传架构图] 把这个记录到知识库

# AI 会分析图片内容，上传到图床，生成文档
```

#### 场景 4：快速记录

```
你：记录一下：今天学到了 Redis 的发布订阅模式，可以用于实时消息推送

# AI 会使用精简版模板快速保存
```

## 📝 工作流程

1. **依赖检查** - 检查 Git Action Skill 是否安装
2. **识别内容** - 自动判断内容类型（对话/文章/截图/文本）
3. **分类推荐** - 基于关键词推荐合适的分类目录
4. **选择模板** - 根据内容长度自动选择模板
5. **预览确认** - 显示文档预览，允许修改
6. **处理图片** - 上传图片到图床（如果有）
7. **推送仓库** - 自动提交并推送到远程仓库
8. **错误处理** - 失败时保存本地备份，提供重试

## 📁 文档格式

### 文件名格式

```
[YYYY.MM.DD] 标题.md
```

示例：
```
[2026.03.17] Redis持久化机制.md
[2026.03.17] 微服务架构设计最佳实践.md
```

### Front Matter

```yaml
---
date: 2026-03-17 14:30:00
category: 数据库
tags: [Redis, 持久化, RDB, AOF]
source: 对话总结
---
```

### 三种模板

1. **精简版** - 适合快速记录（< 200 字）
2. **标准版** - 适合常规总结（200-1000 字）
3. **详细版** - 适合长文章和深度笔记（> 1000 字）

详见 [references/templates.md](references/templates.md)

## 📂 分类体系

预定义分类包括：

- `docs/backend/` - 后端开发
- `docs/frontend/` - 前端开发
- `docs/database/` - 数据库
- `docs/devops/` - DevOps
- `docs/architecture/` - 架构设计
- `docs/system-design/` - 系统设计
- `docs/reading/` - 阅读笔记
- `docs/learning-notes/` - 学习笔记
- `docs/thoughts/` - 技术思考
- `docs/troubleshooting/` - 问题记录

支持多级目录：
```
docs/backend/nodejs/
docs/database/redis/persistence/
docs/architecture/microservices/patterns/
```

详见 [references/categories.md](references/categories.md)

## 🛠️ 辅助命令

### `/retry-push` - 重试推送

如果推送失败，可以使用此命令重新尝试：

```bash
/retry-push /tmp/knowledge-capture/2026-03-17/[2026.03.17] Redis持久化机制.md
```

### `/list-backups` - 查看备份

列出所有本地备份文件：

```bash
/list-backups
```

## ⚙️ 配置选项

### 环境变量

```bash
# 知识库仓库路径
export KNOWLEDGE_REPO=/path/to/knowledge-repo

# 图床仓库路径（可选）
export IMAGE_REPO=/path/to/image-repo

# 默认分类（可选，如果无法推断时使用）
export DEFAULT_CATEGORY=docs/learning-notes
```

### 自定义模板

如果你想创建自定义模板，可以在 `references/` 目录下创建 `custom-templates.md`：

```bash
touch references/custom-templates.md
```

然后在文件中定义你的模板格式。

## 📋 示例

### 示例 1：保存 Redis 对话总结

```
用户: /summary

AI: 正在分析对话内容...

检测到内容类型：对话总结
讨论主题：Redis 持久化机制

核心要点：
- RDB 快照：全量备份，适合备份恢复
- AOF 日志：增量备份，数据安全性更高
- 混合持久化：结合两者优势

推荐分类：数据库 (docs/database/)
是否正确？(y/n)

用户: y

AI:
📄 文档预览
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

文件名：[2026.03.17] Redis持久化机制.md
分类：docs/database/
模板：标准版

[显示完整文档...]

确认保存并推送？(y/n)

用户: y

AI:
✅ 文档已成功保存！

📄 文件：docs/database/[2026.03.17] Redis持久化机制.md
🔗 查看：https://gitlab.com/.../blob/main/docs/database/[2026.03.17]%20Redis持久化机制.md
🚀 部署状态：CI/CD 流水线已触发
```

### 示例 2：保存文章

```
用户: 保存这篇文章 https://example.com/microservices-article

AI: 正在抓取文章内容...

标题：微服务架构设计最佳实践
作者：张三
发布时间：2026-03-15

推荐分类：架构设计 (docs/architecture/)
是否正确？(y/n)

用户: 我想创建一个新目录 docs/system-design/

AI: 好的，将创建 docs/system-design/ 目录

[显示详细版预览...]

确认保存吗？(y/n)

用户: y

AI:
✅ 已保存到 docs/system-design/[2026.03.17] 微服务架构设计最佳实践.md
🔗 查看：https://gitlab.com/.../blob/main/docs/system-design/[2026.03.17]%20微服务架构设计最佳实践.md
```

## 🔧 故障排除

### 问题 1：Git Action Skill 未安装

```
❌ 检测到缺失依赖：Git Action Skill

解决方案：
1. 安装 Git Action Skill
2. 或者在 SKILL.md 中启用 Bash 工具执行 Git 命令
```

### 问题 2：推送失败

```
❌ 推送失败：网络连接超时

解决方案：
1. 检查网络连接
2. 使用 /retry-push 命令重试
3. 或手动推送本地备份文件
```

### 问题 3：仓库未配置

```
❌ 知识库仓库未配置

解决方案：
1. 设置环境变量 KNOWLEDGE_REPO
2. 或在首次使用时告诉 AI 你的仓库路径
```

### 问题 4：图片上传失败

```
⚠️  图片上传失败，将跳过图片

解决方案：
1. 安装图床上传 Skill
2. 或手动上传图片后更新文档
3. 或接受跳过图片，仅保存文本内容
```

## 📚 进阶使用

### 自定义分类

创建自己的分类体系：

```bash
# 1. 创建目录
mkdir -p docs/my-custom-category

# 2. 保存内容时选择自定义目录
你：保存到 docs/my-custom-category/
```

### 批量导入

如果你有多篇文章或笔记需要导入：

```
你：我有 5 篇文章需要导入到知识库

AI：好的，请逐一提供文章链接或内容，我会依次处理。

你：第一篇：https://example.com/article1
[AI 处理...]

你：第二篇：https://example.com/article2
[AI 处理...]

...
```

### 修改已保存的文档

如果需要修改已经保存的文档：

```
你：帮我修改昨天保存的 Redis 文档，添加一些补充内容

AI：好的，请告诉我需要添加的内容，我会帮你更新文档并重新推送。
```

## 🤝 贡献

如果你有改进建议或发现 bug，欢迎提交 issue 或 PR。

### 改进方向

- [ ] 支持多仓库配置
- [ ] 智能标签提取
- [ ] 相关文档推荐
- [ ] 分类学习和个性化推荐
- [ ] 历史记录管理
- [ ] 批量导入模式
- [ ] 更多自定义模板

## 📄 许可证

MIT License

## 🙏 致谢

感谢 OpenClaw 团队提供强大的 AI 助理平台。

---

**最后更新：** 2026-03-17
**版本：** 1.0.0
