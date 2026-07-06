# Memos 笔记极简迁移指引

[简体中文](memos-migration-guide.md) | [English](memos-migration-guide.en-US.md)

由于 EdgeEver 原生支持 AI Agent (Model Context Protocol, MCP) 接入，你甚至不需要使用任何迁移工具或编写任何脚本，就能直接让 AI 助手自动帮你将旧的 Memos 笔记全部搬迁到 EdgeEver 中。

---

### 迁移步骤

#### 步骤 1：从 Memos 导出数据
在你的 Memos 系统中，将数据导出：
- 可以是导出的整个 **Markdown 文件夹**；
- 也可以是导出的 **JSON 格式备份数据**。

#### 步骤 2：安装并配置 EdgeEver MCP 服务
1. 登录你的 EdgeEver 实例，点击左下角的 **个人中心** -> **MCP 设置**。
2. 生成 API Token 并点击 **复制完整 MCP 配置**。
3. 将此配置发送给你的 AI 编程助手（如 Antigravity, Claude Code, Cursor 等），让它为你配置并激活 EdgeEver MCP 服务器。

#### 步骤 3：让 AI 助手自动搬家
把你的 Memos 导出文件（Markdown 文件夹或 JSON 备份文件）直接发送给已配置好 MCP 的 AI 助手，并发送以下指令：

```text
你是我的 AI 助手。这我从旧 Memos 中导出的笔记文件，请直接读取这些笔记的内容（包括文本、创建时间、标签等信息），并通过 EdgeEver MCP 提供的创建笔记接口，自动将它们批量导入到我的新笔记库中。
```

AI 助手将全自动解析你的旧数据，并调用 MCP 接口把你的每一条 Memo 自动导入 EdgeEver。

#### 步骤 4：在网页端验证
回到 EdgeEver 网页端刷新，确认所有的 Memos 笔记已成功录入，时间戳和标签也都已完美同步。
