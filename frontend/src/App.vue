<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-amber-50 via-amber-50 to-white text-slate-900">
    <main class="mx-auto w-full max-w-5xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
