<p align="center">
  <img src="docs/assets/banner.svg" alt="从期刊列表和研究关键词出发，经来源核查与证据审核，构建自己的论文网站" width="100%">
</p>

<h1 align="center">Research Paper Site Builder</h1>

<p align="center">
  <strong>把你关心的期刊与研究方向，变成自己的论文观察站。</strong><br>
  一套源自 EQHOT 实践的 Codex Skill，带你完成从本地建站到 GitHub 与 Pages 持续更新的全过程。
</p>

<p align="center">
  <a href="#开始使用">开始使用</a> ·
  <a href="#你会得到什么">功能与产出</a> ·
  <a href="#它是怎么工作的">工作流程</a> ·
  <a href="#改成你的研究领域">定制研究领域</a> ·
  <a href="#文档">完整文档</a> ·
  <a href="https://github.com/JKbear/research-paper-site-builder/releases/tag/v1.0.0">下载 v1.0.0</a>
</p>

## 这是什么

研究方向越来越细，值得跟踪的论文却分散在许多期刊。反复打开目录、筛选关键词、核对 DOI、整理导读与周报，需要持续投入时间。

这个项目把 [EQHOT 地震学论文观察站](https://eqhot.pages.dev/) 的建设流程整理成可复用的 Skill。你先提供**期刊列表**与**研究领域关键词**，Codex 便可以在独立项目里核查来源、实现采集与审核、生成网站，并逐步连接 GitHub、Actions 和 Cloudflare Pages。

**本仓库交付的是 Skill、配置校验工具和施工手册。** 网站代码、期刊适配器与采集程序由代理依据你的输入在目标项目中实现；实际功能与上线状态逐项验收。完整流程可独立使用，无需访问 EQHOT 私有仓库。

EQHOT 参考 [AIHOT 开源项目](https://github.com/KKKKhazix/AIHOT) 构建，借鉴其信息聚合与自动化处理思路，并面向学术论文追踪进行了领域化设计。本 README 的组织方式也参考了 AIHOT 的项目介绍。

## 为什么分享

不同领域有不同的核心期刊、术语和证据标准。地震学的筛选规则，不能直接用于材料、医学或人工智能研究；一篇“关键词命中”的论文，也未必值得收录或推荐。

我们把可复用的建设方法公开：怎样确认来源、保留证据、区分待审与故障，怎样让人工决定持续有效，怎样让云端保存数据并发布可核验的版本。研究者把精力放在自己熟悉的领域判断上，代理负责把这些判断落实为配置、代码与验证。

## 你会得到什么

以下是 Skill 指导代理在目标网站中实施的能力。先完成真实来源到可用页面的小闭环，再按需求增加其他功能。

| 能力 | 具体结果 |
|---|---|
| 期刊接入 | 逐刊核查 RSS/Atom、官网目录或接口、Crossref ISSN 元数据；记录入口、样例 DOI 与可用状态 |
| 领域定制 | 中英文同义词、主题、范围规则与歧义词统一配置；用正例、反例和边界例检查筛选 |
| 论文整理 | DOI 归一化与去重，保留作者、原题、期刊、来源与日期依据；重复采集保留历史 |
| 导读与审核 | 区分题名、摘要、全文依据；人工收录、暂缓、排除与精选分别记录 |
| 网站浏览 | 论文目录、搜索、期刊/主题/日期筛选、详情与原文入口，支持移动端检查 |
| 阅读与订阅 | 按需求增加周报、RSS、BibTeX/RIS、收藏、已读与稍后读；本地标记可导出备份 |
| 云端协作 | GitHub 管理代码、候选与人工记录，Actions 执行采集；跨运行恢复数据并检查冲突 |
| 持续发布 | 构建公开字段白名单、记录版本摘要、核验线上路由；按需启用定时更新与自动发布 |
| 故障定位 | 区分来源失败、零新增、待审、待补证与技术错误，保留证据和可恢复版本 |

## 它是怎么工作的

```mermaid
flowchart LR
    A[期刊列表与研究关键词] --> B[核查入口与定义范围]
    B --> C[采集元数据与 DOI 去重]
    C --> D[范围判断与证据审核]
    D --> E[合格论文与原创导读]
    D --> F[待审或待补证队列]
    F --> D
    E --> G[校验并构建公开包]
    G --> H[Pages 部署与线上验收]
```

同一论文从不同入口发现时，按 DOI 汇成一条记录。官网发表时间、卷期日期、DOI 登记时间和采集时间分别保存；导读标明依据，人工决定与自动建议分开。

普通收录与正式精选也分开处理。没有充分证据时保留待审，不让模型补造结果。已作出的人工收录决定不会因一次来源故障失效；缺少发布证据时，转入“已通过，等待补证”。

实现细节见 [数据与科学证据](skills/research-paper-site-builder/references/data-and-editorial.md)。

## 开始使用

### 1. 获取完整 Skill

- [直接下载 ZIP](https://github.com/JKbear/research-paper-site-builder/releases/download/v1.0.0/research-paper-site-builder-2026-11-08.zip)
- [查看版本说明](https://github.com/JKbear/research-paper-site-builder/releases/tag/v1.0.0)
- [核对 SHA-256](dist/SHA256SUMS.txt)

也可以克隆本仓库：

```bash
git clone https://github.com/JKbear/research-paper-site-builder.git
cd research-paper-site-builder
```

### 2. 安装并打开自己的工作区

将完整 `research-paper-site-builder` 文件夹放进 Skills 目录。ZIP 解压后直接得到该文件夹；从仓库安装时复制 `skills/research-paper-site-builder/`。

| 环境 | 安装位置 |
|---|---|
| 已设置 CODEX_HOME | `$CODEX_HOME/skills/research-paper-site-builder/` |
| 未设置 CODEX_HOME | `~/.codex/skills/research-paper-site-builder/` |
| Windows 常见位置 | `%USERPROFILE%\.codex\skills\research-paper-site-builder\` |

保留其中的 `SKILL.md`、`agents/`、`assets/`、`references/` 和 `scripts/`。已有同名 Skill 时先比较并备份。若应用尚未识别，重新打开会话再调用。

另建一个目录作为你的论文网站工作区，在 Codex 中打开。也可以直接把本仓库交给代理，让它先读取 [Skill 入口](skills/research-paper-site-builder/SKILL.md)，在另一个项目目录实施。

### 3. 把这段话交给 Codex

```text
使用 $research-paper-site-builder 创建我自己的论文追踪网站。

期刊：Nature Communications、Science Advances。
研究关键词：固态电池、锂金属界面、离子传输。
界面语言：中文，保留英文论文原题。

请先核查期刊入口，完成真实论文的采集、去重、人工审核和本地网站，
实际打开页面并验收，再准备 GitHub 私有仓库与 Cloudflare Pages 部署。
我目前没有云端模型登录，先采用人工审核。
```

只提供期刊和关键词，就可以开始本地建设。GitHub 账号、Pages 项目、正式网址与访问方式在相关阶段落实。示例中的期刊入口仍需实际核查。

### 4. 验收后再接通云端

先用一个真实来源走通采集、审核、构建和页面浏览，再扩展期刊。随后验证手动上线、云端跨运行保存、首次自然定时触发；按需要接入模型审核和自动发布。

首次使用者可直接跟随 [中文快速入门](docs/quick-start.md)，其中写明了各阶段由你确认什么、代理完成什么。

## 改成你的研究领域

期刊决定“从哪里看”，范围规则决定“看什么”，编辑标准决定“哪些值得推荐”。三者都应按你的研究习惯配置。

| 你提供的信息 | 代理落实到哪里 |
|---|---|
| 期刊名称、官网或 ISSN | 逐刊来源核查表与采集配置 |
| 研究关键词、同义词、交叉方向 | 正向范围、主题、歧义和排除规则 |
| 哪些论文值得收录、哪些不收 | 范围正反例、文章类型与审核门槛 |
| 希望如何写导读、如何签发精选 | 证据等级、导读字段与人工签发规则 |
| 站名、语言、更新时间、访问范围 | 品牌、时区、调度与部署配置 |

例如，将示例换为地震学，可以写：

```text
期刊：Seismica、Geophysical Journal International、
Journal of Geophysical Research: Solid Earth。
方向：慢滑移、断层摩擦、光纤地震学。
“fault”只关注地质断层，电气故障与容错计算进入排除或歧义核查。
先普通收录；正式精选需要全文依据与人工确认。
```

从 [配置示例](skills/research-paper-site-builder/assets/site-config.example.json) 开始定制。它是草稿，来源状态为 pending。若你已有 EQHOT 式项目，按 [迁移核对表](skills/research-paper-site-builder/references/eqhot-provenance.md) 检查采集规则、模型提示词、审核门槛、前端主题和部署地址，避免残留旧领域判断。

## GitHub 与 Pages 如何协作

主路线为 **GitHub 私有仓库 + GitHub Actions + Cloudflare Pages Direct Upload**。

| 部件 | 职责 |
|---|---|
| 本地工作区 | 编写、调试、预览、审核差异与制作构建包 |
| GitHub `main` | 保存可信代码、配置、规则和人工决定 |
| GitHub 候选分支 | 持久保存采集结果与自动审核数据，供下一次运行读取 |
| GitHub Actions | 按手动或定时触发采集、审核、构建与上传任务 |
| Cloudflare Pages | 托管经过校验的公开输出，提供正式网站地址 |

发布使用可信代码读取固定版本的候选数据，叠加人工决定后构建。公开包采用字段白名单；上传成功后继续核对版本摘要和必要路由。Actions 临时磁盘与有期限的 artifacts 都需要配合持久存储使用。

**这里的 Pages 默认指 Cloudflare Pages。** 如果你选择 GitHub Pages，手册也提供替代路线，并说明项目子路径、静态能力和访问限制。仓库创建、凭据配置和生产发布按你的当前授权执行。

完整操作顺序见 [GitHub 与 Pages 分步手册](skills/research-paper-site-builder/references/github-and-pages.md)。

## 发布之前

有几件事需要在实际使用中确认：

- **定制范围和访问权限分开。** “私人定制”表示按你的兴趣筛选；若只允许本人或团队访问，需要对页面、JSON、RSS与下载实施访问控制。私有仓库本身不控制网站访问。
- **证据决定导读能写到哪里。** 题名概述、摘要解读和全文阅读分别标注；取得摘要或全文后，还要核对公开转载许可。
- **自动化逐步开启。** 无模型登录时可先人工审核；手动触发成功后，仍需等待并验证自然定时触发。
- **费用与可达性以实际为准。** Actions、模型、存储和域名按当前套餐与用量核算；目标读者的网络访问需要实测。

验收条件、失败诊断和恢复方式见 [验收与运维](skills/research-paper-site-builder/references/verification-and-operations.md)。

## 文档

| 文档 | 何时阅读 |
|---|---|
| [Skill 入口](skills/research-paper-site-builder/SKILL.md) | 代理开始执行任务时 |
| [中文快速入门](docs/quick-start.md) | 第一次安装、建站和连接账号时 |
| [端到端施工步骤](skills/research-paper-site-builder/references/build-playbook.md) | 实现来源、范围、管线与网站时 |
| [GitHub 与 Pages 操作手册](skills/research-paper-site-builder/references/github-and-pages.md) | 创建仓库、组织分支、接通 Actions 与发布时 |
| [数据与科学证据](skills/research-paper-site-builder/references/data-and-editorial.md) | 定义日期、导读、人工优先与发布门槛时 |
| [验收与运维](skills/research-paper-site-builder/references/verification-and-operations.md) | 验证行为、观察运行、定位故障与恢复时 |
| [EQHOT 经验与迁移核对表](skills/research-paper-site-builder/references/eqhot-provenance.md) | 了解实践来源或迁移已有项目时 |
| [配置示例](skills/research-paper-site-builder/assets/site-config.example.json) | 生成自己的 `site.config.json` 时 |
| [v1.0.0 验证记录](docs/validation-2026-11-08.md) | 核查本版工具的测试范围时 |

## 验证与维护

附带的配置校验工具使用 Node.js，无需第三方 npm 包。以下命令在本仓库根目录执行：

```bash
node --test skills/research-paper-site-builder/scripts/validate-config.test.mjs
node skills/research-paper-site-builder/scripts/validate-config.mjs skills/research-paper-site-builder/assets/site-config.example.json
node skills/research-paper-site-builder/scripts/validate-config.mjs YOUR_SITE_CONFIG.json --ready
```

示例通过草稿校验；`--ready` 会拒绝未核实来源、缺失正式 URL 或仓库。结构校验不能证明来源可达，真实采集与线上验收仍在目标项目完成。本版包含12项配置行为测试，分享包已核查 ZIP 完整性与源码一致性。

维护者修改 Skill 并验证后，可用 Python 标准库打包为新文件名：

```bash
python scripts/package_skill.py --output dist/research-paper-site-builder-NEXT_VERSION.zip
```

已有包不会被覆盖。新版本的包、SHA-256 与发布说明应对应同一份 Skill 源文件。分享仓库本身没有运行论文采集或生产部署。

## 反馈与致谢

欢迎通过 [Issues](https://github.com/JKbear/research-paper-site-builder/issues) 反馈实际使用中的问题。请附研究领域、期刊入口、执行步骤、错误信息和预期结果；凭据与私有论文材料留在自己的环境中。

感谢 [AIHOT](https://github.com/KKKKhazix/AIHOT) 项目及其贡献者的开源分享。AIHOT 为 EQHOT 提供了信息聚合与自动化处理的思路参考；本项目进一步整理了论文来源、DOI 身份、科学证据和个性化建站的实施方法，供其他研究者复用。
