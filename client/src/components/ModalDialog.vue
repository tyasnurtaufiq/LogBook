<template>
  <teleport to="body">
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeOnBackdrop && close()"
      >
        <transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="modelValue"
            class="relative w-full max-w-lg glass-card p-6 text-slate-100 overflow-hidden"
          >
            <!-- Header -->
            <div class="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <slot name="title">{{ title }}</slot>
              </h3>
              <button
                @click="close"
                class="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.06] transition-all"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Body -->
            <div class="py-4">
              <slot></slot>
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="pt-4 border-t border-white/[0.06] flex justify-end gap-2.5">
              <slot name="footer"></slot>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  closeOnBackdrop: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'close']);

const close = () => {
  emit('update:modelValue', false);
  emit('close');
};
</script>
