<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    variant?: "default" | "secondary" | "warning" | "danger" | "outline";
    class?: string;
  }>(),
  {
    variant: "default"
  }
);

const classes = computed(() =>
  cn(
    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
    props.variant === "default" && "border-primary/30 bg-primary/10 text-primary",
    props.variant === "secondary" && "border-border bg-secondary text-secondary-foreground",
    props.variant === "warning" && "border-accent/40 bg-accent/10 text-accent",
    props.variant === "danger" && "border-destructive/40 bg-destructive/10 text-destructive",
    props.variant === "outline" && "border-border text-muted-foreground",
    props.class
  )
);
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
