# 个性化论文网站构建 Skill

只需先提供**期刊列表**和**研究领域关键词**，让支持 Skills 的 Codex 按可核查的流程，逐步创建自己的论文追踪网站。

本项目整理自 EQHOT 的实际建设经验，主路线为 **GitHub 私有仓库 + GitHub Actions + Cloudflare Pages**：GitHub 管理代码与数据，Actions 执行采集和审核，Pages 托管经过校验的网站。这里的 Pages 默认指 Cloudflare Pages；操作手册也说明了 GitHub Pages 替代路线。

EQHOT 参考 [AIHOT 开源项目](https://github.com/KKKKhazix/AIHOT) 构建，借鉴其信息聚合与自动化处理思路，并面向学术论文追踪进行了领域化设计。感谢 AIHOT 项目及其贡献者的开源分享。

这是供 AI 代理执行的 Skill 与施工手册。它包含配置校验工具，采集器和网站由代理根据你的输入在新项目中实现；下载后不会凭空出现已上线的网站。不需要访问 EQHOT 私有仓库，也不需要先准备模型登录。

## 下载与安装

- [下载完整 Skill 分享包](dist/research-paper-site-builder-2026-11-08.zip?raw=true)
- [版本发布与下载](https://github.com/JKbear/research-paper-site-builder/releases)
- [SHA-256 校验文件](dist/SHA256SUMS.txt)

解压后，将完整 `research-paper-site-builder` 文件夹放到你的 `$CODEX_HOME/skills/`；未设置 CODEX_HOME 时放到 `~/.codex/skills/`。Windows 常见位置是 `%USERPROFILE%\.codex\skills\`。不要只复制 SKILL.md，保留 references、assets、scripts 和 agents。若应用尚未识别新 Skill，重新打开会话后再调用。

也可以克隆本仓库，然后复制 `skills/research-paper-site-builder/` 文件夹。已有同名 Skill 时先比较版本并保留备份。

## 如何使用

在独立的网站工作区中对 Codex 说：

```text
使用 $research-paper-site-builder 创建我自己的论文追踪网站。
期刊：Nature Communications、Science Advances。
研究关键词：固态电池、锂金属界面、离子传输。
界面语言：中文，保留英文论文原题。
先完成真实来源接入、本地网站与验收，再准备 GitHub 私有仓库和 Cloudflare Pages 部署。
我目前没有云端模型登录，先采用人工审核。
```

可替换为任意研究领域，期刊名称和关键词足以启动本地建设。账号、仓库、正式网址和访问控制在相关阶段再落实。**兴趣私人定制不等于网站仅本人可见**；若需要私有访问，请在发布前明确要求。

## 会一步步完成什么

1. 形成统一配置，扩展中英文同义词，区分主题、正向范围、排除词与歧义词。
2. 逐刊核查官网、ISSN、RSS/Atom、官方接口或 Crossref 入口；不猜测 feed 地址。
3. 实现采集、DOI 去重、来源健康、日期依据、人工决定与证据导读。
4. 实现论文目录、搜索筛选、详情；按需求增加周报、RSS、引用导出和阅读标记。
5. 建立 GitHub 代码/人工记录与候选数据边界，验证 Actions 跨运行持久化。
6. 先手动部署 Cloudflare Pages 并检查线上版本，再按需要启用定时采集和自动发布。

## 文件导航

| 文件 | 用途 |
|---|---|
| [Skill 入口](skills/research-paper-site-builder/SKILL.md) | 代理执行入口与分阶段路由 |
| [中文快速入门](docs/quick-start.md) | 给首次使用者的实际操作顺序与角色分工 |
| [端到端施工步骤](skills/research-paper-site-builder/references/build-playbook.md) | 从两项输入到本地可用网站 |
| [GitHub 与 Pages 操作手册](skills/research-paper-site-builder/references/github-and-pages.md) | 仓库、候选分支、Actions、凭据和部署 |
| [数据与科学证据](skills/research-paper-site-builder/references/data-and-editorial.md) | 数据分层、日期、导读、人工优先与发布门槛 |
| [验收与运维](skills/research-paper-site-builder/references/verification-and-operations.md) | 测试、线上核验、故障与恢复 |
| [EQHOT 经验来源](skills/research-paper-site-builder/references/eqhot-provenance.md) | 实施过程、迁移陷阱与官方文档 |
| [配置示例](skills/research-paper-site-builder/assets/site-config.example.json) | 可替换为自己的领域；来源尚未核实 |
| [本版验证记录](docs/validation-2026-11-08.md) | 测试范围与证据边界 |

## 校验与重新打包

需要 Node.js；校验脚本不依赖第三方 npm 包：

```text
node --test skills/research-paper-site-builder/scripts/validate-config.test.mjs
node skills/research-paper-site-builder/scripts/validate-config.mjs skills/research-paper-site-builder/assets/site-config.example.json
node skills/research-paper-site-builder/scripts/validate-config.mjs YOUR_SITE_CONFIG.json --ready
```

示例允许草稿校验通过，`--ready` 会拒绝未核实来源、缺失正式 URL 或仓库。结构通过不代表已联网核实来源。

维护者修改 Skill 并验证后，可用 Python 标准库创建**新文件名**的包：

```text
python scripts/package_skill.py --output dist/research-paper-site-builder-NEXT_VERSION.zip
```

下载包、校验值和版本说明应与该版本源文件一致。分享仓库本身没有启用论文采集、CI 自动部署或模型服务。
