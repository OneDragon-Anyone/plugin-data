<script setup lang="ts">
import {
  IconCode,
  IconFile,
  IconLaunch,
  IconSafe,
  IconSend,
  IconTag
} from "@arco-design/web-vue/es/icon";
import { computed, reactive } from "vue";
import { issueUrl } from "@/lib/site";

const form = reactive({
  pluginId: "",
  repoUrl: "",
  summary: "",
  tags: "",
  risk: "filesystem",
  notes: ""
});

const riskOptions = [
  { label: "文件系统", value: "filesystem" },
  { label: "网络访问", value: "network" },
  { label: "账号相关", value: "account" },
  { label: "自动化操作", value: "automation" },
  { label: "OCR", value: "ocr" },
  { label: "YOLO", value: "yolo" }
];

const title = computed(() => `[Submission] ${form.pluginId || "plugin_id"}`);
const body = computed(() =>
  [
    "## Plugin Submission",
    "",
    `- Plugin ID: ${form.pluginId}`,
    `- Repository: ${form.repoUrl}`,
    `- Summary: ${form.summary}`,
    `- Tags: ${form.tags}`,
    `- Risk: ${form.risk}`,
    "",
    "## Notes",
    "",
    form.notes || "No extra notes."
  ].join("\n")
);

const generatedUrl = computed(() => issueUrl(title.value, body.value));
const canSubmit = computed(() => {
  const idOk = /^[a-z][a-z0-9_]*$/.test(form.pluginId);
  const repoOk = /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(form.repoUrl);
  return idOk && repoOk && form.summary.trim().length > 8;
});
</script>

<template>
  <a-card class="submission-card">
    <a-form :model="form" layout="vertical" class="modern-form">
      <a-form-item field="pluginId">
        <template #label>
          <span class="form-label-custom">
            <IconCode class="text-[var(--registry-accent)] icon-tweak" />
            插件唯一标识 (ID)
          </span>
        </template>
        <a-input v-model="form.pluginId" placeholder="例如: my_awesome_plugin" />
      </a-form-item>

      <a-form-item field="repoUrl">
        <template #label>
          <span class="form-label-custom">
            <IconLaunch class="text-[var(--registry-accent)] icon-tweak" />
            GitHub 源码仓库
          </span>
        </template>
        <a-input v-model="form.repoUrl" placeholder="https://github.com/author/plugin-repo" />
      </a-form-item>

      <a-form-item field="summary">
        <template #label>
          <span class="form-label-custom">
            <IconFile class="text-[var(--registry-accent)] icon-tweak" />
            一句话摘要
          </span>
        </template>
        <a-input v-model="form.summary" placeholder="简要阐述插件的核心用途..." />
      </a-form-item>

      <a-grid :cols="2" :col-gap="16">
        <a-grid-item>
          <a-form-item field="tags">
            <template #label>
              <span class="form-label-custom">
                <IconTag class="text-[var(--registry-accent)] icon-tweak" />
                搜索标签
              </span>
            </template>
            <a-input v-model="form.tags" placeholder="例如: tool, battle, daily" />
          </a-form-item>
        </a-grid-item>
        <a-grid-item>
          <a-form-item field="risk">
            <template #label>
              <span class="form-label-custom">
                <IconSafe class="text-[var(--registry-accent)] icon-tweak" />
                核心系统风险
              </span>
            </template>
            <a-select v-model="form.risk" :options="riskOptions" />
          </a-form-item>
        </a-grid-item>
      </a-grid>

      <a-form-item field="notes">
        <template #label>
          <span class="form-label-custom">
            <IconFile class="text-[var(--registry-accent)] icon-tweak" />
            其它备注 (可选)
          </span>
        </template>
        <a-textarea v-model="form.notes" placeholder="如有其它特殊说明或补充，可在此填写..." :auto-size="{ minRows: 3, maxRows: 6 }" />
      </a-form-item>

      <!-- 精美提示条 -->
      <div class="issue-preview-container mb-5">
        <span class="text-[10px] font-bold uppercase tracking-wider text-[var(--registry-muted)] block mb-1">Issue 预览标题</span>
        <div class="issue-preview-box">
          {{ title }}
        </div>
      </div>

      <a-button :href="generatedUrl" target="_blank" type="primary" :disabled="!canSubmit" long class="submit-action-btn">
        <template #icon><IconSend /></template>
        生成并向 GitHub 提交插件
      </a-button>
    </a-form>
  </a-card>
</template>

<style scoped>
.form-label-custom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--registry-text);
}

.issue-preview-container {
  border-radius: 12px;
  padding: 2px;
}

.issue-preview-box {
  background: color-mix(in srgb, var(--registry-border) 40%, transparent);
  border: 1px dashed var(--registry-border);
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-family: "JetBrains Mono", monospace;
  color: var(--registry-text);
  word-break: break-all;
}

.submit-action-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
}

.icon-tweak {
  font-size: 13px;
}

:deep(.arco-textarea) {
  border-radius: 14px !important;
  background-color: color-mix(in srgb, var(--registry-surface) 60%, transparent) !important;
  border: 1px solid var(--registry-border) !important;
  padding: 12px 16px !important;
  backdrop-filter: blur(8px);
  color: var(--registry-text) !important;
  transition: all 0.25s ease !important;
}

:deep(.arco-textarea):hover {
  border-color: color-mix(in srgb, var(--registry-accent) 40%, transparent) !important;
  background-color: var(--registry-surface) !important;
}

:deep(.arco-textarea):focus-within {
  border-color: var(--registry-accent) !important;
  background-color: var(--registry-surface) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--registry-accent) 12%, transparent) !important;
}
</style>
