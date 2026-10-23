# ZZZOD Plugin Registry

ZZZ OneDragon 第三方插件仓库：Astro + Vue 静态站点 + 版本化 JSON API，采用「作者仓库 + 官方索引」模式（设计参考 KernelSU / LSPosed，见 `docs/plugin-registry-prd.md`）。

- 插件源码、Release、Star 保留在作者仓库；本仓库只保存人工审核数据。
- CI 定时从作者仓库拉取 Release，校验 `<id>.zip` 附件后生成 `/api/v1/*` 与 WebUI。
- 作者提交一次仓库地址后，发新版无需再提 PR。

## 目录

```text
registry/
├── plugins/{id}.json     # 人工审核数据（一个插件一个文件，机器人自动生成）
└── policy.json           # 保留 ID、封禁名单、大小限制、频控
scripts/                  # build-registry / check-registry / submission-bot（TypeScript）
src/                      # Astro + Vue WebUI
public/api/v1/            # 构建产物，不由人工编辑（CI 生成）
.github/
├── ISSUE_TEMPLATE/       # submission / transfer / report / appeal
└── workflows/
    ├── build-registry.yml      # 定时构建：抓取 Release、写 lock 分支、生成 API、部署 Pages
    ├── submission-bot.yml      # 提交机器人：校验 Issue、开收录 PR、维护标签状态机
    └── validate-registry.yml   # PR 必需检查 registry/validate
```

`schemas` 校验只有一份实现：插件包校验（manifest、const 一致性、zip 结构）在 `plugin-template` 仓库的 `scripts/validate_plugin.py`，本仓库 CI 检出模板的固定版本（`vars.TEMPLATE_REF`，默认 `v1`）调用同一脚本。

## Commands

```shell
pnpm install
pnpm registry:check          # 校验 registry/plugins/*.json（--resolve 联网核对 repoId，--deep id1,id2 下载校验 Release）
pnpm registry:build          # 拉取 GitHub 数据，生成 public/api/v1/* 与 sources.lock.json
pnpm build                   # 构建 WebUI（需要先 registry:build 或接受空列表）
pnpm dev                     # 本地开发
```

本地跑 `registry:build` 需要模板工具与 Python：

```shell
TEMPLATE_DIR=../plugin-template PYTHON=<python> pnpm registry:build
```

无 GitHub Token 时走匿名配额（60 次/时）；CI 中由 `GITHUB_TOKEN` 提供。

## 提交插件（作者视角）

1. 按 [plugin-template](https://github.com/OneDragon-Anyone/plugin-template) 创建插件仓库，打 `v<version>` tag 发布带 `<id>.zip` 附件的 Release。
2. 在网站提交页填仓库地址，预览无误后提交（或直接用 GitHub Issue 模板 `[submission]`）。
3. 机器人自动校验：仓库所有权、`plugin.json`、Release 附件、包结构；通过则创建收录 PR，维护者审核合并。
4. 之后发布新 Release 会由 `build-registry.yml` 自动同步，无需再提交。

维护者手工新增条目时，在 `registry/plugins/{id}.json` 写入第 7.2 节格式的审核数据（可用 `scripts/lib/registry.ts` 的 `formatEntry` 作为字段参考），走 PR 合并。

## Static API

```text
/plugin-registry/api/v1/index.json
/plugin-registry/api/v1/plugins.json
/plugin-registry/api/v1/plugins/{id}.json
/plugin-registry/api/v1/search-index.json
/plugin-registry/api/v1/covers/{id}-{versionCode}.{ext}
```

v1 契约只增不改；破坏性变更升 `/api/v2/`。

## Deployment

1. 推送到仓库默认分支 `master`。
2. Settings → Pages：Source 选 `GitHub Actions`。
3. 可选变量：`SITE_URL`、`TEMPLATE_REPOSITORY`、`TEMPLATE_REF`（默认 `OneDragon-Anyone/plugin-template` @ `v1`）。
4. 默认分支 ruleset：所有变更走 PR，必需检查 `registry/validate`（机器人 PR 由机器人写同名 commit status）。

构建状态存放在 `lock` 分支的 `sources.lock.json`（已接受版本的 sha256 与 versionCode 高水位），只由 `build-registry.yml` 写入。
