---
name: research-paper-site-builder
description: 根据期刊列表和研究领域关键词，创建可持续更新的个性化论文追踪网站，完成来源核查、领域筛选、证据导读、GitHub协作、Actions自动采集及Cloudflare Pages部署。适用于从零建站或迁移EQHOT式论文观察站；不用于单次文献检索、实验室主页或论文全文镜像。
---

# 个性化论文观察站构建

把用户给出的期刊和研究兴趣变成可运行、可核查、可维护的网站，而非只输出设计稿。采用 EQHOT 已实施的分层方法，但重新生成用户自己的配置、数据、账号绑定和品牌。本 Skill 可独立使用，不需要访问 EQHOT 私有仓库。

## 输入与合理默认值

用户只需先提供两项：

1. 期刊名称列表，可附官网、ISSN 或 RSS。
2. 研究领域关键词，可用自然语言，支持中文和英文。

先据此制作配置、核查入口、实现本地版本；不要为了索取 GitHub/Cloudflare 账号而停在需求访谈。默认中文界面、保留英文原题、公开只读站、私有源码与审核记录、每日一次采集、普通收录人工确认、精选人工签发。站名使用领域简称加 Paper Watch 的暂定名称。关键词扩展、歧义词和来源访问结果向用户展示，不能将机器扩展误称为用户已确认。

“私人定制”默认是兴趣定制，**不等于访问私有**。用户明确要求仅本人可访问时，先确定访问控制方式，不能把私有 GitHub 仓库当作私有网站。公开站不默认增加 OAuth、账户、数据库或邮件服务。

需要发布时，再获取目标仓库、Pages 项目、公开/私有访问要求及现有权限。尊重所在环境的批准边界；本 Skill 不授权创建仓库、推送、启用 CI、配置凭据或上线。先准备可审阅差异和构建包，再处理实际需要的授权。

## 路径与工作方式

- 新项目：先识别工作区约定，在项目根写简短 AGENTS.md，约定源代码、`data/`、公开构建目录和 `work/`。只创建任务必需目录。
- 已有项目：读取 AGENTS.md、package.json、Git 状态与远端最新提交；保留无关改动。不要将本地旧数据覆盖云端主版本。
- 无 EQHOT 源码权限：依下列数据契约独立实现。不要要求别人先获得私有仓库权限。
- 有授权源码：先按 [迁移核对表](references/eqhot-provenance.md) 查找硬编码，不能只换站名和期刊 JSON。
- 先完成一个真实来源的小闭环，再扩展其余期刊。示例数据可以做布局测试，必须明确标识并在生产包排除。

## 按阶段执行并交付

### 1. 将期刊和兴趣变成配置

读取 [端到端施工步骤](references/build-playbook.md) 的阶段 1–2，以及 [数据与科学证据](references/data-and-editorial.md)。从 [配置示例](assets/site-config.example.json) 生成 `site.config.json`，由期刊官网/ISSN 登记核查完善来源。示例的来源处于 pending，不能直接声称接通。

```text
node <skill-folder>/scripts/validate-config.mjs <project>/site.config.json
node <skill-folder>/scripts/validate-config.mjs <project>/site.config.json --ready
```

前者允许草稿来源并给提示，后者要求启用的来源已验证且具备可执行入口。脚本仅校验配置结构，不会联网证明期刊身份或可达性；实际请求与抽样核验另做。将校验器复制到目标项目时同步其测试，避免目标项目依赖本机 Skill 的绝对路径。

### 2. 接通采集、归一化和审核

实现官方 RSS/Atom、官网目录/接口、Crossref ISSN 元数据适配；保留 DOI、来源、时间和证据依据。来源故障、零新增、待审、技术错误分别记录。先手动审核实现可靠闭环，模型审核按用户需要添加；没有云端模型凭据时，保留人工审核，不阻塞整个建站。

领域词、排除词、主题和期刊全收策略放在配置，采集初筛、模型提示词、自动收录门槛和前端使用同一版本。按 [数据与科学证据](references/data-and-editorial.md) 实现人工优先、证据等级、日期依据与发布门槛。

### 3. 生成可用的网站与独立公开包

按 [施工步骤](references/build-playbook.md) 实现论文目录、关键词搜索、期刊/主题/日期筛选、详情、来源状态、周报、RSS、引用导出与本地阅读标记。按当前请求缩减或分期；不要把可选增强变成发布前置条件。公开包使用字段白名单，不复制整个仓库。客户端内容插入用 textContent 或经过验证的转义，论文元数据不能成为脚本。

### 4. 与 GitHub、Pages 协作

读取 [GitHub 与 Pages 操作手册](references/github-and-pages.md)。主路线是 **GitHub 私有仓库 + GitHub Actions + Cloudflare Pages Direct Upload**。这里的 Pages 指 Cloudflare Pages；用户明确选 GitHub Pages 时走该文替代路线。

先手动采集和构建 → 私有仓库存储代码与审核结果 → 首次手动生产部署并验收 → 云端手动采集和跨运行持久化 → 验证后启用定时采集 → 按用户选择启用模型审核、自动发布。不要一次把尚未验证的全链路打开。

### 5. 验收和运行

执行 [验收与运维](references/verification-and-operations.md)：验证真实论文、反例、重复运行、失败保留旧版、并发冲突和线上版本摘要。记录已完成、本地验证、云端验证和仍需用户账号操作的部分；不能将构建成功等同于上线成功，也不能把手动触发当作自然定时触发已验证。

交付实际项目文件、配置与已核查来源表、本地运行命令、GitHub/Pages 入口（已创建时）、版本与验收结果，以及最少必要的后续操作。账号步骤受阻时，其余本地建站工作继续完成。

## 分享与调用

将整个 `research-paper-site-builder/` 文件夹交给对方，放入其 `$CODEX_HOME/skills/`；未设置 CODEX_HOME 时用 `~/.codex/skills/`。不要只复制 SKILL.md。示例：

> 使用 $research-paper-site-builder，为我创建论文追踪网站。期刊：Nature Communications、Science Advances；关键词：固态电池、锂金属界面、离子传输。先生成并验证本地网站，再准备 GitHub 私有仓库与 Cloudflare Pages 部署步骤。

这些示例名称只表示用户输入，不表示对应来源已接通。流程来源与核查时间见 [EQHOT 经验和官方依据](references/eqhot-provenance.md)。
