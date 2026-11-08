# GitHub、Actions 与 Pages 逐步操作

主路线复用 EQHOT 的职责划分，不依赖其账号或私有源码。核查日期：2026-11-08；实际执行时重新核对服务界面、权限、CLI/Action版本和套餐。

## 0. 分清服务

| 部件 | 负责什么 | 不负责什么 |
|---|---|---|
| 本地工作区 | 实现、调试、预览、差异与备份 | 不是长期在线运行器 |
| GitHub 私有仓库 | 版本、配置、候选、人工决定、PR与协作 | 私有仓库不会自动让网站私有 |
| GitHub Actions | 定时/手动执行采集、审核、构建、上传 | runner临时磁盘不是永久存储 |
| Cloudflare Pages | 托管经过投影的公开静态包；可选Functions | 静态托管本身不会运行每日采集 |

“给自己定制、允许他人访问”可用公开站。若要求只本人/团队可读，应另选并验证访问控制，覆盖 HTML、catalog、RSS、图片和别名域名，不仅隐藏首页。

## 1. 准备本地 Git 与账号

1. 检查 Node、Git、可用浏览器；新项目可选当前受支持的Node版本并固定于CI。EQHOT的既有CI使用Node22；迁移时重新验证兼容性。
2. 完成真实来源闭环、测试和独立生产包。准备 `.gitignore`：`work/`、`node_modules/`、凭据文件和 `.env*` 等；已被Git跟踪的文件不会因新增ignore自动解除跟踪。
3. 预览待提交清单，按明确路径暂存；不执行 `git add .` 混入原材料、下载PDF、浏览器记录和历史数据。
4. 在GitHub创建用户选定的私有仓库，或读取已有仓库；创建/推送遵守当前任务授权。可用连接器、Git、已有CLI或网页；不把 `gh` 安装当先决条件。
5. 新建空仓库时避免同时生成与本地冲突的README；已有远端先fetch并核对，不能force覆盖。

新空仓库命令示例，须替换 OWNER/REPO 且确认远端；已有项目不重复初始化：

```powershell
git init -b main
git add -- AGENTS.md package.json site.config.json lib scripts public tests .gitignore
git diff --cached --stat
git commit -m "Create personalized paper watch site"
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

列出的目录须已实际存在。若使用 package-lock.json 或其他必要文件，也按清单加入。提交前检查内容；不能只看文件数。

## 2. 首次手动部署到 Cloudflare Pages

先采用 Direct Upload：构建在本地/Actions完成，Pages只接收公开输出。Direct Upload项目不能原地切成Git integration，选择前先核对现有项目类型。[官方说明](https://developers.cloudflare.com/pages/get-started/direct-upload/)

1. 登录自己的Cloudflare，进入 Workers & Pages 的创建入口，选 Pages / Direct Upload（实际标签可能调整），填唯一项目名和生产分支。
2. 核对 `site.config.json` 的项目名与正式URL；名称可能被占用，以实际分配URL为准，再重建 canonical、RSS、sitemap。
3. 纯静态首版可上传公开目录或对应ZIP，确保根层直接是 `index.html`，不能外套一层目录。CLI上传接收目录而不是ZIP。
4. 有 `_worker.js` / Functions 的高级包使用支持它的Wrangler流程，并实际验证后端；不要把拖拽静态包当作在线后台已运行。
5. 上传前保存现有正常deployment ID；上传后执行线上验收。不要上传仓库根目录、私有report或整个 `work/`。

CLI示例是会修改线上状态的操作，仅在授权后执行；使用已核验且固定的Wrangler版本，本地安装即可，无需全局安装：

```text
npx wrangler pages project create PROJECT --production-branch main
npx wrangler pages deploy PUBLIC_DIR --project-name PROJECT --branch main
```

凭据通过服务官方登录或安全环境绑定提供，不能粘贴到代码、聊天或命令历史。首次发布可由用户在控制台完成，代理继续负责构建和验收。

## 3. 设计仓库协作与持久化

采用两层职责：

- `main`：已验证的代码、配置、规则和人工决定。
- `automation/candidates`：累计采集和自动审核数据，运行间恢复。代码基线可以同步main，但发布不能因此执行候选分支代码。
- 固定一个候选PR方便观察数据变化，不自动合并整个候选分支进main。公开发布用可信main代码读取**固定SHA**的候选数据白名单，再叠加main人工决定。
- 首轮没有候选分支时，从固定main SHA创建；后续先读上一轮状态、再同步可信代码、再采集。有冲突则保留现场/产物并停止，禁止用ours、强推或整目录复制吞掉人工字段。
- 保存采用非强推和预期头比较：写前确认分支头仍等于读入SHA；落盘后保存提交SHA。并发变化重新取快照，不能覆盖。

协作默认走功能分支/PR审阅代码改动；维护者确认后合并。添加新的期刊通常是配置+适配器+样例核对，不直接改线上JSON。可用Issue模板接收“DOI、原文、问题、证据”的纠错，但不要自动向别人发消息。

## 4. 分阶段创建 Actions 草稿

先写在 `docs/workflows/` 供审阅；只有获准修改/启用CI时才放 `.github/workflows/`。下列为需要实现的职责，不是可直接复制执行的完整YAML：

| 工作流 | 触发 | 可信输入、权限与输出 |
|---|---|---|
| Collect candidates | 先workflow_dispatch，通过后schedule | 固定main代码+上轮候选数据；仅候选写入所需contents，创建PR才加pull-requests；保存健康、候选和日志；不持有部署凭据 |
| Review candidates（可选） | 手动，之后可接采集成功事件 | 固定可信代码与候选SHA；无仓库写权限的审核计算；独立保存job校验结果后只更新允许数据；模型凭据与发布凭据隔离 |
| Publish Pages | 手动deploy=false，验收后再开自动 | 固定main与候选SHA；测试→证据/健康门槛→生产包→比对内容摘要→部署→线上核验；只有上传步骤可取Cloudflare凭据 |
| Monitor（按需） | 单独定时/手动 | 只读检查最近运行、来源、积压、线上manifest；不采集、不审核、不发布 |

所有写入链路共用站点级并发锁（如 `paper-watch-data`，不取消运行中的写任务）；锁不能代替远端SHA检查。为每个job设置有限超时，失败保留私有artifact和明确状态；有效候选可保存，但来源失败不能被后续成功保存步骤掩盖。

官方Action固定到经核验的完整commit SHA；npm CLI用确定版本。不要复制EQHOT当时的版本号作为永不过期的最新版。`workflow_run` 能拿到较高权限，必须校验原仓库、分支、事件结论和SHA，不能下载并执行不可信artifact或候选代码。[安全依据](https://docs.github.com/en/actions/reference/security/secure-use)

**事件衔接**：不要假设内置GITHUB_TOKEN推送必然触发下一工作流。采用经过验证的workflow_run成功事件或显式受控dispatch；首轮检查真实 run ID 和父子来源。workflow文件在默认分支存在是若干触发器的前提。

## 5. 连接发布凭据

按照Cloudflare官方CI流程创建最小可用账号范围的 Pages Edit token，读取Account ID。GitHub仓库 Settings → Secrets and variables → Actions（界面以实际为准）保存：

| 名称（建议） | 类型 | 用途 |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Secret | Pages上传，不提供给采集/模型 |
| `CLOUDFLARE_ACCOUNT_ID` | Secret或受控配置 | 对应目标账号 |
| `PAGES_PROJECT` | Variable | 目标Pages项目 |
| `SITE_URL` | Variable | 正式HTTPS源地址 |
| `AUTO_PUBLISH` | Variable，初始false | 首次手动验收后按授权打开 |

Token不保证能细到单个项目；核对实际权限范围，并由可信部署程序检查账号、项目、域名及production_branch。私有token不进入前端或预览包。配置步骤完成后只核验名称/可用性，不读回或打印明文。[官方CI操作](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)

先手动运行只构建不部署，下载artifact验收 → 明确执行首次上传 → 线上manifest核验 → 用户需要自动更新时打开AUTO_PUBLISH。关闭变量能停止后续自动上传，不能撤销已经完成的部署。

## 6. 启用定时与可选自动审核

先证明：第一轮采集能保存，第二轮能读取第一轮新增数据且不重复；没有新内容不重复发布；来源故障保留旧版。再加schedule。示例UTC cron `17 20 * * *` 对应北京时间次日04:17；当前GitHub也提供时区感知调度，实际使用前核验语法。调度可能延迟/丢弃，不能承诺准点。[触发规则](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)

模型审核是增强项：使用当前可用、合法授权的服务，不要求迁移EQHOT的特定登录存储App。先配置成本上限、无工具执行权限、结构化输出、独立复核和故障状态；手动小批实跑后再云端化。不要把需要持续刷新且缺乏安全存储的个人登录文件放入仓库。

## 替代路线

**Cloudflare Git integration**：用户选择由Cloudflare直接构建时，绑定其仓库并配置build命令/输出目录。不得默认将候选分支或私有原始JSON公开；构建仍需投影与验收。已有Direct Upload项目不声称可一键切换。[官方文档](https://developers.cloudflare.com/pages/configuration/git-integration/)

**GitHub Pages**：用户明确选择时，仓库 Settings → Pages → GitHub Actions，使用受支持的Pages配置、artifact上传与部署Action，并设置最小 `pages:write` / `id-token:write` 权限。Project站通常部署到 `/REPO/`，所有路由、资源、RSS和canonical必须支持basePath；纯静态站不支持Cloudflare Worker审核接口。私有仓库可用性和站点访问控制取决于套餐，不能承诺免费且私有。使用前核对 [GitHub Pages说明](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)。

**完全私有站**：另加已验证的Access/服务端授权方案或适用套餐；未验证前不发布私密数据。此时原本要公开的RSS、下载和catalog也要纳入访问策略。
