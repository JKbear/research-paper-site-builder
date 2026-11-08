# EQHOT 经验来源、迁移陷阱与官方依据

核对日期：2026-11-08。项目：EQHOT，云端仓库 `JKbear/EQHOT`，核查主分支提交 `1cdcde663fe28210f21c394645d8dea53267c375`。这是经验溯源，不是运行本Skill的依赖；仓库可能私有，其他使用者不需要它的访问权限。没有复制原站源码、论文库、登录数据或本地未提交修改。

## 原站如何逐步形成

1. 明确地震学范围、期刊清单、精选规则，核查各刊官网/元数据接入。
2. 用Node与静态前端实现本地论文目录、主题、期刊、详情和采集；无需先引入数据库。
3. 增加证据等级、人工导读、审核工作台、来源健康、日期依据、周报、阅读记录、RSS和引用导出。
4. 先构建独立公开包并手动上传Cloudflare Pages，检查HTTP、路由和公开字段。
5. 转入GitHub私有仓库，Actions采集后存入固定候选分支/PR，避免临时runner丢数据。
6. 加入规则与模型初审/复核，保存输入指纹和证据；普通收录与正式精选分开。
7. 由可信main代码构建固定候选快照，通过测试、来源与证据门禁后上传Pages，内容摘要未变则跳过。
8. 云端成为主版本，本地用于实施验证与备份；后加私有逐篇审核，把人工决定和待补证分开。

原站当前精选规范 `docs/highlights/editorial-standard.md` 要求正式精选核对全文与关键图、绑定F级阅读记录并人工确认；旧README中的“A或F可签发”是历史描述。本Skill为新站提供可配置的编辑契约，不把其他人的普通收录直接当作EQHOT正式精选。

仓库历史说明包含多个时间点和后来追加的更正；README中的早期刊数、篇数、本地定时任务及“尚未接通”不能直接作为当前状态。复用流程时查实际代码/配置和最新运行证据，不引用旧验收数字冒充新站结果。

## 授权使用原站源码时的迁移核对表

| 原站路径/符号 | 迁移时必须检查 |
|---|---|
| `data/journals.json`、`scripts/collect.mjs` | 刊名/ID/ISSN/feed、官网适配、回溯窗与接入状态；原刊接口不是任意新刊的通用解析器 |
| `lib/papers.mjs`：TOPICS、TOPIC_PATTERNS、isSeismologyRelevant、selectFeedCandidates | 八主题、领域正则、歧义排除、Seismica全收特例、新闻类型过滤 |
| `lib/auto-review.mjs`：autoReviewGate | 独立的地震学正向/负向门槛；不能只修改采集筛选函数 |
| `lib/rule-review.mjs`、`lib/codex-reviewer.mjs`、`lib/review-model.mjs` | 规则、模型提示词、版本/指纹与导读语义；旧审核结果不能跨领域直接沿用 |
| `lib/publication.mjs`、`lib/catalog.mjs` | 收录/待审/待补证/精选门槛和人工优先 |
| `public/index.html`、`public/app.js`、阅读存储模块 | 站名、首页文案、主题、localStorage命名、域名、引用与导航 |
| `.github/workflows/*.yml` | repository guard、private条件、分支、workflow名字依赖、并发组、变量/secret名称、cron |
| `scripts/cloud-publish.mjs`、`scripts/deploy-pages.mjs`、`scripts/check-pages.mjs` | 仓库、项目、生产分支、正式域名、线上版本与登录验收的硬编码 |
| `lib/cloud-publish.mjs` | 候选数据白名单与公开投影；不执行候选代码、不公开审核证据 |
| `cloud/review-worker.mjs`、`docs/private-review.md` | 可选私有审核、允许账号、OAuth回调、绑定；先决定是否需要，不能照抄个人身份 |
| `scripts/snapshot-cloud-data.mjs`、`scripts/monitor-operations.mjs` | 云端快照备份与只读监控；不是本地旧库覆盖云端 |

在授权源副本中用 `rg -n 'EQHOT|eqhot|JKbear|seism|earthquake|地震|断层'` 帮助定位，逐处判断语义；不全仓盲目替换。期刊原题/原文中正常出现领域词不应被改写。移植前确认源码许可或权利人授权；私有仓库可读取不等于可公开再分发。

## 官方资料与使用边界

这些入口支持服务操作，不替代运行时验证。只记录与本Skill直接相关的结论：

- [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)：预构建上传、目录/ZIP方式差异、项目类型切换限制。
- [Cloudflare外部CI部署](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)：Wrangler上传与Pages权限配置。
- [Cloudflare Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)：作为用户明确选择的另一构建路线。
- [GitHub工作流事件](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)：schedule/workflow_run边界、默认分支与调度延迟。
- [GitHub安全使用](https://docs.github.com/en/actions/reference/security/secure-use)：最小权限、可信代码边界与固定Action版本。
- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)：静态托管、Project路径和套餐差异。
- [Crossref REST API使用建议](https://www.crossref.org/documentation/retrieve-metadata/rest-api/tips-for-using-the-crossref-rest-api/)：合理请求与元数据检索，不把元数据视作完整官网覆盖。

维护本Skill时把过时的服务步骤局部更新，不把EQHOT个人账号、某次故障参数或历史授权变成其他使用者的默认规则。
