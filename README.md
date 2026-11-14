# ZZZOD 插件数据仓

存放所有已收录插件的配置、审核决策与在线索引。插件包本身不在这里，由作者仓库的 GitHub Release 提供。

- 在线插件市场：<https://onedragon-anyone.github.io/plugin-data/>
- 客户端：<https://github.com/OneDragon-Anything/ZenlessZoneZero-OneDragon>
- 模板仓：<https://github.com/OneDragon-Anyone/plugin-template>（插件参考）
- **数据仓**：<https://github.com/OneDragon-Anyone/plugin-data>（插件提交）
- 市场仓：<https://github.com/OneDragon-Anyone/plugin-market>（插件服务）

如果你只是想维护本仓库，请看 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 目录结构

```text
├── market/
│   ├── plugins/{id}.json    # 各插件配置与审核信息（提交 Issue 后由机器人自动生成）
│   └── policy.json          # 收录规则（命名限制、保留 ID）与索引镜像配置
├── docs/                    # 站点设计方案预览页
└── .github/workflows/       # 自动化流水线（定时构建、提交自动审核）
```

## 插件收录与更新流程

1. **作者提交**：插件开发者按模板仓说明发布带 `<id>.zip` 的 Release，在本仓库发起 `[submission]` Issue 申请收录，推荐走[提交插件页](https://onedragon-anyone.github.io/plugin-data/submission/)。
2. **自动校验**：审核机器人检查插件包规范，通过后自动创建收录 PR；不合规会在 Issue 里写明原因。
3. **审核上线**：维护人员核对后合并 PR，下一次定时构建会抓取最新版本并同步到插件市场。
4. **后续更新**：收录后作者发新 Release 会自动同步，无需重复提交。

## 插件包镜像

插件包默认取作者仓库 GitHub Release 的直链，安装前校验 sha256。有国内镜像的，在 `market/plugins/{id}.json` 里加一行 `mirror`（与 `repo` 同级），值填仓库首页；下载路径由构建拼，之后的版本自动套用：

```jsonc
// 最多两条，没镜像就不写这行
"mirror": ["https://cnb.cool/组名/仓库名", "https://gitee.com/用户名/仓库名"]
```

镜像里的 tag 和附件名要跟 GitHub Release 一致；不要贴某一版的链接，会被校验拒绝。

还没收录的把地址写在 Issue 的备注里，维护者合并前加进去；已收录的改文件提 PR。
