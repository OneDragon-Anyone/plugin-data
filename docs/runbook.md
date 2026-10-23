# 插件发布与收录指南

本文档面向插件开发者，介绍如何创建 ZZZOD 插件、配置自动打包，以及如何将插件收录到官方插件中心。

---

## 运作机制简介

ZZZOD 采用“**作者仓库发版 + 官方自动同步**”的方式：

- 你的插件源码、Release 和更新均保留在你自己的 GitHub 仓库中；
- 首次发布时，只需在官方仓库提一次申请；
- **一旦通过收录，后续所有版本更新全自动同步，无需每次重复提申请**。

---

## 第一步：创建插件仓库

推荐直接使用官方模板仓库创建新项目：

👉 **官方模板仓库**：[`OneDragon-Anyone/plugin-template`](https://github.com/OneDragon-Anyone/plugin-template)（点击右上角 **Use this template** -> **Create a new repository**）。

仓库的标准目录结构如下：

```text
你的插件仓库/
├── .github/workflows/
│   └── release.yml          # 自动打包发布工作流（模板已自带）
├── 你的插件ID/               # 插件主目录（需与 plugin.json 中的 id 一致）
│   ├── __init__.py
│   ├── 插件ID_const.py
│   ├── 插件ID_factory.py
│   └── plugin.json          # 插件配置文件
├── README.md
└── LICENSE
```

---

## 第二步：配置插件信息 (`plugin.json`)

在插件目录下创建或修改 `plugin.json`：

```json
{
  "id": "my_plugin",
  "name": "我的插件名称",
  "summary": "插件功能简要介绍（一两句话说明用途）",
  "version": "1.0.0",
  "versionCode": 1,
  "defaultGroup": true,
  "needNotify": false,
  "author": {
    "name": "作者昵称",
    "url": "https://github.com/你的GitHub用户名"
  },
  "homepage": "https://github.com/你的GitHub用户名/你的仓库名",
  "risk": [],
  "compatibility": {
    "minAppVersion": "0.0.0",
    "minCoreApiVersion": 1,
    "python": ">=3.11"
  }
}
```

### 重点字段说明
- **`id`**：插件的唯一英文标识，只能包含小写字母、数字和下划线。
- **`versionCode`**：**整数版本号，每次发布新版必须递增**（例如 1 -> 2 -> 3）。系统以此数字判断是否有新版本。
- **`version`**：给用户看的语义化版本号字符串（如 `1.0.0`）。
- **`risk`**：若插件涉及特殊权限需如实声明（无涉及填空列表 `[]`）：
  - `automation`：包含鼠标键盘按键模拟
  - `process`：读取或操作外部进程
  - `network`：需要联网发送网络请求
  - `filesystem`：读写插件自身目录以外的文件

---

## 第三步：发布 Release

模板仓库已自带 `.github/workflows/release.yml` 自动化打包文件。在本地完成开发后，只需推送一个 Git tag：

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions 会自动打包并在此 tag 对应的 Release 页面下上传名为 `<id>.zip` 的安装包。

---

## 第四步：首次申请收录

当仓库生成了第一个附带 `<id>.zip` 的 Release 后，即可申请收录：

1. **发起申请**：
   - 打开 [plugin-data Issue 页面](https://github.com/OneDragon-Anyone/plugin-data/issues/new/choose)；
   - 标题填写：`[submission] 你的插件名称`；
   - 内容填入：你的 GitHub 插件仓库链接（例如：`https://github.com/your-username/your-plugin`）。
2. **机器人自动核验**：
   - 审核机器人会在 1 分钟内核查包规范并自动创建收录 PR；
   - 若有不合规项，机器人会在 Issue 下回复具体报错原因。修改后直接在 Issue 下回复 `/recheck` 即可触发重新检查。
3. **审核上线**：
   - 维护人员确认无误后合并 PR，插件便正式加入官方商店和下载索引。

---

## 第五步：后续版本更新（全自动）

插件被收录后，后续日常更新**无需再次提交 Issue**：

1. 修改代码并递增 `plugin.json` 中的 `versionCode`（如改为 `2`）；
2. 提交代码并打新 tag 推送（如 `v1.0.1`）；
3. 你的 GitHub Actions 会自动生成新的 Release 附件；
4. 官方构建系统每小时会自动拉取最新版本。如果想立即同步，可在最初的收录 Issue 下回复一条 `/sync` 命令即可触发立即刷新。

---

## 常见注意事项

1. **发新版必须递增 `versionCode`**：若发布了新 tag 但整数版本号没变，系统会自动跳过不更新。
2. **切勿直接覆盖同版本的 zip 附件**：为保障安全，系统已收录的版本会记录文件指纹。如果需要修改任何代码或资源，请发一个新版本号的 Release，切勿在旧 Release 下删除重新上传。
3. **附件命名需一致**：自动打包会生成 `<id>.zip`，如手动上传必须确保文件名与插件 ID 严格一致。
