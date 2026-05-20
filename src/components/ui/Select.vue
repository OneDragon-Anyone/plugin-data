<script setup lang="ts">
import { cn } from "@/lib/utils";

defineProps<{
  class?: string;
  modelValue: string;
  options: Array<{ label: string; value: string }>;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <select
    :class="cn('h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring', $props.class)"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>
