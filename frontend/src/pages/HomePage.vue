<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <section
    class="min-h-screen bg-[#FDFBF7] px-4 py-0 font-sans selection:bg-emerald-100 selection:text-emerald-900"
  >
    <!-- Decorative Background Elements -->
    <div class="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        class="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-emerald-50/50 blur-3xl"
      ></div>
    </div>

    <div
      class="relative mx-auto flex max-w-md flex-col items-center gap-10 text-center"
    >
      <!-- Header Section -->
      <div class="animate-fade-in-down space-y-2 pt-4">
        <div
          class="inline-block rounded-full bg-emerald-50 px-4 py-1 text-xs font-medium tracking-widest text-emerald-800 ring-1 ring-emerald-100"
        >
          XXXXX学校
        </div>
        <h1
          class="font-serif text-5xl font-bold tracking-tight text-emerald-950 sm:text-6xl"
        >
          2025
        </h1>
        <p
          class="font-serif text-3xl font-medium text-emerald-900/80 sm:text-4xl"
        >
          校友返校日
        </p>
      </div>

      <!-- Main Image - Polaroid Style -->
      <div class="animate-fade-in-up w-full px-4 delay-100">
        <div
          class="group relative rotate-2 transition-transform duration-500 hover:rotate-0"
        >
          <div
            class="absolute -inset-1 rounded-lg bg-gradient-to-br from-amber-100 to-emerald-50 opacity-70 blur transition duration-500 group-hover:opacity-100"
          ></div>
          <div
            class="relative overflow-hidden rounded-sm bg-white p-3 shadow-xl ring-1 ring-black/5"
          >
            <div class="aspect-[4/3] overflow-hidden rounded-sm bg-slate-100">
              <img
                src="/pic.png"
                alt="校园插图"
                class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div class="pt-3 text-center">
              <p class="font-handwriting text-sm text-slate-500">
                重逢 · 青春 · 记忆
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="animate-fade-in-up w-full space-y-6 px-2 delay-200">
        <!-- Primary Action -->
        <div class="group relative">
          <div
            class="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 opacity-30 blur transition duration-200 group-hover:opacity-70"
          ></div>
          <RouterLink
            to="/postcard"
            class="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-emerald-500/40 active:translate-y-0 active:shadow-sm"
          >
            <span>生成电子明信片</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-5 w-5 opacity-80"
            >
              <path
                fill-rule="evenodd"
                d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
                clip-rule="evenodd"
              />
            </svg>
          </RouterLink>
          <p class="mt-2 text-xs font-medium text-emerald-800/60">
            一键制作明信片，传递返校喜悦
          </p>
        </div>

        <!-- Secondary Action -->
        <div class="group relative">
          <div
            class="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-200 to-orange-200 opacity-0 blur transition duration-200 group-hover:opacity-50"
          ></div>
          <RouterLink
            to="/gallery"
            class="relative flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-amber-200/50 bg-white/80 px-6 py-3.5 text-lg font-bold text-amber-900/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-50 hover:text-amber-900 active:translate-y-0"
          >
            <span>下载毕业合照</span>
          </RouterLink>
          <p class="mt-2 text-xs font-medium text-slate-500">
            下载毕业合影，留住青春记忆
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.font-handwriting {
  font-family: "Comic Sans MS", "Chalkboard SE", sans-serif; /* Fallback for handwriting style */
}

/* Custom Animation Utilities */
.animate-fade-in-down {
  animation: fadeInDown 0.8s ease-out forwards;
}

.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0; /* Start hidden */
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered delays */
.delay-100 {
  animation-delay: 100ms;
}
.delay-200 {
  animation-delay: 200ms;
}
</style>
