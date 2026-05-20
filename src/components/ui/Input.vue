<script setup lang="ts">
import { cn } from "@/lib/utils";

defineProps<{
  class?: string;
  placeholder?: string;
  modelValue?: string;
  type?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <input
    :class="cn('h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring', $props.class)"
    :placeholder="placeholder"
    :type="type ?? 'text'"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
