<script setup lang="ts">
import {
  IconDownload,
  IconExclamationCircle,
  IconGithub,
  IconStar,
  IconTag,
  IconTool,
  IconUser
} from "@arco-design/web-vue/es/icon";
import { computed } from "vue";
import {
  coverUrl,
  formatBytes,
  formatCount,
  formatDate,
  primaryRelease,
  riskColor,
  statusColor,
  statusLabels
} from "@/lib/display";
import { riskDescriptions, riskLabels } from "@/lib/risk";
import { issueFormUrl } from "@/lib/site";
import type { PluginEntry, PluginRelease } from "@/lib/types";

const props = defineProps<{
  plugin: PluginEntry;
}>();

const release = computed(() => primaryRelease(props.plugin));
const downloadable = computed(() => props.plugin.status !== "suspended");
const reportUrl = computed(() => issueFormUrl("3-report.yml", { title: `[report] ${props.plugin.id}`, plugin_id: props.plugin.id }));
const appealUrl = computed(() => issueFormUrl("4-appeal.yml", { title: `[appeal] ${props.plugin.id}`, target: props.plugin.id }));

function releaseUrl(item: PluginRelease): string {
  return `${props.plugin.repo}/releases/tag/${encodeURIComponent(item.tag)}`;
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
    <section class="space-y-6 min-w-0">
      <a-card class="detail-header-card">
        <img v-if="plugin.cover" :src="coverUrl(plugin)" :alt="plugin.name" class="detail-cover" />
        <div class="flex flex-wrap items-center gap-2">
          <a-tag v-if="plugin.pinned" color="cyan" size="small">推荐</a-tag>
          <a-tag :color="statusColor(plugin.status)" size="small">{{ statusLabels[plugin.status] }}</a-tag>
          <a-tag v-if="plugin.stale" color="red" size="small">仓库失联</a-tag>
          <a-tag v-for="tag in plugin.tags" :key="tag" size="small"># {{ tag }}</a-tag>
        </div>
        <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-[var(--registry-text)]">{{ plugin.name }}</h1>
        <p class="mono mt-1 text-xs font-semibold text-[var(--registry-muted)]">ID: {{ plugin.id }}</p>
        <p class="mt-4 text-sm leading-relaxed text-[var(--registry-muted)] font-medium">{{ plugin.summary }}</p>
      </a-card>

      <a-alert v-if="plugin.status === 'suspended'" type="error" title="已暂停分发">
        该插件因安全或合规问题被暂停，网站不再提供下载。作者可通过申诉 Issue 申请恢复。
      </a-alert>
      <a-alert v-else-if="plugin.status === 'deprecated'" type="warning" title="已弃用">
        作者或维护者已停止推荐该插件，可能不再更新。
      </a-alert>
      <a-alert v-if="plugin.stale" type="warning" title="源仓库无法访问">
        源仓库已连续多日无法访问，以下数据来自最后一次成功同步。
      </a-alert>
      <a-alert v-if="plugin.warnings.length > 0" type="info" title="同步提示">
        <ul class="warning-list">
          <li v-for="(item, index) in plugin.warnings" :key="index">
            <span class="mono text-[11px]">{{ item.code }}</span> {{ item.message }}
          </li>
        </ul>
      </a-alert>

      <a-tabs default-active-key="readme" class="detail-tabs">
        <a-tab-pane key="readme" title="说明文档">
          <a-card class="mt-3">
            <div v-if="plugin.readmeHtml" class="readme-content" v-html="plugin.readmeHtml" />
            <div v-else class="empty-hint">仓库没有 README。</div>
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="release" :title="`版本历史 (${plugin.releases.length})`">
          <div class="mt-3 space-y-4">
            <a-card v-for="item in plugin.releases" :key="item.tag">
              <div class="release-head">
                <a :href="releaseUrl(item)" target="_blank" class="release-version">v{{ item.version }}</a>
                <a-tag v-if="item === plugin.latest" color="green" size="small">最新稳定版</a-tag>
                <a-tag v-if="item.prerelease" color="purple" size="small">测试版</a-tag>
                <a-tag v-if="item.immutable" color="arcoblue" size="small">不可变</a-tag>
                <span class="release-date">{{ formatDate(item.publishedAt) }}</span>
                <a-button v-if="downloadable" :href="item.downloadUrl" size="mini" class="release-download">
                  <template #icon><IconDownload /></template>
                  {{ formatBytes(item.size) }}
                </a-button>
              </div>
              <div v-if="item.changelogHtml" class="readme-content mt-3" v-html="item.changelogHtml" />
              <div class="release-meta mono">
                <span>versionCode {{ item.versionCode }}</span>
                <span :title="item.commit">commit {{ item.commit.slice(0, 7) }}</span>
                <span :title="item.sha256">sha256 {{ item.sha256.slice(0, 16) }}…</span>
              </div>
            </a-card>
          </div>
        </a-tab-pane>
        <a-tab-pane key="risk" title="风险声明">
          <a-card class="mt-3">
            <div v-if="plugin.risk.length > 0" class="grid gap-4 md:grid-cols-2">
              <div v-for="item in plugin.risk" :key="item" class="rounded-xl border border-[var(--registry-border)] p-4 bg-slate-500/5">
                <div class="flex items-center gap-2">
                  <IconExclamationCircle class="text-amber-500 icon-lead" />
                  <a-tag :color="riskColor(item)" size="small">{{ riskLabels[item] }}</a-tag>
                </div>
                <p class="mt-3 text-xs leading-relaxed text-[var(--registry-muted)] font-medium">{{ riskDescriptions[item] }}</p>
              </div>
            </div>
            <div v-else class="empty-hint">作者未声明风险标签。</div>
            <p class="mt-4 text-xs text-[var(--registry-muted)]">
              风险标签由作者在 plugin.json 声明，维护者审核时可追加。插件代码在本机以完整权限运行，请只安装信任的插件。
            </p>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </section>

    <aside class="space-y-6">
      <a-card title="规格与数据">
        <div class="aside-section">
          <h3 class="aside-section-title">
            <IconTag class="text-[var(--registry-accent)] icon-lead" />
            版本
          </h3>
          <div class="aside-grid">
            <div class="aside-item">
              <span class="aside-label">稳定版</span>
              <span class="aside-value font-semibold text-[var(--registry-accent)]">{{ plugin.latest ? `v${plugin.latest.version}` : "暂无" }}</span>
            </div>
            <div v-if="plugin.latestBeta" class="aside-item">
              <span class="aside-label">测试版</span>
              <span class="aside-value font-semibold">v{{ plugin.latestBeta.version }}</span>
            </div>
            <div v-if="release" class="aside-item">
              <span class="aside-label">包大小</span>
              <span class="aside-value">{{ formatBytes(release.size) }}</span>
            </div>
            <div v-if="release" class="aside-item">
              <span class="aside-label">SHA256</span>
              <span class="aside-value mono text-[10px]" :title="release.sha256">{{ release.sha256.slice(0, 16) }}…</span>
            </div>
            <div class="aside-item">
              <span class="aside-label">下载 / Stars</span>
              <span class="aside-value flex items-center gap-2">
                <span class="flex items-center gap-1"><IconDownload />{{ formatCount(plugin.downloads) }}</span>
                <span class="flex items-center gap-1"><IconStar class="text-amber-500" />{{ formatCount(plugin.stars) }}</span>
              </span>
            </div>
            <div class="aside-item">
              <span class="aside-label">更新时间</span>
              <span class="aside-value">{{ formatDate(plugin.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <div class="aside-section mt-6 pt-5 border-t border-[var(--registry-border)]">
          <h3 class="aside-section-title">
            <IconTool class="text-[var(--registry-accent)] icon-lead" />
            兼容性
          </h3>
          <div class="aside-grid">
            <div class="aside-item">
              <span class="aside-label">主程序</span>
              <span class="aside-value font-semibold">&gt;= {{ plugin.compatibility.minAppVersion }}</span>
            </div>
            <div class="aside-item">
              <span class="aside-label">Core API</span>
              <span class="aside-value font-semibold">&gt;= {{ plugin.compatibility.minCoreApiVersion }}</span>
            </div>
            <div v-if="plugin.compatibility.python" class="aside-item">
              <span class="aside-label">Python</span>
              <span class="aside-value font-medium">{{ plugin.compatibility.python }}</span>
            </div>
            <div class="aside-item">
              <span class="aside-label">设置页</span>
              <span class="aside-value">{{ plugin.capabilities.hasAppSetting ? "有" : "无" }}</span>
            </div>
          </div>
        </div>

        <div class="aside-section mt-6 pt-5 border-t border-[var(--registry-border)]">
          <h3 class="aside-section-title">
            <IconUser class="text-[var(--registry-accent)] icon-lead" />
            作者
          </h3>
          <div class="aside-grid">
            <div class="aside-item">
              <span class="aside-label">维护者</span>
              <span class="aside-value font-semibold">
                <a v-if="plugin.author.url" :href="plugin.author.url" target="_blank" rel="noopener noreferrer" class="hover:underline">@{{ plugin.author.name }}</a>
                <template v-else>@{{ plugin.author.name }}</template>
              </span>
            </div>
          </div>
        </div>

        <div class="mt-8 space-y-3">
          <a-button v-if="release && downloadable" :href="release.downloadUrl" type="primary" long class="action-btn">
            <template #icon><IconDownload /></template>
            下载 v{{ release.version }}
          </a-button>
          <a-button :href="plugin.repo" target="_blank" long class="action-btn">
            <template #icon><IconGithub /></template>
            源码仓库
          </a-button>
          <div class="flex justify-center gap-4 pt-1 text-xs">
            <a :href="reportUrl" target="_blank" class="text-[var(--registry-muted)] hover:text-red-500">举报问题</a>
            <a :href="appealUrl" target="_blank" class="text-[var(--registry-muted)] hover:text-[var(--registry-accent)]">申诉</a>
          </div>
        </div>
      </a-card>
    </aside>
  </div>
</template>

<style scoped>
.detail-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 14px;
  margin-bottom: 16px;
}

.warning-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
}

.empty-hint {
  padding: 32px 0;
  text-align: center;
  font-size: 13px;
  color: var(--registry-muted);
}

.release-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.release-version {
  font-size: 16px;
  font-weight: 800;
  color: var(--registry-text);
}

.release-date {
  font-size: 12px;
  color: var(--registry-muted);
}

.release-download {
  margin-left: auto;
}

.release-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 12px;
  font-size: 11px;
  color: var(--registry-muted);
}

.aside-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0.04em;
  margin: 0 0 12px 0;
  color: var(--registry-text);
}

.aside-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.aside-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.aside-label {
  color: var(--registry-muted);
  font-weight: 500;
}

.aside-value {
  color: var(--registry-text);
  text-align: right;
}

.action-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px !important;
}

.icon-lead {
  font-size: 14px;
}
</style>
