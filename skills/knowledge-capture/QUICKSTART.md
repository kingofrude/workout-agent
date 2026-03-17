# Knowledge Capture - 快速开始

5 分钟上手知识管理工作流。

## 第一步：确认文件结构

```bash
cd /Users/gui/Desktop/code/my-skills/skills/knowledge-capture

# 应该看到以下文件：
# .gitignore
# README.md
# SKILL.md
# QUICKSTART.md
# references/
#   ├── categories.md
#   └── templates.md
```

## 第二步：检查依赖

### 必需：Git Action Skill

检查是否安装：
```bash
ls ~/.openclaw/skills/git-action/SKILL.md
```

如果没有安装：
- 安装 Git Action Skill，或
- 使用 Bash 工具手动执行 Git 命令（Skill 已支持）

### 可选：图床上传 Skill

检查是否安装：
```bash
ls ~/.openclaw/skills/image-upload/SKILL.md
```

没有也没关系，只是无法自动上传图片。

## 第三步：配置知识库仓库

### 方式 1：设置环境变量（推荐）

```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
export KNOWLEDGE_REPO=/path/to/your/knowledge-repo

# 重新加载配置
source ~/.zshrc
```

### 方式 2：首次使用时告诉 AI

首次运行 `/summary` 时，AI 会询问你的仓库路径。

## 第四步：测试使用

### 测试 1：对话总结

```
# 1. 与 AI 讨论一个技术话题
你：什么是 Redis 持久化？
AI：[解释...]

你：RDB 和 AOF 有什么区别？
AI：[解释...]

# 2. 触发总结
你：/summary

# 3. 跟随 AI 的提示确认分类和内容
# 4. 确认推送
# 5. 检查文档是否成功保存到仓库
```

### 测试 2：保存文章

```
你：/summary https://example.com/some-article

# AI 会自动抓取内容，生成摘要，推送到仓库
```

### 测试 3：快速记录

```
你：记录一下：今天学到了 Docker 网络的 bridge 模式

# AI 会使用精简版模板快速保存
```

## 第五步：查看结果

### 本地备份

所有文档都会先保存到本地备份：
```bash
ls /tmp/knowledge-capture/$(date +%Y-%m-%d)/
```

### 远程仓库

检查你的知识库仓库：
```bash
cd $KNOWLEDGE_REPO
git log --oneline -5
git status
```

### 在线查看

如果仓库有在线地址（GitHub/GitLab），访问查看文档。

## 常见问题

### Q: 如何修改已保存的文档？

A: 直接编辑仓库中的文件，然后提交推送：
```bash
cd $KNOWLEDGE_REPO
vim docs/database/[2026.03.17] Redis持久化机制.md
git add .
git commit -m "docs: 更新 Redis 持久化机制"
git push
```

或者让 AI 帮你修改：
```
你：帮我修改昨天保存的 Redis 文档，添加 [新内容]
```

### Q: 推送失败怎么办？

A: 使用 `/retry-push` 命令：
```
/retry-push /tmp/knowledge-capture/2026-03-17/[2026.03.17] Redis持久化机制.md
```

或手动推送：
```bash
cd $KNOWLEDGE_REPO
git add docs/database/[2026.03.17] Redis持久化机制.md
git commit -m "docs: 添加 Redis持久化机制"
git push
```

### Q: 如何自定义分类？

A: 在保存时选择"创建新目录"，然后输入路径：
```
你的选择：3 (创建新目录)
AI：请输入目录路径：
你：docs/my-custom-category/
```

或直接修改 `references/categories.md` 添加预定义分类。

### Q: 如何切换模板？

A: 在预览阶段选择"切换模板类型"：
```
请选择：
1. ✅ 直接保存并推送
2. ✏️  修改内容/标题
3. 📁 更改分类目录
4. 🔄 切换模板类型（当前：标准版）  ← 选这个
5. ❌ 取消操作
```

### Q: 支持哪些触发方式？

A: 命令触发：
```
/summary
/summary [链接或内容]
```

自然语言触发：
```
"帮我总结一下"
"保存这篇文章"
"记录到知识库"
"整理成文档"
"记录下来"
```

## 进阶配置

### 自定义模板

创建 `references/custom-templates.md`：
```markdown
# 自定义模板

## 读书笔记模板
[定义你的模板结构...]

## 会议记录模板
[定义你的模板结构...]
```

### 批量导入

如果有多个文件需要导入：
```
你：我有 10 篇文章需要导入

AI：好的，请逐一提供链接或内容

你：第一篇：https://...
[处理]

你：第二篇：https://...
[处理]

...
```

### 多仓库管理

如果你有多个知识库（个人、工作、团队）：
```bash
# 方式 1：切换环境变量
export KNOWLEDGE_REPO=/path/to/personal-repo
# 或
export KNOWLEDGE_REPO=/path/to/work-repo

# 方式 2：每次明确指定
你：保存到 /path/to/work-repo 的 docs/projects/
```

## 最佳实践

1. **及时记录**：对话结束后立即总结，记忆更清晰
2. **合理分类**：使用一致的分类体系，方便后续查找
3. **添加标签**：让 AI 自动提取关键词作为标签
4. **定期整理**：每周回顾备份目录，处理失败的推送
5. **备份重要内容**：本地备份定期归档到其他位置

## 工作流示例

### 日常学习场景

```
早上：
- 阅读技术文章 → /summary [链接]
- 看视频教程 → 记录关键点 → /summary

中午：
- 与同事讨论技术问题 → 记录要点 → /summary

下午：
- 解决 bug → 记录解决方案 → /summary
- 写代码遇到新知识点 → /summary

晚上：
- 回顾今天的学习 → /list-backups 检查是否都推送成功
```

### 技术研究场景

```
第一天：
- 研究 Redis → 多次对话 → /summary
- 保存位置：docs/database/redis/

第二天：
- 深入研究 Redis 持久化 → /summary
- 保存位置：docs/database/redis/persistence/

第三天：
- 研究 Redis 集群 → /summary
- 保存位置：docs/database/redis/cluster/

最后：
- 整理所有笔记，形成完整的 Redis 学习路径
```

## 下一步

1. **阅读详细文档**：查看 [README.md](README.md)
2. **理解分类体系**：查看 [references/categories.md](references/categories.md)
3. **了解模板结构**：查看 [references/templates.md](references/templates.md)
4. **实际使用**：开始记录你的第一篇知识笔记！

---

**祝你使用愉快！如果有问题，随时询问 AI。**
