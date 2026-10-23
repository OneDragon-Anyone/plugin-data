<script setup lang="ts">
import {
  IconCheckCircle,
  IconExclamationCircle,
  IconLaunch,
  IconLink,
  IconSafe,
  IconSearch,
  IconSend,
  IconTag
} from "@arco-design/web-vue/es/icon";
import { computed, reactive } from "vue";
import { riskLabels } from "@/lib/risk";
import { issueFormUrl, issueUrl, siteConfig } from "@/lib/site";
import { RISK_TAGS, type RiskTag } from "@/lib/types";

const ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const TAG_PATTERN = /^[a-z0-9][a-z0-9-]{0,23}$/;
const REPO_PATTERN = /^https:\/\/github\.com\/([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+?)(?:\.git)?\/?$/;

interface ManifestPreview {
  id: string;
  name: string;
  summary: string;
  version: string;
  versionCode: number | null;
  risk: string[];
}

interface ReleasePreview {
  tag: string;
  prerelease: boolean;
  size: number;
}

type Preview = {
  status: "idle" | "loading" | "ready";
  errors: string[];
  notes: string[];
  source: "jsdelivr" | "github" | "";
  manifest: ManifestPreview | null;
  release: ReleasePreview | null;
};

const form = reactive({
  repoUrl: "",
  tags: "",
  notes: ""
});
const confirms = reactive({ maintained: false, released: false, responsibility: false });

const preview = reactive<Preview>({
  status: "idle",
  errors: [],
  notes: [],
  source: "",
  manifest: null,
  release: null
});

const parsedTags = computed(() => [
  ...new Set(
    form.tags
      .split(/[,，\s]+/)
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
  )
]);
const tagError = computed(() => {
  if (parsedTags.value.length > 8) return "标签最多 8 个";
  return parsedTags.value.some((tag) => !TAG_PATTERN.test(tag)) ? "标签只能包含小写字母、数字和 -" : "";
});
const allConfirmed = computed(() => Object.values(confirms).every(Boolean));
const canSubmit = computed(
  () => preview.status === "ready" && preview.errors.length === 0 && allConfirmed.value && !tagError.value
);

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw Object.assign(new Error(`${response.status}`), { status: response.status });
  return response.json();
}

/** jsDelivr 文件列表（无速率限制、支持 CORS），按常见默认分支依次尝试。 */
async function listFilesViaJsDelivr(owner: string, name: string): Promise<{ ref: string; files: string[] } | null> {
  for (const ref of ["main", "master"]) {
    try {
      const data = (await fetchJson(
        `https://data.jsdelivr.com/v1/packages/gh/${owner}/${name}@${ref}?structure=flat`
      )) as { files?: { name: string }[] };
      if (Array.isArray(data.files)) return { ref, files: data.files.map((file) => file.name.replace(/^\//, "")) };
    } catch {
      // 尝试下一个分支名
    }
  }
  return null;
}

/** GitHub 回退路径：仓库元数据 + 根目录子目录逐一探测，与提交机器人的做法一致。 */
async function listFilesViaGithub(
  owner: string,
  name: string,
  errors: string[]
): Promise<{ ref: string; files: string[] } | null> {
  const repo = (await fetchJson(`https://api.github.com/repos/${owner}/${name}`)) as {
    private?: boolean;
    default_branch: string;
  };
  if (repo.private) {
    errors.push("仓库不是公开仓库。");
    return null;
  }
  const ref = repo.default_branch;
  const root = (await fetchJson(`https://api.github.com/repos/${owner}/${name}/contents/?ref=${ref}`)) as {
    name: string;
    type: string;
  }[];
  const files: string[] = [];
  for (const item of root) {
    if (item.type === "file") files.push(item.name);
    else if (item.type === "dir") files.push(`${item.name}/`);
  }
  return { ref, files };
}

async function loadManifest(
  owner: string,
  name: string,
  ref: string,
  path: string,
  viaJsDelivr: boolean,
  notes: string[]
): Promise<Record<string, unknown>> {
  if (viaJsDelivr) {
    try {
      const response = await fetch(`https://cdn.jsdelivr.net/gh/${owner}/${name}@${ref}/${path}`, {
        signal: AbortSignal.timeout(15_000)
      });
      if (response.ok) return JSON.parse(await response.text()) as Record<string, unknown>;
    } catch {
      // cdn.jsdelivr.net 不可达时走 GitHub 回退
    }
    notes.push("jsDelivr CDN 读取 `plugin.json` 失败，已改用 GitHub API。");
  }
  const file = (await fetchJson(
    `https://api.github.com/repos/${owner}/${name}/contents/${path}?ref=${ref}`
  )) as { content: string };
  const bytes = Uint8Array.from(atob(file.content.replace(/\s/g, "")), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
}

async function loadRelease(owner: string, name: string, id: string): Promise<ReleasePreview | "unreachable" | null> {
  let releases: { draft: boolean; prerelease: boolean; tag_name: string; assets: { name: string; size: number }[] }[];
  try {
    releases = (await fetchJson(`https://api.github.com/repos/${owner}/${name}/releases?per_page=20`)) as typeof releases;
  } catch (error) {
    if ((error as { status?: number }).status === 403) return "unreachable";
    throw error;
  }
  const release = releases.find(
    (item) => !item.draft && item.assets.some((asset) => asset.name === `${id}.zip`)
  );
  if (!release) return null;
  return {
    tag: release.tag_name,
    prerelease: release.prerelease,
    size: release.assets.find((asset) => asset.name === `${id}.zip`)!.size
  };
}

function toManifestPreview(data: Record<string, unknown>, errors: string[]): ManifestPreview {
  const id = String(data.id ?? "");
  if (!ID_PATTERN.test(id)) errors.push(`插件 ID \`${id || "(缺失)"}\` 不符合 \`^[a-z][a-z0-9_]*$\`。`);
  const versionCode = data.versionCode;
  if (typeof versionCode !== "number" || !Number.isInteger(versionCode) || versionCode <= 0) {
    errors.push("`versionCode` 必须是正整数。");
  }
  for (const field of ["name", "summary", "version"] as const) {
    if (typeof data[field] !== "string" || !(data[field] as string).trim()) errors.push(`\`plugin.json.${field}\` 不能为空。`);
  }
  const risk = Array.isArray(data.risk) ? data.risk.map(String) : [];
  if (!Array.isArray(data.risk) || risk.some((item) => !(RISK_TAGS as readonly string[]).includes(item))) {
    errors.push(`\`risk\` 中包含未知标签：${risk.join(", ") || "(空)"}。`);
  }
  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    summary: typeof data.summary === "string" ? data.summary : "",
    version: typeof data.version === "string" ? data.version : "",
    versionCode: typeof versionCode === "number" ? versionCode : null,
    risk
  };
}

function jsonEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keysA = Object.keys(left);
  const keysB = Object.keys(right);
  return keysA.length === keysB.length && keysA.every((key) => jsonEqual(left[key], right[key]));
}

async function runPreview(): Promise<void> {
  preview.status = "loading";
  preview.errors = [];
  preview.notes = [];
  preview.source = "";
  preview.manifest = null;
  preview.release = null;

  const errors: string[] = [];
  const notes: string[] = [];
  try {
    const match = REPO_PATTERN.exec(form.repoUrl.trim());
    if (!match) {
      preview.errors = ["仓库地址需要是 `https://github.com/<owner>/<repo>` 格式。"];
      preview.status = "idle";
      return;
    }
    const [, owner, name] = match;

    let listing = await listFilesViaJsDelivr(owner, name);
    let viaJsDelivr = true;
    if (!listing) {
      listing = await listFilesViaGithub(owner, name, errors);
      viaJsDelivr = false;
      notes.push("jsDelivr 读取失败，已回退到 GitHub API（匿名请求按 IP 每小时限 60 次）。");
    }
    if (!listing) {
      preview.errors = errors.length > 0 ? errors : [`仓库 \`${owner}/${name}\` 不存在或无法读取。`];
      preview.notes = notes;
      preview.status = "idle";
      return;
    }
    const { ref, files } = listing;

    const dirs = new Set(files.filter((file) => file.includes("/")).map((file) => file.split("/")[0]));
    const manifests = files.filter((file) => /^[^/]+\/plugin\.json$/.test(file));
    const hasRootManifest = files.includes("plugin.json");
    if (manifests.length !== 1) {
      errors.push(
        `仓库根目录下应恰好有一个子目录包含 \`plugin.json\`，实际找到 ${manifests.length} 个（子目录：${[...dirs].join(", ") || "无"}）。`
      );
    }
    if (errors.length > 0 || manifests.length !== 1) {
      preview.errors = errors;
      preview.notes = notes;
      preview.status = "idle";
      return;
    }

    const rawManifest = await loadManifest(owner, name, ref, manifests[0], viaJsDelivr, notes);
    // 旧模板会在根目录留一份同步的 plugin.json：与包内一致时容忍（提示删除），不一致才失败
    if (hasRootManifest) {
      try {
        const rootManifest = await loadManifest(owner, name, ref, "plugin.json", viaJsDelivr, notes);
        if (jsonEqual(rootManifest, rawManifest)) {
          notes.push("仓库根目录的 `plugin.json` 是旧模板的同步副本，与包内一致；建议删除，不会被读取。");
        } else {
          errors.push("仓库根目录的 `plugin.json` 与插件包内的不一致，请删除根目录副本（参见模板 README）。");
        }
      } catch {
        errors.push("仓库根目录的 `plugin.json` 无法读取，请删除根目录副本（参见模板 README）。");
      }
    }
    const manifest = toManifestPreview(rawManifest, errors);
    preview.manifest = manifest;
    preview.source = viaJsDelivr ? "jsdelivr" : "github";
    if (errors.length > 0) {
      preview.errors = errors;
      preview.notes = notes;
      preview.status = "idle";
      return;
    }

    const release = await loadRelease(owner, name, manifest.id);
    if (release === "unreachable") {
      notes.push("GitHub API 已限流，无法检查 Release 附件；提交后机器人会完成完整校验。");
    } else if (release === null) {
      errors.push(`未找到带 \`${manifest.id}.zip\` 附件的 Release，请按模板推送 \`v<version>\` tag 发布。`);
    } else {
      preview.release = release;
    }
    preview.errors = errors;
    preview.notes = notes;
    preview.status = "ready";
  } catch (error) {
    preview.errors = [...errors, `读取仓库时出错：${error instanceof Error ? error.message : String(error)}`];
    preview.notes = notes;
    preview.status = "idle";
  }
}

const issueTitle = computed(() => `[submission] ${form.repoUrl.trim().replace(/\.git$/, "").replace(/\/$/, "")}`);

const issueBody = computed(() => {
  const manifest = preview.manifest;
  const lines = ["### 插件提交", "", `仓库地址: ${form.repoUrl.trim()}`];
  if (manifest) {
    lines.push(
      `插件 ID: ${manifest.id}`,
      `名称: ${manifest.name}`,
      `版本: v${manifest.version}（versionCode ${manifest.versionCode ?? "?"}）`
    );
  }
  if (parsedTags.value.length > 0) lines.push("", `tags: ${parsedTags.value.join(", ")}`);
  lines.push("", "### 备注", "", form.notes.trim() || "无", "", "> 由插件仓库网站提交页生成。提交后机器人会自动校验仓库所有权与 Release，通过后创建收录 PR。");
  return lines.join("\n");
});

const submitUrl = computed(() => issueUrl(issueTitle.value, issueBody.value));
const transferUrl = issueFormUrl("2-transfer.yml");
const reportUrl = issueFormUrl("3-report.yml");
const appealUrl = issueFormUrl("4-appeal.yml");
const templateUrl = `https://github.com/${siteConfig.templateRepo}`;

function riskText(values: string[]): string {
  return values.map((value) => riskLabels[value as RiskTag] ?? value).join("、") || "无";
}
</script>

<template>
  <div class="submission-flow">
    <a-card class="submission-card">
      <div class="flow-step">
        <span class="flow-step-badge">1</span>
        <div class="form-label-custom">
          <IconLaunch class="text-[var(--registry-accent)] icon-tweak" />
          GitHub 仓库地址
        </div>
      </div>
      <a-input
        v-model="form.repoUrl"
        size="large"
        placeholder="https://github.com/your-name/your-plugin"
        allow-clear
        @press-enter="runPreview"
      >
        <template #append>
          <a-button :loading="preview.status === 'loading'" @click="runPreview">
            <template #icon><IconSearch /></template>
            预读仓库
          </a-button>
        </template>
      </a-input>
      <p class="field-hint">
        预读通过 jsDelivr 获取仓库文件列表并定位插件包目录内的 <code>plugin.json</code>，不会消耗 GitHub API 配额；Release
        检查需要访问 GitHub API。
      </p>

      <a-alert v-if="preview.status === 'loading'" class="mt-4" type="info">正在读取仓库…</a-alert>

      <template v-if="preview.status === 'idle' && (preview.errors.length > 0 || preview.notes.length > 0)">
        <a-alert v-for="error in preview.errors" :key="error" class="mt-2" type="error" show-icon>
          <span class="preview-message">{{ error }}</span>
        </a-alert>
        <a-alert v-for="note in preview.notes" :key="note" class="mt-2" type="warning" show-icon>
          <span class="preview-message">{{ note }}</span>
        </a-alert>
        <a-alert class="mt-2" type="info">
          修复后重新点「预读仓库」。完整发布教程见
          <a :href="templateUrl" target="_blank" rel="noreferrer">插件模板</a>。
        </a-alert>
      </template>

      <template v-if="preview.status === 'ready'">
        <a-alert v-if="preview.errors.length > 0" class="mt-2" type="error" show-icon>
          <span v-for="error in preview.errors" :key="error" class="preview-message block">{{ error }}</span>
        </a-alert>
        <a-alert v-for="note in preview.notes" :key="note" class="mt-2" type="warning" show-icon>
          <span class="preview-message">{{ note }}</span>
        </a-alert>

        <div class="preview-table">
          <div class="preview-row">
            <span class="preview-label">插件 ID</span>
            <code>{{ preview.manifest?.id }}</code>
          </div>
          <div class="preview-row">
            <span class="preview-label">名称</span>
            <span>{{ preview.manifest?.name }}</span>
          </div>
          <div class="preview-row">
            <span class="preview-label">简介</span>
            <span>{{ preview.manifest?.summary }}</span>
          </div>
          <div class="preview-row">
            <span class="preview-label">版本</span>
            <span>
              v{{ preview.manifest?.version }}
              <span class="preview-muted">（versionCode {{ preview.manifest?.versionCode }}）</span>
            </span>
          </div>
          <div class="preview-row">
            <span class="preview-label">风险标签</span>
            <span>{{ riskText(preview.manifest?.risk ?? []) }}</span>
          </div>
          <div class="preview-row">
            <span class="preview-label">Release</span>
            <span v-if="preview.release" class="flex items-center gap-2">
              <IconCheckCircle class="text-green-500" />
              <code>{{ preview.release.tag }}</code>
              <span class="preview-muted">
                {{ preview.release.prerelease ? "beta 通道" : "stable 通道" }}
              </span>
            </span>
            <span v-else-if="preview.errors.length === 0" class="preview-muted">未能检查（见上方提示）</span>
          </div>
          <div class="preview-row">
            <span class="preview-label">读取来源</span>
            <span class="preview-muted">{{ preview.source === "jsdelivr" ? "jsDelivr" : "GitHub API（回退）" }}</span>
          </div>
        </div>
      </template>
    </a-card>

    <a-card class="submission-card">
      <div class="flow-step">
        <span class="flow-step-badge">2</span>
        <div class="form-label-custom">
          <IconTag class="text-[var(--registry-accent)] icon-tweak" />
          标签与备注（可选）
        </div>
      </div>
      <a-input v-model="form.tags" placeholder="例如: daily, utility（逗号分隔，最多 8 个）">
        <template #prefix><IconTag class="icon-tweak" /></template>
      </a-input>
      <p v-if="tagError" class="field-hint error">{{ tagError }}</p>
      <a-textarea
        v-model="form.notes"
        class="mt-3"
        placeholder="补充说明，例如插件适用版本、使用前提等"
        :auto-size="{ minRows: 3, maxRows: 6 }"
      />
    </a-card>

    <a-card class="submission-card">
      <div class="flow-step">
        <span class="flow-step-badge">3</span>
        <div class="form-label-custom">
          <IconSafe class="text-[var(--registry-accent)] icon-tweak" />
          确认事项
        </div>
      </div>
      <div class="confirm-list">
        <a-checkbox v-model="confirms.maintained">插件由我本人维护，我是仓库所有者。</a-checkbox>
        <a-checkbox v-model="confirms.released">
          已按插件模板发布过带 <code>&lt;插件ID&gt;.zip</code> 附件的 Release。
        </a-checkbox>
        <a-checkbox v-model="confirms.responsibility">
          我理解插件脚本会在用户本地运行，我对插件的行为和后果承担责任。
        </a-checkbox>
      </div>

      <a-button :href="canSubmit ? submitUrl : undefined" target="_blank" type="primary" long :disabled="!canSubmit">
        <template #icon><IconSend /></template>
        提交插件（打开预填好的 Issue）
      </a-button>
      <p class="field-hint">
        <IconExclamationCircle class="icon-tweak align-[-2px]" />
        <template v-if="preview.status !== 'ready'">先预读仓库并确认预览内容。</template>
        <template v-else-if="preview.errors.length > 0">预读发现问题，修复后才能提交。</template>
        <template v-else-if="!allConfirmed">勾选全部确认事项后可提交。</template>
        <template v-else>提交后机器人在 Issue 中回复校验结果，全程无需手动开 PR。</template>
      </p>
    </a-card>

    <a-card class="submission-card">
      <div class="form-label-custom">
        <IconLink class="text-[var(--registry-accent)] icon-tweak" />
        其他入口
      </div>
      <div class="entry-buttons">
        <a-button :href="transferUrl" target="_blank">转移插件 [transfer]</a-button>
        <a-button :href="reportUrl" target="_blank" status="danger">举报插件 [report]</a-button>
        <a-button :href="appealUrl" target="_blank">申诉 [appeal]</a-button>
        <a-button :href="templateUrl" target="_blank" type="outline">插件模板与发布教程</a-button>
      </div>
    </a-card>
  </div>
</template>

<style scoped>
.submission-flow {
  display: grid;
  gap: 1.25rem;
}

.flow-step {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.flow-step-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--registry-accent) 20%, transparent);
  color: var(--registry-accent);
  font-size: 12px;
  font-weight: 700;
}

.form-label-custom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--registry-text);
}

.field-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--registry-muted);
}

.field-hint.error {
  color: rgb(225, 100, 100);
}

.preview-message {
  font-size: 13px;
  word-break: break-all;
}

.preview-table {
  margin-top: 14px;
  border: 1px dashed var(--registry-border);
  border-radius: 10px;
  padding: 6px 14px;
  display: grid;
  gap: 4px;
}

.preview-row {
  display: flex;
  gap: 12px;
  padding: 6px 0;
  font-size: 13px;
  color: var(--registry-text);
}

.preview-row + .preview-row {
  border-top: 1px solid color-mix(in srgb, var(--registry-border) 40%, transparent);
}

.preview-label {
  flex: 0 0 84px;
  color: var(--registry-muted);
}

.preview-muted {
  color: var(--registry-muted);
}

.confirm-list {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
  font-size: 13px;
}

.entry-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.icon-tweak {
  font-size: 13px;
}
</style>
