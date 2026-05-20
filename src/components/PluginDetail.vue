<script setup lang="ts">
import {
  IconDownload,
  IconExclamationCircle,
  IconGithub,
  IconTag,
  IconTool,
  IconUser
} from "@arco-design/web-vue/es/icon";
import { riskDescriptions, riskLabels } from "@/lib/risk";
import type { PluginEntry, RiskTag } from "@/lib/types";

defineProps<{
  plugin: PluginEntry;
}>();

const statusTranslation: Record<string, string> = {
  listed: "已上架",
  deprecated: "已弃用",
  hidden: "已隐藏",
  suspended: "已暂停",
  removed: "已失效"
};

function riskColor(value: RiskTag): string {
  if (value === "automation") return "orange";
  if (value === "account" || value === "process") return "red";
  if (value === "network" || value === "ocr" || value === "yolo") return "blue";
  return "gray";
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
    <!-- 左侧详情与文档区 -->
    <section class="space-y-6">
      <a-card class="detail-header-card">
        <div class="flex flex-wrap items-center gap-2">
          <a-tag v-if="plugin.pinned" color="cyan" size="small">精选推荐</a-tag>
          <a-tag color="green" size="small">{{ statusTranslation[plugin.status] || plugin.status }}</a-tag>
          <a-tag v-for="tag in plugin.tags" :key="tag" size="small"># {{ tag }}</a-tag>
        </div>
        <h1 class="mt-4 text-3xl font-extrabold tracking-tight text-[var(--registry-text)]">{{ plugin.name }}</h1>
        <p class="mono mt-1 text-xs font-semibold text-[var(--registry-muted)]">ID: {{ plugin.id }}</p>
        <p class="mt-4 text-sm leading-relaxed text-[var(--registry-muted)] font-medium">{{ plugin.summary }}</p>
      </a-card>

      <!-- 圆润毛玻璃选项卡 -->
      <a-tabs default-active-key="readme" class="detail-tabs">
        <a-tab-pane key="readme" title="📄 说明文档">
          <a-card class="mt-3">
            <div class="readme-content" v-html="plugin.readmeHtml" />
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="release" title="🚀 更新日志">
          <a-card class="mt-3">
            <div class="readme-content" v-html="plugin.latest.changelogHtml" />
          </a-card>
        </a-tab-pane>
        <a-tab-pane key="risk" title="⚠️ 安全风险">
          <a-card class="mt-3">
            <div v-if="plugin.risk && plugin.risk.length > 0" class="grid gap-4 md:grid-cols-2">
              <div v-for="item in plugin.risk" :key="item" class="rounded-xl border border-[var(--registry-border)] p-4 bg-slate-500/5">
                <div class="flex items-center gap-2">
                  <IconExclamationCircle class="text-amber-500 icon-lead" />
                  <a-tag :color="riskColor(item)" size="small">{{ riskLabels[item] }}</a-tag>
                </div>
                <p class="mt-3 text-xs leading-relaxed text-[var(--registry-muted)] font-medium">{{ riskDescriptions[item] }}</p>
              </div>
            </div>
            <div v-else class="text-center py-8 text-sm text-[var(--registry-muted)]">
              🛡️ 该插件无已知高危系统权限访问，可放心安装。
            </div>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </section>

    <!-- 右侧高度整合的现代规格属性面板 -->
    <aside class="space-y-6">
      <a-card title="⚙️ 规格与数据面板">
        <!-- 版本与构建组 -->
        <div class="aside-section">
          <h3 class="aside-section-title">
            <IconTag class="text-[var(--registry-accent)] icon-lead" /> 
            版本与构建
          </h3>
          <div class="aside-grid">
            <div class="aside-item">
              <span class="aside-label">最新版本</span>
              <span class="aside-value font-semibold text-[var(--registry-accent)]">v{{ plugin.latest.version }}</span>
            </div>
            <div class="aside-item">
              <span class="aside-label">构建代码</span>
              <span class="aside-value mono text-xs">{{ plugin.latest.versionCode }}</span>
            </div>
            <div class="aside-item">
              <span class="aside-label">Git Tag</span>
              <span class="aside-value mono text-xs">{{ plugin.latest.tag }}</span>
            </div>
            <div class="aside-item">
              <span class="aside-label">SHA256</span>
              <span class="aside-value mono text-[10px] break-all max-w-[200px] text-right">{{ plugin.latest.sha256.substring(0, 16) }}...</span>
            </div>
          </div>
        </div>

        <!-- 兼容性组 -->
        <div class="aside-section mt-6 pt-5 border-t border-[var(--registry-border)]">
          <h3 class="aside-section-title">
            <IconTool class="text-[var(--registry-accent)] icon-lead" /> 
            运行兼容性
          </h3>
          <div class="aside-grid">
            <div class="aside-item">
              <span class="aside-label">App 兼容</span>
              <span class="aside-value font-semibold">>= {{ plugin.compatibility.minAppVersion }}</span>
            </div>
            <div class="aside-item">
              <span class="aside-label">Core API</span>
              <span class="aside-value font-semibold">>= {{ plugin.compatibility.minCoreApiVersion }}</span>
            </div>
            <div class="aside-item" v-if="plugin.compatibility.python">
              <span class="aside-label">Python 环境</span>
              <span class="aside-value font-medium text-emerald-500">{{ plugin.compatibility.python }}</span>
            </div>
          </div>
        </div>

        <!-- 作者信息组 -->
        <div class="aside-section mt-6 pt-5 border-t border-[var(--registry-border)]">
          <h3 class="aside-section-title">
            <IconUser class="text-[var(--registry-accent)] icon-lead" /> 
            开发与维护
          </h3>
          <div class="aside-grid">
            <div class="aside-item">
              <span class="aside-label">维护作者</span>
              <span class="aside-value font-semibold text-[var(--registry-text)]">@{{ plugin.author.name }}</span>
            </div>
            <div class="aside-item" v-if="plugin.author.url">
              <span class="aside-label">官方主页</span>
              <span class="aside-value text-xs text-blue-500 truncate max-w-[180px] hover:underline">
                <a :href="plugin.author.url" target="_blank">{{ plugin.author.url.replace('https://', '') }}</a>
              </span>
            </div>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="mt-8 space-y-3">
          <a-button :href="plugin.latest.downloadUrl" target="_blank" type="primary" long class="action-btn">
            <template #icon><IconDownload /></template>
            下载插件包
          </a-button>
          <a-button :href="plugin.repo" target="_blank" long class="action-btn">
            <template #icon><IconGithub /></template>
            访问源码仓库
          </a-button>
        </div>
      </a-card>
    </aside>
  </div>
</template>

<style scoped>
.aside-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 750;
  text-transform: uppercase;
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
