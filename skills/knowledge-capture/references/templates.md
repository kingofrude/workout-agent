# 文档模板参考

此文件定义了三种文档模板，AI 会根据内容长度和复杂度自动选择。

## 1. 精简版模板

**适用场景：**
- 内容少于 200 字
- 快速记录的想法或笔记
- 简单的对话总结
- 临时记录的信息

**模板结构：**

```markdown
---
date: {TIMESTAMP}
category: {CATEGORY}
tags: [{TAGS}]
---

# {TITLE}

{CONTENT}
```

**字段说明：**
- `{TIMESTAMP}`: 格式为 `YYYY-MM-DD HH:MM:SS`，如 `2026-03-17 14:30:00`
- `{CATEGORY}`: 分类名称，如 `数据库`、`前端开发`
- `{TAGS}`: 标签数组，如 `[Redis, 持久化, RDB]`
- `{TITLE}`: 文档标题
- `{CONTENT}`: 主要内容

**示例：**

```markdown
---
date: 2026-03-17 14:30:00
category: 数据库
tags: [Redis, 持久化]
---

# Redis 持久化机制

Redis 提供两种持久化方式：
- RDB 快照：全量备份，适合备份恢复
- AOF 日志：增量备份，数据安全性更高
- 混合持久化：结合两者优势

建议在生产环境使用混合持久化模式。
```

---

## 2. 标准版模板

**适用场景：**
- 200-1000 字的内容
- 常规的对话总结
- 简短的文章摘要
- 技术问题记录

**模板结构：**

```markdown
---
date: {TIMESTAMP}
category: {CATEGORY}
tags: [{TAGS}]
source: {SOURCE}
---

# {TITLE}

## 概述
{SUMMARY}

## 核心要点
{KEY_POINTS}

## 相关链接
{LINKS}
```

**字段说明：**
- `{SOURCE}`: 内容来源，如 `对话总结`、`https://example.com`、`截图分析`
- `{SUMMARY}`: 100-200 字的简要概述
- `{KEY_POINTS}`: 列表形式的核心要点，建议 3-7 条
- `{LINKS}`: 相关资源链接（可选）

**示例：**

```markdown
---
date: 2026-03-17 14:30:00
category: 数据库
tags: [Redis, 持久化, RDB, AOF]
source: 对话总结
---

# Redis 持久化机制详解

## 概述
讨论了 Redis 的两种持久化方式及其使用场景。RDB 适合备份恢复，AOF 提供更高的数据安全性，混合持久化模式结合了两者的优势。在生产环境中，需要根据业务需求选择合适的持久化策略。

## 核心要点
- **RDB 快照**：全量备份，文件体积小，恢复速度快，但可能丢失最后一次快照后的数据
- **AOF 日志**：增量备份，数据安全性高，但文件体积大，恢复速度慢
- **混合持久化**：Redis 4.0+ 支持，结合 RDB 和 AOF 的优势
- **配置建议**：生产环境开启 AOF，设置 `appendfsync everysec`
- **性能影响**：RDB 会 fork 子进程，AOF 会增加写入延迟

## 相关链接
- [Redis 官方文档 - Persistence](https://redis.io/docs/management/persistence/)
- [Redis RDB vs AOF 对比](https://example.com/redis-rdb-vs-aof)
```

---

## 3. 详细版模板

**适用场景：**
- 超过 1000 字的长文章
- 复杂的技术讨论
- 需要保留原文的内容
- 深度学习笔记

**模板结构：**

```markdown
---
date: {TIMESTAMP}
category: {CATEGORY}
tags: [{TAGS}]
source: {SOURCE_URL}
author: {AUTHOR}
---

# {TITLE}

## 摘要
{SUMMARY}

## 详细内容
{DETAILED_CONTENT}

## 原文内容
{ORIGINAL_CONTENT}

## 个人思考
{PERSONAL_NOTES}

## 参考资源
{REFERENCES}
```

**字段说明：**
- `{AUTHOR}`: 原作者（如果是文章链接）
- `{SUMMARY}`: 200-300 字的摘要
- `{DETAILED_CONTENT}`: 分小节的详细内容（使用 `###` 子标题）
- `{ORIGINAL_CONTENT}`: 保留关键的原文段落（可选）
- `{PERSONAL_NOTES}`: 用户的个人理解和思考（可选）
- `{REFERENCES}`: 参考资源列表

**示例：**

```markdown
---
date: 2026-03-17 14:30:00
category: 架构设计
tags: [微服务, 设计模式, 分布式系统]
source: https://example.com/microservices-best-practices
author: 张三
---

# 微服务架构设计最佳实践

## 摘要
本文深入探讨了微服务架构的设计原则和最佳实践。从服务拆分、通信模式、数据管理到部署运维，提供了一套完整的微服务设计方法论。特别关注了服务边界划分、API 网关、服务发现、配置管理等关键问题，并结合实际案例分析了常见的反模式和解决方案。

## 详细内容

### 1. 服务拆分原则

**按业务能力拆分**
- 每个服务对应一个独立的业务能力
- 遵循单一职责原则
- 避免服务间的紧耦合

**服务粒度选择**
- 不要过度拆分（纳米服务反模式）
- 不要过大（单体服务）
- 平衡团队规模和服务复杂度

### 2. 服务间通信

**同步通信**
- REST API：适合简单的请求-响应场景
- gRPC：适合高性能、低延迟需求
- GraphQL：适合复杂的查询需求

**异步通信**
- 消息队列：解耦服务依赖
- 事件驱动：实现最终一致性
- 发布-订阅模式：多对多通信

### 3. 数据管理策略

**数据库选择**
- 每个服务独立的数据库
- 避免共享数据库
- 根据业务需求选择数据库类型

**分布式事务**
- Saga 模式：长事务处理
- 补偿事务：错误恢复
- 两阶段提交：强一致性场景

### 4. API 网关设计

**核心功能**
- 路由转发
- 认证授权
- 限流熔断
- 协议转换

**反模式**
- 网关变成单体
- 包含业务逻辑
- 缺乏监控和日志

### 5. 服务发现与配置

**服务注册**
- Consul / Eureka
- 健康检查
- 自动注销

**配置管理**
- 集中式配置中心
- 动态配置更新
- 配置版本控制

## 原文内容

> "微服务架构的本质是将复杂系统拆分成多个可独立部署的服务，每个服务围绕特定的业务能力构建。这种架构风格允许团队独立开发、测试和部署服务，从而提高了系统的可维护性和可扩展性。"

> "服务拆分的关键在于找到正确的边界。过度拆分会导致系统复杂度增加，而拆分不足则失去了微服务的优势。一个好的经验法则是：如果一个团队（7-10人）能够完全负责一个服务的开发和运维，那么这个服务的粒度就是合适的。"

## 个人思考

**服务拆分的实践经验**
- 初期不要过度设计，从单体开始逐步演进
- 关注业务价值，技术架构服务于业务目标
- 团队能力和组织结构决定了架构选择

**常见的坑**
1. **过早优化**：一开始就采用微服务，增加了不必要的复杂度
2. **分布式事务**：低估了分布式环境下的一致性问题
3. **网络延迟**：服务间调用链路长，性能问题显著
4. **运维成本**：监控、日志、部署的复杂度呈指数增长

**建议**
- 先做好单体架构，理解业务边界
- 识别出核心瓶颈后，逐步拆分
- 投资基础设施：CI/CD、监控、日志
- 关注团队能力建设

## 参考资源
- [原文链接](https://example.com/microservices-best-practices)
- [Martin Fowler - Microservices](https://martinfowler.com/articles/microservices.html)
- [The Twelve-Factor App](https://12factor.net/)
- [Building Microservices (Book)](https://www.oreilly.com/library/view/building-microservices/9781491950340/)
- [Microservices Patterns (Book)](https://microservices.io/book)
```

---

## 模板选择逻辑

AI 应该根据以下规则自动选择模板：

```
IF 内容长度 < 200 字 THEN
  使用精简版模板
ELSE IF 内容长度 < 1000 字 THEN
  使用标准版模板
ELSE
  使用详细版模板
END IF

IF 内容来源 == "文章链接" AND 文章长度 > 2000 字 THEN
  强制使用详细版模板
END IF

IF 内容类型 == "对话总结" AND 讨论轮数 < 10 THEN
  使用精简版或标准版模板
END IF
```

用户也可以在预览阶段手动切换模板类型。

---

## 扩展模板（可选）

如果用户需要，可以创建自定义模板：

**读书笔记模板**
```markdown
---
date: {TIMESTAMP}
category: 阅读笔记
tags: [{BOOK_TAGS}]
book: {BOOK_TITLE}
author: {BOOK_AUTHOR}
progress: {READING_PROGRESS}
---

# {CHAPTER_TITLE}

## 章节概要
{CHAPTER_SUMMARY}

## 重点摘录
{KEY_QUOTES}

## 读后感
{PERSONAL_THOUGHTS}

## 行动计划
{ACTION_ITEMS}
```

**会议记录模板**
```markdown
---
date: {TIMESTAMP}
category: 会议记录
tags: [{MEETING_TAGS}]
participants: [{PARTICIPANTS}]
duration: {DURATION}
---

# {MEETING_TITLE}

## 会议议程
{AGENDA}

## 讨论内容
{DISCUSSION}

## 决策事项
{DECISIONS}

## 行动项
{ACTION_ITEMS}

## 后续跟进
{FOLLOW_UP}
```

用户可以将自定义模板放在 `references/custom-templates.md` 中。
