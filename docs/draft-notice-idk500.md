# idk500 PR 迁移通知草稿

> 用途：两仓拆分（数据仓 plugin-data + 代码仓 plugin-registry）后，在 idk500 的三个旧 PR（#1 已关、#2 开、#3 已合并）下留言说明迁移。发布前按 PR 状态选用对应段落。

## 通用说明（放在开头）

仓库已拆分为两个：

- **plugin-data**：插件数据仓（registry/plugins/*.json、policy、站点发布、Issue 提交都搬到这里）
- **plugin-registry**：代码仓（构建脚本、机器人、可复用工作流，以 `@v1` 标签被数据仓引用）

## 段落 A（对已合并的 PR #3）

你这条 PR 里的插件数据已随仓库拆分迁移到新数据仓 [OneDragon-Anyone/plugin-data](https://github.com/OneDragon-Anyone/plugin-data)，本仓库今后只放构建代码，不再接收插件数据变更。无需任何操作，插件已在新仓正常发布。

## 段落 B（对仍开放的 PR #2）

仓库拆分后，插件数据 PR 现在统一在数据仓 [OneDragon-Anyone/plugin-data](https://github.com/OneDragon-Anyone/plugin-data) 处理。你这条 PR 的内容我们已手工迁移过去（对应新仓 PR #N），这条就不在这里合并了。如后续要改元数据，请去新仓对应 PR 继续。

## 段落 C（对已关闭的 PR #1）

说明同上，插件数据已迁至 [OneDragon-Anyone/plugin-data](https://github.com/OneDragon-Anyone/plugin-data)。如仍希望收录，欢迎按新仓的提交流程重新提交（提交 Issue 时机器人会自动校验）。

---

待办：段落 B 里的"新仓 PR #N"需在数据仓建好对应 PR 后回填。
