# 分类参考映射

此文件定义了常见的分类映射规则，帮助 AI 自动推荐合适的分类。

## 预定义分类

### 技术类

| 分类名称 | 目录路径 | 关键词 |
|---------|---------|--------|
| 后端开发 | `docs/backend/` | Node.js, Python, Java, Go, Rust, API, 服务端 |
| 前端开发 | `docs/frontend/` | React, Vue, Angular, CSS, HTML, JavaScript, TypeScript, Webpack |
| 数据库 | `docs/database/` | MySQL, PostgreSQL, MongoDB, Redis, SQL, NoSQL, 数据库设计 |
| DevOps | `docs/devops/` | Docker, Kubernetes, CI/CD, Jenkins, GitLab CI, GitHub Actions, 部署 |
| 架构设计 | `docs/architecture/` | 微服务, 系统架构, 设计模式, 分布式系统, 高可用 |
| 系统设计 | `docs/system-design/` | 系统设计, 架构图, 容量规划, 性能优化 |
| 算法与数据结构 | `docs/algorithms/` | 算法, 数据结构, LeetCode, 算法题, 复杂度分析 |
| 网络协议 | `docs/networking/` | HTTP, TCP, UDP, WebSocket, gRPC, DNS, CDN |
| 安全 | `docs/security/` | 认证, 授权, 加密, HTTPS, XSS, CSRF, SQL注入 |

### 学习与思考

| 分类名称 | 目录路径 | 关键词 |
|---------|---------|--------|
| 阅读笔记 | `docs/reading/` | 读书, 阅读, 书籍, 文章总结 |
| 学习笔记 | `docs/learning-notes/` | 学习, 教程, 课程, 笔记 |
| 技术思考 | `docs/thoughts/` | 思考, 感悟, 经验, 反思, 总结 |
| 问题记录 | `docs/troubleshooting/` | 问题, bug, 错误, 调试, 解决方案 |
| 项目经验 | `docs/projects/` | 项目, 实战, 案例, 经验总结 |

### 工具与效率

| 分类名称 | 目录路径 | 关键词 |
|---------|---------|--------|
| 开发工具 | `docs/tools/` | Git, Vim, VS Code, 工具, 插件, 配置 |
| 效率提升 | `docs/productivity/` | 效率, 工作流, 自动化, 脚本, 快捷键 |
| Linux | `docs/linux/` | Linux, Shell, Bash, 命令行, 系统管理 |

### 业务与产品

| 分类名称 | 目录路径 | 关键词 |
|---------|---------|--------|
| 产品设计 | `docs/product/` | 产品, 需求, 用户体验, UX, UI |
| 业务理解 | `docs/business/` | 业务, 需求分析, 领域建模 |

## 关键词匹配规则

AI 应该按照以下优先级进行分类推荐：

### 1. 精确匹配（优先级最高）

如果内容中明确提到分类名称或技术栈，直接匹配：

```
内容包含 "Redis" → docs/database/
内容包含 "React" → docs/frontend/
内容包含 "Docker" → docs/devops/
内容包含 "微服务" → docs/architecture/
```

### 2. 关键词权重匹配

基于关键词出现频率和权重计算：

**后端开发** (docs/backend/)
- 高权重：API 设计, RESTful, GraphQL, 服务端
- 中权重：Node.js, Express, NestJS, Django, Flask, Spring Boot
- 低权重：服务器, 接口, 后台

**前端开发** (docs/frontend/)
- 高权重：组件, 状态管理, 前端框架
- 中权重：React, Vue, Angular, Hooks, Redux, Vuex
- 低权重：页面, UI, 样式

**数据库** (docs/database/)
- 高权重：SQL, 查询, 索引, 事务, 持久化
- 中权重：MySQL, PostgreSQL, MongoDB, Redis
- 低权重：数据, 存储

**DevOps** (docs/devops/)
- 高权重：CI/CD, 部署, 容器, 编排
- 中权重：Docker, Kubernetes, Jenkins, GitLab CI
- 低权重：运维, 发布

**架构设计** (docs/architecture/)
- 高权重：架构图, 系统设计, 设计模式, 分布式
- 中权重：微服务, 单体, DDD, 领域驱动
- 低权重：架构, 设计

### 3. 上下文分析

结合对话历史和内容深度：

```
IF 讨论的技术栈包含 ["Redis", "缓存", "性能优化"] THEN
  推荐 docs/database/
END IF

IF 讨论的是 "如何设计一个 XX 系统" THEN
  推荐 docs/system-design/
END IF

IF 讨论的是 "遇到 XX 问题，如何解决" THEN
  推荐 docs/troubleshooting/
END IF
```

### 4. 多分类场景

如果内容同时涉及多个分类，按以下规则选择：

**规则 1：选择主题占比最大的分类**
```
内容：70% 讨论 Redis，30% 讨论 Docker
推荐：docs/database/ （主要是数据库相关）
```

**规则 2：技术栈优先于工具**
```
内容：使用 Docker 部署 Node.js 应用
推荐：docs/backend/ 或 docs/devops/
提示用户选择：这是后端开发还是 DevOps 的内容？
```

**规则 3：具体优先于抽象**
```
内容：Redis 持久化机制
推荐：docs/database/ 而不是 docs/backend/
```

## 分类推荐流程

```
1. 分析内容，提取关键词
   ↓
2. 计算每个分类的匹配分数
   ↓
3. 选择分数最高的分类
   ↓
4. 如果最高分 < 阈值（如 50%）
   → 询问用户或提供多个选项
   ↓
5. 如果分数相近（差距 < 10%）
   → 提示用户确认或选择
   ↓
6. 显示推荐分类，等待用户确认
```

## 用户交互示例

### 示例 1：高置信度推荐

```
检测到内容关键词：Redis, 持久化, RDB, AOF
推荐分类：数据库 (docs/database/)

是否正确？
1. ✅ 使用推荐分类
2. 📁 选择其他分类
3. ➕ 创建新目录
```

### 示例 2：低置信度推荐

```
检测到内容关键词：系统设计, API, 性能

可能的分类：
1. 架构设计 (docs/architecture/)
2. 系统设计 (docs/system-design/)
3. 后端开发 (docs/backend/)

请选择最合适的分类（输入序号）：
```

### 示例 3：无法推断

```
⚠️  无法自动推断分类

请选择或输入分类目录：

常用分类：
1. 后端开发 (docs/backend/)
2. 前端开发 (docs/frontend/)
3. 数据库 (docs/database/)
4. DevOps (docs/devops/)
5. 架构设计 (docs/architecture/)
6. 学习笔记 (docs/learning-notes/)

或输入自定义路径（如 docs/new-category/）：
```

## 多级目录支持

用户可以创建多级目录结构：

**一级分类：**
```
docs/backend/
docs/frontend/
docs/database/
```

**二级分类：**
```
docs/backend/nodejs/
docs/backend/python/
docs/backend/api-design/

docs/database/redis/
docs/database/mysql/
docs/database/design/
```

**三级分类：**
```
docs/backend/nodejs/express/
docs/backend/nodejs/nestjs/

docs/database/redis/persistence/
docs/database/redis/cluster/
```

**推荐规则：**
- 初次使用：推荐一级分类
- 同一主题出现 3 次以上：建议创建二级分类
- 深度讨论某个细分话题：建议创建三级分类

**示例：**
```
第 1 次保存 Redis 相关内容：
→ 推荐 docs/database/

第 3 次保存 Redis 相关内容：
→ 提示："你已经保存了 3 篇 Redis 相关文档，是否创建专门的目录 docs/database/redis/ ？"

讨论 Redis 持久化细节：
→ 推荐 docs/database/redis/persistence/
```

## 分类学习（可选功能）

记录用户的分类习惯，提高推荐准确度：

**学习数据：**
```json
{
  "user_preferences": {
    "keywords_to_category": {
      "Redis": "docs/database/redis/",
      "React": "docs/frontend/react/",
      "Docker": "docs/devops/docker/"
    },
    "category_frequency": {
      "docs/database/": 15,
      "docs/backend/": 12,
      "docs/frontend/": 8
    },
    "last_used_category": "docs/database/redis/",
    "custom_categories": [
      "docs/my-projects/",
      "docs/interview-prep/"
    ]
  }
}
```

**学习逻辑：**
1. 用户每次选择分类时，记录关键词 → 分类的映射
2. 累积足够数据后（如 5 次以上），优先使用用户的习惯
3. 新关键词出现时，回退到默认规则

**隐私说明：**
- 学习数据仅保存在本地
- 不上传到服务器
- 用户可以随时清除学习数据

## 特殊场景处理

### 场景 1：文章链接

如果内容是从外部文章抓取的：

```
1. 优先使用文章标签或分类（如果有）
2. 分析文章标题和摘要
3. 如果是技术博客，通常推荐 docs/reading/
4. 如果是教程或指南，推荐 docs/learning-notes/
```

### 场景 2：截图/图片

如果内容是从截图分析的：

```
1. 识别图片类型（架构图 → docs/architecture/）
2. 识别图片内容（代码截图 → 对应技术栈分类）
3. 识别图片来源（课程截图 → docs/learning-notes/）
```

### 场景 3：问题记录

如果内容是问题和解决方案：

```
1. 如果是特定技术栈的问题，推荐对应分类
   例如：Redis 问题 → docs/database/redis/
2. 如果是通用问题，推荐 docs/troubleshooting/
3. 如果是项目特定问题，推荐 docs/projects/
```

### 场景 4：混合内容

如果内容涉及多个技术栈：

```
内容：使用 React 和 Node.js 构建全栈应用

选项 1：创建专门的全栈分类
  → docs/fullstack/

选项 2：分拆成两篇文档
  → docs/frontend/ 和 docs/backend/

选项 3：选择主要关注点
  → 如果主要讨论前端，选 docs/frontend/
  → 如果主要讨论后端，选 docs/backend/

询问用户偏好。
```

## 总结

分类推荐的核心原则：
1. **精确优于模糊**：明确的关键词匹配优先
2. **具体优于抽象**：具体技术栈优先于通用分类
3. **用户习惯优先**：学习用户的分类偏好
4. **引导而非强制**：提供推荐，但允许用户修改
5. **灵活可扩展**：支持自定义分类和多级目录

当无法确定时，**主动询问用户**，不要使用默认分类。
