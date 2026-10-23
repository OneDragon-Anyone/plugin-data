# 插件发布与收录指南

本文档面向插件开发者，介绍如何创建插件、配置自动打包发版，以及如何将插件收录到 ZZZOD 插件应用中心。

---

## 核心机制

ZZZOD 插件仓库采用“**作者仓库发版 + 官方自动索引**”的模式：

- 插件代码存放在您自己的 GitHub 仓库中。
- 您在自己仓库打 tag 发版时，GitHub Actions 会自动生成插件安装包（`<id>.zip`）。
- **仅需在首次发布时提交一次收录申请**。一旦收录，后续所有版本更新全自动同步，无需人工介入。

---

## 1. 快速创建插件仓库

推荐直接使用官方模板仓库创建新项目：

👉 **模板仓库**：[`OneDragon-Anyone/plugin-template`](https://github.com/OneDragon-Anyone/plugin-template)（点击页面右上角 **Use this template** -> **Create a new repository**）。

仓库标准目录结构：

```text
your-plugin-repo/
├── .github/
│   └── workflows/
│       └── release.yml          # 自动打包发版工作流（引用模板 v1）
├── your_plugin_id/              # 插件主包目录（与 id 保持一致）
│   ├── __init__.py
│   ├── your_plugin_id_const.py
│   ├── your_plugin_id_factory.py
│   └── plugin.json              # 插件元数据配置
├── README.md
└── LICENSE
```

---

## 2. 编写插件元数据 (`plugin.json`)

在插件包目录下创建 `plugin.json`，示例如下：

```json
{
  "id": "my_plugin",
  "name": "我的插件名称",
  "summary": "插件功能简述（20-50字为宜）",
  "version": "1.0.0",
  "versionCode": 1,
  "defaultGroup": true,
  "needNotify": false,
  "author": {
    "name": "作者名",
    "url": "https://github.com/your-username"
  },
  "homepage": "https://github.com/your-username/your-plugin-repo",
  "risk": [],
  "compatibility": {
    "minAppVersion": "0.0.0",
    "minCoreApiVersion": 1,
    "python": ">=3.11"
  }
}
```

### 关键字段说明
- **`id`**：全局唯一英文标识符，仅支持小写字母、数字和下划线。
- **`versionCode`**：必须为正整数。**每次发新版时必须递增**（如 1 -> 2 -> 3），系统以此判定新旧版本。
- **`risk`**：声明插件所涉及的系统权限与风险行为，需如实申报：
  - `automation`：键盘鼠标模拟操作
  - `process`：读取或操作进程
  - `network`：访问外网接口或网络通信
  - `filesystem`：读写插件目录外的文件

---

## 3. 配置自动发版工作流

在仓库中添加 `.github/workflows/release.yml` 文件：

```yaml
name: Release Plugin

on:
  push:
    tags:
      - "v*"

permissions:
  contents: write

jobs:
  release:
    uses: OneDragon-Anyone/plugin-template/.github/workflows/reusable-release.yml@v1
```

配置完成后，当您在本地推 tag 时：

```shell
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions 会自动执行结构校验、生成 `<id>.zip` 并发布到 GitHub Releases。

---

## 4. 提交收录（仅需首次操作）

当您的仓库有了第一个带有 `<id>.zip` 附件的 Release 后，即可申请收录：

1. **提交申请**：
   - 打开 [plugin-registry](https://github.com/OneDragon-Anyone/plugin-registry/issues/new/choose) 提一个 Issue。
   - 标题填写：`[submission] 你的插件名`
   - 正文填入您的 GitHub 仓库完整链接，例如：`https://github.com/your-username/your-plugin-repo`。
2. **机器人自动处理**：
   - 收录机器人会在 1 分钟内自动核验仓库权限、`plugin.json` 规范及 Release 附件结构。
   - 校验通过后，机器人会自动为 Registry 创建收录 PR。
   - 如果校验失败，机器人会在 Issue 下回复具体报错原因。修改后在 Issue 回复 `/recheck` 即可重新校验。
3. **审核上线**：
   - 维护者确认风险声明与标签无误后合并 PR，插件正式出现在商店列表与 API 中。

---

## 5. 后续版本更新（全自动）

插件被收录后，后续更新**无需再次提交任何 Issue 或申请**：

1. 修改代码。
2. 在 `plugin.json` 中递增 `versionCode`（例如由 `1` 改为 `2`），并更新 `version`。
3. 提交代码并推送新的 Git tag（例如 `v1.0.1`）。
4. 您的 GitHub Actions 会自动生成新 Release。
5. Registry 定时构建任务（每 6 小时一次）会自动抓取新版本并更新商店与客户端。

---

## 常见问题与避坑

1. **附件不可变原则**：
   - 请勿在已经发布的 Release 下重新上传同名 zip 附件覆盖旧文件。
   - 插件仓库会锁死首次抓取到的文件哈希以保障安全性，被篡改的同版本附件会被系统自动拒绝。如需修复任何问题，请递增版本号发布新 Release。
2. **版本号未更新**：
   - 如果发布了新 Release 但商店没有同步，请检查 `plugin.json` 中的 `versionCode` 是否严格大于上一版本。
3. **附件命名要求**：
   - 自动工作流会严格生成与 `id` 同名的 `<id>.zip`。如手动上传，必须保证文件名完全匹配。
