<template>
  <section
    class="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    style="background: radial-gradient(120% 100% at 100% 0%, #241108 0%, #100b0e 45%, #0b0b0d 100%); color: #fff;"
  >
    <div class="site-container relative z-10 pb-24 pt-40 sm:pb-32">
      <p class="site-eyebrow site-hero-in mb-6" style="animation-delay: 0ms">
        Independent creative agency
      </p>
      <h1 class="site-display site-hero-in max-w-5xl text-white" style="animation-delay: 120ms">
        Ideas that move <span style="color: var(--brand-accent)">brands</span> forward.
      </h1>
      <p class="site-body-lg site-hero-in mt-8 max-w-xl !text-white/70" style="animation-delay: 260ms">
        24 Seven is a full-service creative agency for brands who refuse to blend in — strategy,
        identity, campaigns, and digital experience, under one roof.
      </p>
      <div class="site-hero-in mt-10 flex flex-wrap gap-4" style="animation-delay: 400ms">
        <NuxtLink to="/contact" class="site-btn-primary">
          Start a Project
        </NuxtLink>
        <NuxtLink to="/work" class="site-btn-ghost border-white/25 text-white hover:bg-white/10">
          View Our Work
        </NuxtLink>
      </div>
    </div>

    <div class="site-hero-in absolute inset-x-0 bottom-8 hidden justify-center sm:flex" style="animation-delay: 700ms">
      <span class="flex flex-col items-center gap-2 text-white/50">
        <span class="text-[11px] font-medium uppercase tracking-[0.2em]">Scroll</span>
        <span class="h-10 w-px bg-white/30" />
      </span>
    </div>
  </section>
</template>
