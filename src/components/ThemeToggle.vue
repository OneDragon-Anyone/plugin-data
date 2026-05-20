<script setup lang="ts">
import { IconMoon, IconSun, IconThunderbolt } from "@arco-design/web-vue/es/icon";
import { onMounted, ref } from "vue";

type Theme = "light" | "dark" | "zzz";

const currentTheme = ref<Theme>("light");

function applyTheme(theme: Theme): void {
  currentTheme.value = theme;
  
  // 清理以前的主题 class
  document.documentElement.classList.remove("dark", "zzz");
  
  // 根据新主题设置 class
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (theme === "zzz") {
    document.documentElement.classList.add("zzz");
    document.documentElement.classList.add("dark");
  }
  
  // 设置 Arco 主题属性
  document.body.setAttribute("arco-theme", theme === "light" ? "light" : "dark");
  
  // 持久化
  localStorage.setItem("theme", theme);
}

function toggleTheme(): void {
  const nextTheme: Record<Theme, Theme> = {
    light: "dark",
    dark: "zzz",
    zzz: "light"
  };
  applyTheme(nextTheme[currentTheme.value]);
}

onMounted(() => {
  const stored = localStorage.getItem("theme") as Theme | null;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  if (stored && ["light", "dark", "zzz"].includes(stored)) {
    applyTheme(stored);
  } else {
    applyTheme(prefersDark ? "dark" : "light");
  }
});
</script>

<template>
  <a-button shape="circle" size="medium" class="theme-toggle-btn" @click="toggleTheme">
    <template #icon>
      <IconSun v-if="currentTheme === 'light'" class="theme-icon transition-all" />
      <IconMoon v-else-if="currentTheme === 'dark'" class="theme-icon transition-all" />
      <IconThunderbolt v-else class="theme-icon text-yellow-400 transition-all" />
    </template>
  </a-button>
</template>

<style scoped>
.theme-toggle-btn {
  border: 1px solid var(--registry-border) !important;
  background: color-mix(in srgb, var(--registry-surface) 40%, transparent) !important;
  backdrop-filter: blur(8px);
  color: var(--registry-text) !important;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.theme-toggle-btn:hover {
  border-color: color-mix(in srgb, var(--registry-accent) 40%, transparent) !important;
  background: var(--registry-surface) !important;
  transform: scale(1.05);
}

.theme-icon {
  font-size: 15px;
}
</style>
