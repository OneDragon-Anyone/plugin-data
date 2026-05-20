<script setup lang="ts">
import {
  IconCalendar,
  IconCode,
  IconGithub,
  IconLaunch,
  IconSearch,
  IconStar
} from "@arco-design/web-vue/es/icon";
import Fuse from "fuse.js";
import { computed, ref } from "vue";
import { riskLabels } from "@/lib/risk";
import type { PluginEntry, RiskTag, RegistryStatus } from "@/lib/types";
import { withBase } from "@/lib/utils";

const props = defineProps<{
  plugins: PluginEntry[];
}>();

const query = ref("");
const activeTag = ref("all");
const activeStatus = ref("all");
const sort = ref("recommended");

const fuse = computed(
  () =>
    new Fuse(props.plugins, {
      threshold: 0.32,
      keys: ["id", "name", "summary", "author.name", "tags"]
    })
);

const tags = computed(() => Array.from(new Set(props.plugins.flatMap((plugin) => plugin.tags))).sort());
const statuses = computed(() => Array.from(new Set(props.plugins.map((plugin) => plugin.status))).sort() as RegistryStatus[]);

const filteredPlugins = computed(() => {
  const searched = query.value.trim()
    ? fuse.value.search(query.value.trim()).map((result) => result.item)
    : [...props.plugins];

  const filtered = searched.filter((plugin) => {
    return (
      (activeTag.value === "all" || plugin.tags.includes(activeTag.value)) &&
      (activeStatus.value === "all" || plugin.status === activeStatus.value)
    );
  });

  return filtered.sort((a, b) => {
    if (sort.value === "stars") return b.stars - a.stars;
    if (sort.value === "name") return a.name.localeCompare(b.name, "zh-CN");
    if (sort.value === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.status !== b.status) return a.status === "listed" ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
});

const statusTranslation: Record<RegistryStatus, string> = {
  listed: "已上架",
  deprecated: "已弃用",
  hidden: "已隐藏",
  suspended: "已暂停",
  removed: "已失效"
};

function statusColor(value: RegistryStatus): string {
  if (value === "listed") return "green";
  if (value === "deprecated") return "orange";
  if (value === "hidden") return "gray";
  return "red";
}

function riskColor(value: RiskTag): string {
  if (value === "automation") return "orange";
  if (value === "account" || value === "process") return "red";
  if (value === "network" || value === "ocr" || value === "yolo") return "blue";
  return "gray";
}
</script>

<template>
  <section class="directory-hero">
    <div class="directory-search">
      <a-input-search
        v-model="query"
        allow-clear
        size="large"
        placeholder="搜索插件、作者、标签或 ID..."
      >
        <template #button-icon>
          <IconSearch />
        </template>
      </a-input-search>
      <a-select v-model="sort" size="large" class="directory-sort" placeholder="排序">
        <a-option value="recommended">推荐优先</a-option>
        <a-option value="updated">最近更新</a-option>
        <a-option value="stars">最多 Stars</a-option>
        <a-option value="name">名称排序</a-option>
      </a-select>
    </div>

    <!-- 过滤器面板 -->
    <div class="filter-strip">
      <button
        class="filter-chip"
        :class="{ active: activeStatus === 'all' }"
        type="button"
        @click="activeStatus = 'all'"
      >
        所有状态
      </button>
      <button
        v-for="item in statuses"
        :key="item"
        class="filter-chip"
        :class="{ active: activeStatus === item }"
        type="button"
        @click="activeStatus = item"
      >
        {{ statusTranslation[item] || item }}
      </button>
      <span class="filter-divider" />
      <button
        class="filter-chip"
        :class="{ active: activeTag === 'all' }"
        type="button"
        @click="activeTag = 'all'"
      >
        所有标签
      </button>
      <button
        v-for="item in tags"
        :key="item"
        class="filter-chip"
        :class="{ active: activeTag === item }"
        type="button"
        @click="activeTag = item"
      >
        # {{ item }}
      </button>
    </div>
  </section>

  <!-- 极简流式总数 -->
  <div class="directory-meta">
    <span>✨ 共找到 <b>{{ filteredPlugins.length }}</b> 款可用插件 (总计 {{ plugins.length }} 款)</span>
  </div>

  <!-- 插件列表网格 -->
  <section class="plugin-grid">
    <article
      v-for="(plugin, index) in filteredPlugins"
      :key="plugin.id"
      class="plugin-card"
      :style="{ '--delay': `${Math.min(index, 6) * 35}ms` }"
    >
      <div class="plugin-card-main">
        <div class="plugin-card-head">
          <div class="min-w-0">
            <a :href="withBase(`/plugins/${plugin.id}/`)" class="plugin-title">{{ plugin.name }}</a>
            <div class="plugin-subline">
              <span class="mono">{{ plugin.id }}</span>
              <span>@{{ plugin.author.name }}</span>
            </div>
          </div>
          <div class="plugin-badges">
            <a-tag v-if="plugin.pinned" color="cyan" size="small">推荐</a-tag>
            <a-tag :color="statusColor(plugin.status)" size="small">
              {{ statusTranslation[plugin.status] || plugin.status }}
            </a-tag>
          </div>
        </div>

        <p class="plugin-summary">{{ plugin.summary }}</p>

        <!-- 科技扁平 Tag 墙 -->
        <div class="plugin-tags">
          <a-tag v-for="item in plugin.tags" :key="item" size="small"># {{ item }}</a-tag>
          <a-tag v-for="item in plugin.risk" :key="item" :color="riskColor(item)" size="small">
            ⚠️ {{ riskLabels[item] }}
          </a-tag>
        </div>
      </div>

      <!-- 底部数据栏，用精美 Arco 图标替代说教文字 -->
      <div class="plugin-card-foot">
        <div class="plugin-stats">
          <span class="flex items-center gap-1">
            <IconCode class="text-[var(--registry-muted)] icon-tweak" />
            v{{ plugin.latest.version }}
          </span>
          <span class="flex items-center gap-1">
            <IconStar class="text-amber-500 fill-amber-500 icon-tweak" />
            {{ plugin.stars }}
          </span>
          <span class="flex items-center gap-1">
            <IconCalendar class="text-[var(--registry-muted)] icon-tweak" />
            {{ new Date(plugin.updatedAt).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }) }}
          </span>
        </div>
        <a-space :size="8">
          <a-button :href="plugin.repo" target="_blank" size="small" class="plugin-action-btn">
            <template #icon>
              <IconGithub />
            </template>
            源码
          </a-button>
          <a-button :href="withBase(`/plugins/${plugin.id}/`)" type="primary" size="small" class="plugin-action-btn">
            详情
            <template #icon>
              <IconLaunch />
            </template>
          </a-button>
        </a-space>
      </div>
    </article>
  </section>
</template>

<style scoped>
.plugin-action-btn {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
}

.icon-tweak {
  font-size: 13px;
}
</style>
