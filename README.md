# ZZZOD 插件数据仓

存放所有已收录插件的配置、审核决策与在线索引。

- 🌐 **在线插件市场**：[https://onedragon-anyone.github.io/plugin-data/](https://onedragon-anyone.github.io/plugin-data/)
- 📖 **开发者发版指南**：[docs/runbook.md](docs/runbook.md)
- 🛠️ **仓库维护手册**：[docs/maintainer.md](docs/maintainer.md)
- 💻 **配套市场仓**：[OneDragon-Anyone/plugin-market](https://github.com/OneDragon-Anyone/plugin-market)（自动审核、构建索引与网页、同步镜像）

---

## 目录结构

```text
├── market/
│   ├── plugins/{id}.json    # 各插件配置与审核信息（提交 Issue 后由机器人自动生成）
│   └── policy.json          # 收录规则（命名限制、保留 ID）与索引镜像配置
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

安装包默认走你仓库 GitHub Release 的直链，安装前校验 sha256。国内有镜像的，在 `market/plugins/{id}.json` 里加一行 `mirror`（与 `repo` 同级），值填仓库首页；下载路径由构建拼，之后的版本自动套用：

```jsonc
// 最多两条，没镜像就不写这行
"mirror": ["https://cnb.cool/组名/仓库名", "https://gitee.com/用户名/仓库名"]
```

镜像里的 tag 和附件名要跟 GitHub Release 一致；别贴某一版的链接，会被校验拒绝。

还没收录的把地址写在 issue 的备注里，维护者合并前加进去；已收录的改文件提 PR。
