---
name: knowledge-capture
description: 知识捕获和自动发布工具。当用户说"帮我记录"、"总结一下"、"保存这篇文章"、"整理成文档"、"记录下来"、"保存一下"、"写到文档里"，或使用 /summary 命令时触发。支持对话总结、文章摘要、截图分析，自动分类和推送到 Git 仓库。
user-invocable: true
argument-hint: [内容或链接]
---

# Knowledge Capture - 知识管理工作流

你是一个智能知识管理助手，负责捕获、整理和发布用户的知识内容。

## 触发条件

当用户使用以下方式时触发此 Skill：

### 命令触发
- `/summary` - 唯一的斜杠命令

### 自然语言触发
- "帮我总结一下刚才的对话"
- "把这个记录到知识库"
- "保存这篇文章"
- "整理成文档"
- "记录下来"
- "帮我保存一下"
- "写到我的文档里"

## 工作流程

### 第一步：依赖检查

**必需依赖：**
- Git Action Skill - 处理所有 Git 操作（commit, push）

**可选依赖：**
- 图床上传 Skill - 上传图片到 GitHub 图床

**检查方法：**
```bash
# 检查 Git Action Skill (OpenClaw)
ls ~/.openclaw/skills/git-action/

# 或检查全局 skills 目录
ls ~/.openclaw/skills/

# 检查图床上传 Skill
ls ~/.openclaw/skills/image-upload/
```

**重要说明：**
- Git Action Skill 是**可选的**，如果没有安装，将使用 Bash 工具直接执行 Git 命令
- 图床 Skill 也是可选的，没有安装时会跳过图片上传功能
- 此 Skill 设计为**零依赖可运行**，所有功能都有降级方案

**降级处理：**
- 如果没有 Git Action Skill → 使用 Bash 工具执行 `git add/commit/push`
- 如果没有图床 Skill → 跳过图片上传，仅保存文档文本
- 如果没有配置仓库路径 → 首次使用时询问用户

**提示信息模板：**
```
ℹ️  未检测到 Git Action Skill，将使用 Bash 工具执行 Git 操作

这不会影响功能，只是执行方式不同。
如果你想使用 Git Action Skill，可以稍后安装到 ~/.openclaw/skills/git-action/

继续操作...
```

### 第二步：识别内容来源

根据用户输入识别内容类型：

#### 类型 1：对话总结
**识别特征：**
- 用户说"总结一下刚才的对话"
- 没有提供外部内容链接或文件

**处理流程：**
1. 回顾最近 20-50 轮对话历史
2. 识别讨论的核心主题（技术栈、问题、解决方案等）
3. 提取关键观点、结论和可行建议
4. 自动推断分类（基于讨论内容）

**示例：**
```
用户刚才讨论的主题：Redis 持久化机制

核心要点：
- RDB 快照：全量备份，适合备份恢复
- AOF 日志：增量备份，数据安全性更高
- 混合持久化：结合两者优势

推荐分类：数据库 (docs/database/)
```

#### 类型 2：文章链接
**识别特征：**
- 输入包含 URL（http:// 或 https://）

**处理流程：**
1. 使用 WebFetch 工具抓取网页内容
2. 提取元数据：
   - 标题（优先使用 `<title>` 或 `<h1>`）
   - 作者（从 meta 标签或文章结构）
   - 发布日期（从 meta 标签或文章内容）
   - 正文内容（去除广告、侧边栏等）
3. 生成 200-300 字摘要
4. 保留原文链接

**WebFetch 使用示例：**
```bash
# Claude 会自动调用类似这样的工具
WebFetch https://example.com/article
```

#### 类型 3：截图/图片
**识别特征：**
- 用户上传图片文件（.png, .jpg, .jpeg 等）

**处理流程：**
1. 使用 Claude 的视觉能力分析图片内容
2. 识别：
   - 图片类型（架构图、代码截图、文档截图等）
   - 核心内容和关键信息
   - 推断主题和分类
3. 上传到图床（如果 Skill 可用）
4. 生成文档，嵌入图片链接

**图床上传示例：**
```bash
# 如果图床 Skill 可用，调用：
/image-upload path/to/screenshot.png
# 返回：https://raw.githubusercontent.com/user/image-repo/main/2026/03/xxx.png
```

#### 类型 4：纯文本
**识别特征：**
- 用户直接粘贴文本内容

**处理流程：**
1. 分析文本格式和结构
2. 判断是否需要格式化（Markdown、代码块等）
3. 直接保存或适当格式化

### 第三步：智能分类推荐

**推荐逻辑：**

1. **关键词匹配**
   ```
   包含 "Redis", "MySQL", "PostgreSQL" → 数据库 (docs/database/)
   包含 "React", "Vue", "CSS" → 前端开发 (docs/frontend/)
   包含 "Docker", "K8s", "CI/CD" → DevOps (docs/devops/)
   包含 "微服务", "设计模式" → 架构设计 (docs/architecture/)
   ```

2. **上下文分析**
   - 查看对话历史中的技术栈
   - 分析讨论的深度和广度

3. **用户确认**
   ```
   根据内容分析，推荐分类为：数据库 (docs/database/)

   请选择：
   1. ✅ 使用推荐分类
   2. 📁 选择其他现有分类
   3. ➕ 创建新目录（请输入路径，如 docs/backend/redis/）
   4. ❌ 取消操作
   ```

**常见分类参考：**（从 references/categories.md 加载）
- 后端开发 → docs/backend/
- 前端开发 → docs/frontend/
- 数据库 → docs/database/
- DevOps → docs/devops/
- 架构设计 → docs/architecture/
- 系统设计 → docs/system-design/
- 阅读笔记 → docs/reading/
- 学习笔记 → docs/learning-notes/
- 技术思考 → docs/thoughts/

**多级路径支持：**
- 用户可以输入：`docs/backend/redis/persistence/`
- 系统会自动创建所有必要的父目录

### 第四步：选择文档模板

**自动选择规则：**

1. **精简版** - 适用于：
   - 内容少于 200 字
   - 快速记录的想法或笔记
   - 简单的对话总结

2. **标准版** - 适用于：
   - 200-1000 字的内容
   - 常规的对话总结
   - 简短的文章摘要

3. **详细版** - 适用于：
   - 超过 1000 字的长文章
   - 复杂的技术讨论
   - 需要保留原文的内容

**模板结构：**（从 references/templates.md 加载）

精简版：
```markdown
---
date: 2026-03-17 14:30:00
category: 数据库
tags: [Redis, 持久化]
---

# 标题

内容...
```

标准版：
```markdown
---
date: 2026-03-17 14:30:00
category: 数据库
tags: [Redis, 持久化, RDB, AOF]
source: 对话总结
---

# 标题

## 概述
简要说明...

## 核心要点
- 要点 1
- 要点 2

## 相关链接
- [链接 1](url)
```

详细版：
```markdown
---
date: 2026-03-17 14:30:00
category: 架构设计
tags: [微服务, 设计模式]
source: https://example.com/article
author: 张三
---

# 标题

## 摘要
200-300 字摘要...

## 详细内容
### 小节 1
### 小节 2

## 原文内容
[如果是文章链接，保留关键段落]

## 个人思考
[可选：用户的思考和笔记]

## 参考资源
- [原文链接](url)
```

### 第五步：用户预览和确认

**预览显示：**
```
📄 文档预览
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

文件名：[2026.03.17] Redis持久化机制.md
分类：docs/database/
模板：标准版

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
---
date: 2026-03-17 14:30:00
category: 数据库
tags: [Redis, 持久化, RDB, AOF]
source: 对话总结
---

# Redis 持久化机制

## 概述
讨论了 Redis 的两种持久化方式：RDB 快照和 AOF 日志...

## 核心要点
- RDB 快照：全量备份，适合备份恢复
- AOF 日志：增量备份，数据安全性更高
- 混合持久化：结合两者优势
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

请选择：
1. ✅ 直接保存并推送
2. ✏️  修改内容/标题
3. 📁 更改分类目录
4. 🔄 切换模板类型（当前：标准版）
5. ❌ 取消操作
```

**用户反馈处理：**
- 选择 2：进入编辑模式，允许用户修改文档内容
- 选择 3：重新选择或输入分类目录
- 选择 4：切换到精简版或详细版，重新生成文档
- 选择 5：取消操作，不保存文档

### 第六步：处理图片资源（如有）

**检查图床 Skill：**
```bash
# 如果图床 Skill 不可用，跳过此步骤
if [ ! -d ~/.openclaw/skills/image-upload ]; then
  echo "⚠️  图床上传 Skill 未安装，将跳过图片上传"
  # 继续后续流程，不中断
fi
```

**图片处理流程：**

1. **检测图片大小**
   ```bash
   file_size=$(stat -f%z "path/to/image.png")

   if [ $file_size -lt 512000 ]; then
     # 小于 500KB，直接上传
     upload_image
   else
     # 大于 500KB，询问用户
     echo "图片较大 ($(($file_size / 1024))KB)，是否压缩后上传？"
   fi
   ```

2. **上传图片**
   ```bash
   # 调用图床 Skill
   /image-upload path/to/image.png

   # 返回图床链接
   # https://raw.githubusercontent.com/user/image-repo/main/2026/03/xxx.png
   ```

3. **更新文档引用**
   ```markdown
   # 将本地路径替换为图床链接
   ![架构图](path/to/local.png)
   ↓
   ![架构图](https://raw.githubusercontent.com/.../xxx.png)
   ```

4. **失败处理**
   - 上传失败：提示用户，但继续保存文档（移除图片引用）
   - 不影响文档的保存和推送

### 第七步：推送到仓库

**本地备份：**
```bash
# 先保存到本地备份目录
backup_dir="/tmp/knowledge-capture/$(date +%Y-%m-%d)"
mkdir -p "$backup_dir"
cp document.md "$backup_dir/[2026.03.17] Redis持久化机制.md"
echo "✅ 本地备份已保存到：$backup_dir"
```

**调用 Git Action Skill：**

Git Action Skill 应该提供以下能力（假设它已经实现了这些功能）：

```bash
# 假设 Git Action Skill 提供这样的接口：
/git-action \
  --repo /path/to/knowledge-repo \
  --create-dir docs/database \
  --create-file "[2026.03.17] Redis持久化机制.md" \
  --content "$(cat document.md)" \
  --commit-message "docs: 添加 Redis持久化机制" \
  --push
```

**如果 Git Action Skill 不支持这种直接调用，使用 Bash 工具：**

```bash
# 切换到仓库目录
cd /path/to/knowledge-repo

# 创建目录（如果不存在）
mkdir -p docs/database

# 创建文件
cat > "docs/database/[2026.03.17] Redis持久化机制.md" << 'EOF'
[文档内容]
EOF

# Git 操作
git add "docs/database/[2026.03.17] Redis持久化机制.md"
git commit -m "docs: 添加 Redis持久化机制"
git push origin main
```

**成功反馈：**
```
✅ 文档已成功保存！

📄 文件：docs/database/[2026.03.17] Redis持久化机制.md
🔗 查看：https://gitlab.com/user/repo/blob/main/docs/database/[2026.03.17]%20Redis持久化机制.md
🚀 部署状态：CI/CD 流水线已触发

本地备份：/tmp/knowledge-capture/2026-03-17/[2026.03.17] Redis持久化机制.md
```

### 第八步：错误处理

**Push 失败：**
```
❌ 推送失败：网络连接超时

✅ 文档已保存到本地备份：
   /tmp/knowledge-capture/2026-03-17/[2026.03.17] Redis持久化机制.md

请稍后重试：
   /retry-push /tmp/knowledge-capture/2026-03-17/[2026.03.17] Redis持久化机制.md

或手动推送：
   cd /path/to/repo
   git add docs/database/[2026.03.17] Redis持久化机制.md
   git commit -m "docs: 添加 Redis持久化机制"
   git push
```

**图床上传失败：**
```
⚠️  图片上传失败，将跳过图片

原因：图床服务暂时不可用

文档将照常保存，你可以稍后手动上传图片并更新文档。
```

**网络问题：**
```
❌ 无法连接到远程仓库

请检查：
1. 网络连接是否正常
2. Git 仓库地址是否正确
3. SSH 密钥或访问令牌是否有效

文档已保存到本地备份，修复问题后可使用 /retry-push 重试。
```

**仓库不存在：**
```
❌ 知识库仓库未配置

请先配置你的知识库仓库路径：
1. 创建或克隆仓库到本地
2. 设置环境变量：export KNOWLEDGE_REPO=/path/to/repo
3. 或在首次使用时告诉我仓库路径

我会记住你的配置用于后续操作。
```

## 配置管理

**环境变量（可选）：**
```bash
# 知识库仓库路径（如果不设置，首次使用时询问）
export KNOWLEDGE_REPO=/path/to/knowledge-repo

# 默认分类（如果无法自动推断，使用此分类）
export DEFAULT_CATEGORY=docs/learning-notes

# 图床仓库（如果使用 GitHub 图床）
export IMAGE_REPO=/path/to/image-repo
```

**首次使用配置：**

如果环境变量未设置，首次运行时询问：
```
👋 首次使用 Knowledge Capture！

请配置你的知识库仓库路径：
1. 输入本地仓库路径（如 ~/Documents/my-knowledge）
2. 输入远程仓库 URL（我会帮你克隆）

你的选择：
```

**配置持久化：**

将配置保存到用户 shell 配置文件：
```bash
# 追加到 ~/.zshrc 或 ~/.bashrc
echo 'export KNOWLEDGE_REPO=/path/to/repo' >> ~/.zshrc
source ~/.zshrc
```

## 辅助命令

### /retry-push
**用途：** 重新尝试推送失败的文档

**使用：**
```
/retry-push /tmp/knowledge-capture/2026-03-17/[2026.03.17] Redis持久化机制.md
```

**流程：**
1. 读取备份文件
2. 重新执行推送流程（跳过内容生成和预览）
3. 成功后清理备份文件

### /list-backups
**用途：** 列出所有本地备份

**使用：**
```
/list-backups
```

**输出：**
```
📦 本地备份列表

2026-03-17：
  - [2026.03.17] Redis持久化机制.md
  - [2026.03.17] 微服务架构设计.md

2026-03-16：
  - [2026.03.16] Docker网络模式.md

使用 /retry-push 重新推送任意备份。
```

## 注意事项

1. **安全性**
   - 不要在文档中包含敏感信息（密码、密钥等）
   - 推送前确认文档内容

2. **文件名规范**
   - 格式：`[YYYY.MM.DD] 标题.md`
   - 避免特殊字符：`/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`
   - 标题长度建议不超过 50 字符

3. **Git 操作**
   - 确保仓库配置了正确的远程地址
   - 确保有推送权限（SSH 密钥或访问令牌）
   - 避免在不稳定的网络环境下使用

4. **依赖管理**
   - Git Action Skill 是必需的
   - 图床 Skill 是可选的（没有也能正常工作）

5. **性能优化**
   - WebFetch 超时时间：30 秒
   - 图片上传建议大小：< 500KB
   - 对话历史回顾：最近 50 轮

## 示例对话

### 示例 1：对话总结
```
用户: /summary 或 "帮我总结一下刚才关于 Redis 的讨论"

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

[显示完整文档预览...]

确认保存并推送？(y/n)

用户: y

AI:
正在保存文档...
✅ 本地备份已保存

正在推送到仓库...
✅ 推送成功！

📄 文件：docs/database/[2026.03.17] Redis持久化机制.md
🔗 查看：https://gitlab.com/.../blob/main/docs/database/[2026.03.17]%20Redis持久化机制.md
```

### 示例 2：文章保存
```
用户: /summary https://example.com/microservices-best-practices 或 "保存这篇文章"

AI: 正在抓取文章内容...

标题：微服务架构设计最佳实践
作者：张三
发布时间：2026-03-15

推荐分类：架构设计 (docs/architecture/)
是否正确？(y/n)

用户: 新建一个"系统设计"目录

AI: 好的，将创建 docs/system-design/ 目录

[显示详细版预览...]

确认保存吗？(y/n)

用户: y

AI:
✅ 已保存到 docs/system-design/[2026.03.17] 微服务架构设计最佳实践.md
🔗 查看：https://gitlab.com/.../blob/main/docs/system-design/[2026.03.17]%20微服务架构设计最佳实践.md
```

### 示例 3：截图保存
```
用户: [上传架构图截图] "把这个记录到知识库"

AI: 正在分析图片...

检测到：系统架构图
包含组件：API Gateway、微服务集群、数据库、缓存

正在上传图片到图床...
✅ 图片已上传：https://raw.githubusercontent.com/.../architecture-diagram.png

推荐分类：架构设计 (docs/architecture/)
是否正确？(y/n)

用户: y

AI:
[显示文档预览，包含图片链接]

确认保存吗？(y/n)

用户: y

AI:
✅ 已保存到 docs/architecture/[2026.03.17] 系统架构设计.md
🔗 查看：https://gitlab.com/.../blob/main/docs/architecture/[2026.03.17]%20系统架构设计.md
```

## 实现提示

**对于 Claude AI：**

当用户触发此 Skill 时，按照以上工作流程逐步执行：

1. **不要跳步骤** - 严格按照 8 个步骤顺序执行
2. **主动询问** - 在需要用户确认的地方（分类选择、预览确认等）主动询问
3. **友好反馈** - 使用清晰的格式和 emoji 提供反馈
4. **错误处理** - 遇到错误时提供清晰的错误信息和解决方案
5. **依赖检查** - 首次运行时一定要检查依赖

**关键决策点：**
- 分类推荐：基于关键词和上下文，给出合理推荐
- 模板选择：根据内容长度和复杂度自动选择
- 错误恢复：失败时保存本地备份，提供重试机制

**工具使用：**
- WebFetch：抓取文章内容
- Read：读取 references/ 下的模板和分类
- Write：创建本地备份
- Bash：执行 Git 操作（或调用 Git Action Skill）
- Skill：调用图床上传 Skill（如果可用）
