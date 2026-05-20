<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    as?: "button" | "a";
    href?: string;
    target?: string;
    variant?: "default" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    class?: string;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    as: "button",
    variant: "default",
    size: "md",
    type: "button"
  }
);

const classes = computed(() =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    props.variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
    props.variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    props.variant === "outline" && "border border-border bg-transparent hover:bg-secondary",
    props.variant === "ghost" && "hover:bg-secondary",
    props.size === "sm" && "h-8 px-3 text-xs",
    props.size === "md" && "h-10 px-4 text-sm",
    props.size === "lg" && "h-11 px-5 text-sm",
    props.class
  )
);
</script>

<template>
  <a v-if="as === 'a'" :class="classes" :href="href" :target="target">
    <slot />
  </a>
  <button v-else :class="classes" :type="type">
    <slot />
  </button>
</template>
