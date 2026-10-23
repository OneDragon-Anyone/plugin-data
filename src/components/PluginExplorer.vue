<script setup lang="ts">
import {
  IconCalendar,
  IconCode,
  IconDownload,
  IconGithub,
  IconLaunch,
  IconSearch,
  IconStar
} from "@arco-design/web-vue/es/icon";
import Fuse from "fuse.js";
import { computed, ref } from "vue";
import { coverUrl, formatCount, primaryRelease, riskColor, statusColor, statusLabels } from "@/lib/display";
import { riskLabels } from "@/lib/risk";
import type { PluginEntry } from "@/lib/types";
import { withBase } from "@/lib/utils";

const props = defineProps<{
  plugins: PluginEntry[];
}>();

const query = ref("");
const activeTag = ref("all");
const showDeprecated = ref(false);
const sort = ref("recommended");

const visiblePlugins = computed(() =>
  props.plugins.filter((plugin) => plugin.status === "listed" || plugin.status === "deprecated")
);

const fuse = computed(
  () =>
    new Fuse(visiblePlugins.value, {
      threshold: 0.32,
      keys: ["id", "name", "summary", "author.name", "tags"]
    })
);

const tags = computed(() => Array.from(new Set(visiblePlugins.value.flatMap((plugin) => plugin.tags))).sort());
const deprecatedCount = computed(() => visiblePlugins.value.filter((plugin) => plugin.status === "deprecated").length);

const filteredPlugins = computed(() => {
  const searched = query.value.trim()
    ? fuse.value.search(query.value.trim()).map((result) => result.item)
    : [...visiblePlugins.value];

  const filtered = searched.filter(
    (plugin) =>
      (activeTag.value === "all" || plugin.tags.includes(activeTag.value)) &&
      (showDeprecated.value || plugin.status !== "deprecated")
  );

  if (sort.value === "recommended" && query.value.trim()) return filtered;
  return filtered.sort((a, b) => {
    if (sort.value === "stars") return b.stars - a.stars;
    if (sort.value === "downloads") return b.downloads - a.downloads;
    if (sort.value === "name") return a.name.localeCompare(b.name, "zh-CN");
    if (sort.value === "updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.status !== b.status) return a.status === "listed" ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
});
</script>

<template>
  <section class="directory-hero">
    <div class="directory-search">
      <a-input-search v-model="query" allow-clear size="large" placeholder="搜索插件、作者、标签或 ID...">
        <template #button-icon>
          <IconSearch />
        </template>
      </a-input-search>
      <a-select v-model="sort" size="large" class="directory-sort" placeholder="排序">
        <a-option value="recommended">推荐优先</a-option>
        <a-option value="updated">最近更新</a-option>
        <a-option value="downloads">最多下载</a-option>
        <a-option value="stars">最多 Stars</a-option>
        <a-option value="name">名称排序</a-option>
      </a-select>
    </div>

    <div class="filter-strip">
      <button class="filter-chip" :class="{ active: activeTag === 'all' }" type="button" @click="activeTag = 'all'">
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
      <template v-if="deprecatedCount > 0">
        <span class="filter-divider" />
        <button
          class="filter-chip"
          :class="{ active: showDeprecated }"
          type="button"
          @click="showDeprecated = !showDeprecated"
        >
          显示已弃用 ({{ deprecatedCount }})
        </button>
      </template>
    </div>
  </section>

  <div class="directory-meta">
    <span>共找到 <b>{{ filteredPlugins.length }}</b> 款插件</span>
  </div>

  <div v-if="filteredPlugins.length === 0" class="py-16 text-center text-sm text-[var(--registry-muted)]">
    没有符合条件的插件。
  </div>

  <section class="plugin-grid">
    <article
      v-for="(plugin, index) in filteredPlugins"
      :key="plugin.id"
      class="plugin-card"
      :style="{ '--delay': `${Math.min(index, 6) * 35}ms` }"
    >
      <a v-if="plugin.cover" :href="withBase(`/plugins/${plugin.id}/`)" class="plugin-cover">
        <img :src="coverUrl(plugin)" :alt="plugin.name" loading="lazy" />
      </a>
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
            <a-tag v-if="plugin.status !== 'listed'" :color="statusColor(plugin.status)" size="small">
              {{ statusLabels[plugin.status] }}
            </a-tag>
            <a-tag v-if="plugin.stale" color="red" size="small">仓库失联</a-tag>
            <a-tag v-if="!plugin.latest" color="purple" size="small">仅测试版</a-tag>
          </div>
        </div>

        <p class="plugin-summary">{{ plugin.summary }}</p>

        <div class="plugin-tags">
          <a-tag v-for="item in plugin.tags" :key="item" size="small"># {{ item }}</a-tag>
          <a-tag v-for="item in plugin.risk" :key="item" :color="riskColor(item)" size="small">
            {{ riskLabels[item] }}
          </a-tag>
        </div>
      </div>

      <div class="plugin-card-foot">
        <div class="plugin-stats">
          <span class="flex items-center gap-1" title="最新版本">
            <IconCode class="text-[var(--registry-muted)] icon-tweak" />
            v{{ primaryRelease(plugin)?.version }}
          </span>
          <span class="flex items-center gap-1" title="下载量">
            <IconDownload class="text-[var(--registry-muted)] icon-tweak" />
            {{ formatCount(plugin.downloads) }}
          </span>
          <span class="flex items-center gap-1" title="Stars">
            <IconStar class="text-amber-500 fill-amber-500 icon-tweak" />
            {{ formatCount(plugin.stars) }}
          </span>
          <span class="flex items-center gap-1" title="更新时间">
            <IconCalendar class="text-[var(--registry-muted)] icon-tweak" />
            {{ new Date(plugin.updatedAt).toLocaleDateString(undefined, { month: "2-digit", day: "2-digit" }) }}
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
.plugin-cover {
  display: block;
  margin: -1px -1px 12px;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: inherit;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: color-mix(in srgb, var(--registry-border) 30%, transparent);
}

.plugin-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

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
