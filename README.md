# ZZZOD Plugin Data (数据仓)

ZZZOD 官方插件应用中心的数据仓库，用于存储所有已收录插件的配置、审核决策与在线索引。

- 🌐 **在线插件市场**：[https://onedragon-anyone.github.io/plugin-data/](https://onedragon-anyone.github.io/plugin-data/)
- 📖 **开发者发版指南**：[docs/runbook.md](docs/runbook.md)
- 🛠️ **仓库维护手册**：[docs/maintainer.md](docs/maintainer.md)
- 💻 **核心代码仓**：[OneDragon-Anyone/plugin-registry](https://github.com/OneDragon-Anyone/plugin-registry)（前端界面与自动化机器人）

---

## 目录结构

```text
├── registry/
│   ├── plugins/{id}.json    # 各插件配置与审核信息（提交 Issue 后由机器人自动生成）
│   └── policy.json          # 插件收录规则（命名限制、保留 ID 等）
├── docs/                    # 开发者发布手册与维护说明
└── .github/workflows/       # 自动化流水线（定时构建、提交自动审核）
```

---

## 插件收录与更新流程

1. **作者提交**：插件开发者在自己的 GitHub 仓库发版后，在本仓库发起 `[submission]` Issue 申请收录。
2. **自动校验**：审核机器人会自动检查插件包规范，并自动创建收录 PR。
3. **审核上线**：维护人员核对后合并 PR，定时构建任务会自动抓取最新版本并同步到插件商店中。
4. **后续更新**：插件收录后，作者后续在自己仓库发布新版本均会全自动同步，无需重复提交。
