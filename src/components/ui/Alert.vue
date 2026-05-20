<script setup lang="ts">
import { cn } from "@/lib/utils";

defineProps<{
  class?: string;
  variant?: "default" | "warning";
}>();
</script>

<template>
  <section
    :class="cn(
      'rounded-lg border p-4 text-sm',
      variant === 'warning' ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border bg-card text-muted-foreground',
      $props.class
    )"
  >
    <slot />
  </section>
</template>
