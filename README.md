# Plugin Data

ZZZOD 插件仓库的**数据仓**：只存放人工审核数据与策略，CI 产物（站点与 `/api/v1`）从这里部署。

- `registry/plugins/{id}.json` —— 每个插件一个审核条目（机器人通过 `[submission]` Issue 自动生成，或维护者手工添加）
- `registry/policy.json` —— 保留 ID、封禁名单、大小限制、频控
- `lock` 分支 —— 每个已接受版本的 sha256 与 versionCode 高水位（仅构建写入）
- Issue —— 插件提交、转移、举报、申诉入口（机器人自动处理）

代码（构建脚本、机器人、WebUI、可复用工作流）在 [plugin-registry](https://github.com/OneDragon-Anyone/plugin-registry)，由本仓的薄工作流以 `@v1` 标签调用；机器人与构建只持有本仓的临时令牌，写不了代码仓。

站点与 API：https://onedragon-anyone.github.io/plugin-data/

作者指南见 [docs/runbook.md](docs/runbook.md)，维护指南见 [docs/maintainer.md](docs/maintainer.md)。
