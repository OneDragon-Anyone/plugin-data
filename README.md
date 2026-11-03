# ZZZOD 插件数据仓

存放所有已收录插件的配置、审核决策与在线索引。

- 🌐 **在线插件市场**：[https://onedragon-anyone.github.io/plugin-data/](https://onedragon-anyone.github.io/plugin-data/)
- 📖 **开发者发版指南**：[docs/runbook.md](docs/runbook.md)
- 🛠️ **仓库维护手册**：[docs/maintainer.md](docs/maintainer.md)
- 💻 **配套市场仓**：[OneDragon-Anyone/plugin-market](https://github.com/OneDragon-Anyone/plugin-market)（自动审核、构建索引、渲染市场网页与镜像分发）

---

## 目录结构

```text
├── market/
│   ├── plugins/{id}.json    # 各插件配置与审核信息（提交 Issue 后由机器人自动生成）
│   └── policy.json          # 收录规则（命名限制、保留 ID）与国内镜像源配置
├── docs/                    # 开发者发布手册与维护说明
└── .github/workflows/       # 自动化流水线（定时构建、提交自动审核）
```

---

## 插件收录与更新流程

1. **作者提交**：插件开发者在自己的 GitHub 仓库发版后，在本仓库发起 `[submission]` Issue 申请收录。
2. **自动校验**：审核机器人会自动检查插件包规范，并自动创建收录 PR。
3. **审核上线**：维护人员核对后合并 PR，定时构建任务会自动抓取最新版本并同步到插件商店中。
4. **后续更新**：插件收录后，作者后续在自己仓库发布新版本均会全自动同步，无需重复提交。

---

## 国内镜像

索引、封面与安装包在 CNB 各有一份，国内网络访问更快：

- **索引与封面**：[plugin-mirror](https://cnb.cool/OneDragon-Anyone/plugin-mirror)，内容与本仓 `api/v1/` 一致
- **安装包**：[plugin-mirror-release](https://cnb.cool/OneDragon-Anyone/plugin-mirror-release)，每个插件一个包，包名为插件 id

`plugins.json` 里每个版本的 `sources.cnb` 给出安装包直链，客户端按网络情况切换下载源；镜像不可用时自动回落 GitHub 原址。
