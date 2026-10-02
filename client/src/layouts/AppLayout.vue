<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
    <Navbar />
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <router-view />
    </main>
    <ToastNotification />
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue';
import ToastNotification from '../components/ToastNotification.vue';
</script>
