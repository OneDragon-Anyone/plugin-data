# Plugin Registry 仓库维护指南

本文档供维护插件注册表仓库时参考。

---

## 1. 运行机制

本仓库为静态数据中心，不运行服务器后端，所有更新由 GitHub Actions 处理：

1. **作者发版**：插件作者在自己的仓库打 tag 发 Release（包含 `<id>.zip`）。
2. **提交审核**：作者在 Registry 提 Issue，机器人自动核验包结构并提 PR；维护者确认后合并 PR。
3. **数据抓取**：定时任务（每 6 小时）抓取所有已收录插件的最新 Release，计算 sha256 写入 `lock` 分支并生成静态 API（`/api/v1/`）和网页。
4. **客户端拉取**：客户端直接读取 GitHub Pages 上的静态 JSON 获取插件列表与下载链接。

---

## 2. 常用维护操作

### 2.1 审核新插件 PR
机器人收到合格的提交 Issue 后会自动开 PR：
1. 检查 PR 中的清单（功能说明、权限与风险声明是否如实）。
2. 如需微调标签或风险说明，直接在 PR 的 `registry/plugins/{id}.json` 中修改。
3. 确认无误后点击 Merge。合并后定时任务会自动提取该插件的 Release。

### 2.2 修改或下架插件
修改对应插件的元数据文件 `registry/plugins/{id}.json` 中的 `status` 字段：

- `listed`：正常展示，允许安装与更新（默认）。
- `deprecated`：展示并提示已弃用，允许用户继续使用。
- `hidden`：不出现在列表，仅能通过直链访问。
- `suspended`：紧急下架，列表不展示且禁止客户端安装更新。
- `removed`：完全移除。

修改后合并到 master，下一次构建即生效。

### 2.3 手动录入插件
若无需经过 Issue 机器人（如官方自带插件或存量迁移插件）：
1. 在 `registry/plugins/` 目录下创建 `{id}.json`：
   ```json
   {
     "id": "music_game_26",
     "repo": "OneDragon-Anyone/rhythm_game_v2.6_zzzod_plugin",
     "repoId": 1244891200,
     "tags": ["music-game"],
     "extraRisk": [],
     "status": "listed",
     "pinned": false,
     "review": { "submittedBy": "A-nony-mous" }
   }
   ```
2. `repoId` 为仓库的 GitHub 数字 ID，可在终端通过 `gh api repos/<owner>/<repo> --jq .id` 查询。
3. 提交并合并至 master。

### 2.4 手动触发更新
- 在 GitHub 仓库页面进入 **Actions** -> **Build Registry** -> 点击 **Run workflow**。

---

## 3. 常见情况排查

- **`asset_changed` 警告**：作者在已发 Release 下重新上传了同名 zip 附件。系统以 `lock` 分支首次记录的 sha256 为准，自动忽略被替换的文件。更新代码必须发布新版本号。
- **`version_not_increased` 警告**：作者发版的 `versionCode` 小于或等于上一版本，通知作者递增整数版本号即可。
- **提交机器人未响应**：检查 Issue 标题格式是否为 `[submission] 插件名`，且内容包含有效的 GitHub 仓库链接；在 Actions 页面查看 `submission-bot.yml` 日志。
- **`lock` 分支的作用**：记录所有已收录版本的安全哈希，由 CI 自动维护，切勿手动删除该分支。

---

## 4. 本地测试与命令

在 `plugin-registry` 目录下：

```shell
pnpm registry:check                      # 校验本地 registry 规则
pnpm registry:check --resolve --deep <id> # 联网校验指定插件并下载检查 Release 附件
pnpm registry:build                      # 本地执行全量构建（生成 public/api/v1 与站点）
pnpm dev                                 # 本地启动预览
```
