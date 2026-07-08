<script>
  import { t, isLoading } from 'svelte-i18n';
  import LanguageSelector from './components/LanguageSelector.svelte';
  
  // Import SVG assets as static resource URLs
  import logo from './assets/logo.svg';
  import hero from './assets/hero.svg';

  // Constant configurations for layout metrics
  const APP_MAX_WIDTH = 'max-w-7xl';
</script>

<!-- Dynamic Metadata Head tags managed via svelte-i18n -->
<svelte:head>
  <title>{$isLoading ? 'DOGS' : $t('meta.title')}</title>
  <meta name="description" content={$isLoading ? 'DOGS template' : $t('meta.description')} />
</svelte:head>

<main class="min-h-100dvh w-full flex flex-col justify-between bg-[#050508] text-white p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 select-none overflow-y-auto overflow-x-hidden scrollbar-none relative">
  <!-- Subtle Glowing background grids -->
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,51,68,0.08),transparent_50%)] pointer-events-none"></div>
  <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,51,68,0.03),transparent_50%)] pointer-events-none"></div>

  {#if $isLoading}
    <!-- Loading placeholder state aligned with core theme -->
    <div class="flex-1 flex flex-col items-center justify-center gap-4">
      <div class="w-12 h-12 border-2 border-[#ff3344] border-t-transparent rounded-full animate-spin"></div>
      <p class="text-xs font-semibold uppercase tracking-widest text-[#ff3344] animate-pulse">Loading DOGS template...</p>
    </div>
  {:else}
    <!-- Dynamic page body -->
    <div class="w-full mx-auto {APP_MAX_WIDTH} flex-1 flex flex-col justify-center">
      
      <!-- HEADER AND HERO MATRIX CONTAINER -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        <!-- Left: Text Branding & Header -->
        <div class="flex flex-col gap-5 text-center sm:text-left justify-center order-2 sm:order-1">
          <!-- Logo & Brand Header -->
          <div class="flex items-center gap-3 justify-center sm:justify-start">
            <img src={logo} alt="DOGS Logo" class="w-10 h-10 md:w-12 md:h-12 text-[#ff3344] object-contain transition-transform duration-500 hover:rotate-12" />
            <h1 class="text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-bold tracking-wider text-white">
              {$t('app.title')}
            </h1>
          </div>

          <!-- Tagline & Description -->
          <p class="text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-light text-neutral-300 leading-relaxed max-w-xl">
            {$t('app.tagline')}
          </p>

          <p class="text-xs sm:text-sm lg:text-base 2xl:text-lg text-neutral-500 leading-relaxed max-w-md">
            {$t('app.intro')}
          </p>
        </div>

        <!-- Right: Swarm Hero Vector Art -->
        <div class="flex items-center justify-center order-1 sm:order-2">
          <div class="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px] lg:max-w-[450px] aspect-square flex items-center justify-center bg-[#0e0e12]/30 border border-white/5 rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-2xl transition-all duration-500 hover:border-[#ff3344]/20">
            <div class="absolute inset-0 bg-radial from-[#ff3344]/5 to-transparent rounded-3xl pointer-events-none"></div>
            <img src={hero} alt="DOGS Hero Artwork" class="w-full h-full object-contain animate-[pulse_6s_ease-in-out_infinite]" />
          </div>
        </div>

      </div>

      <!-- FEATURES CARD GRID SECTION -->
      <!-- Explicit layout adaptations across viewports:
           - Mobile Portrait: Stacked card columns
           - Mobile Landscape (sm:): Dual columns
           - Tablet (md:/lg:): Triple columns
           - Desktop (xl:): Clean padded margins
           - TV (2xl:): Spaced wide bounds -->
      <div class="mt-12 sm:mt-16 lg:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        
        <!-- i18n Feature Card -->
        <div class="p-6 bg-[#0e0e12]/60 hover:bg-[#14141a]/80 border border-white/5 hover:border-[#ff3344]/30 rounded-2xl transition-all duration-300 group">
          <div class="w-10 h-10 rounded-xl bg-[#ff3344]/10 text-[#ff3344] flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
            A
          </div>
          <h3 class="text-base sm:text-lg lg:text-xl font-bold tracking-wide mb-2 group-hover:text-[#ff3344] transition-colors duration-300">
            {$t('app.features.i18n')}
          </h3>
          <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            {$t('app.features.i18n_desc')}
          </p>
        </div>

        <!-- Responsive Layout Feature Card -->
        <div class="p-6 bg-[#0e0e12]/60 hover:bg-[#14141a]/80 border border-white/5 hover:border-[#ff3344]/30 rounded-2xl transition-all duration-300 group">
          <div class="w-10 h-10 rounded-xl bg-[#ff3344]/10 text-[#ff3344] flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
            R
          </div>
          <h3 class="text-base sm:text-lg lg:text-xl font-bold tracking-wide mb-2 group-hover:text-[#ff3344] transition-colors duration-300">
            {$t('app.features.responsive')}
          </h3>
          <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            {$t('app.features.responsive_desc')}
          </p>
        </div>

        <!-- Styles Feature Card -->
        <div class="p-6 bg-[#0e0e12]/60 hover:bg-[#14141a]/80 border border-white/5 hover:border-[#ff3344]/30 rounded-2xl transition-all duration-300 group sm:col-span-2 lg:col-span-1">
          <div class="w-10 h-10 rounded-xl bg-[#ff3344]/10 text-[#ff3344] flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
            S
          </div>
          <h3 class="text-base sm:text-lg lg:text-xl font-bold tracking-wide mb-2 group-hover:text-[#ff3344] transition-colors duration-300">
            {$t('app.features.styles')}
          </h3>
          <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            {$t('app.features.styles_desc')}
          </p>
        </div>

      </div>

    </div>

    <!-- FOOTER NAV & CONTROLS -->
    <!-- Positioned for thumb accessibility on mobile portrait (stacked layout),
         translates to full-width side margins on desktop and tablets -->
    <footer class="w-full mx-auto {APP_MAX_WIDTH} mt-12 sm:mt-16 lg:mt-24 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 z-10">
      
      <!-- Author credits -->
      <div class="text-xs tracking-wider text-neutral-600 text-center sm:text-left select-none">
        &copy; {new Date().getFullYear()} {$t('app.title')}. {$t('app.footer.made_by')} 
        <a href="https://cptnbrando.com" target="_blank" rel="noopener noreferrer" class="hover:text-white underline transition-colors duration-300">CaptainBrando</a>
        {$t('app.footer.for_homies')}.
      </div>

      <!-- Floating tactile Language Selector -->
      <div class="flex items-center justify-center">
        <LanguageSelector />
      </div>

    </footer>
  {/if}
</main>

<style lang="scss">
  // Specific custom styling using standard SCSS and CSS variable maps
  @use "./styles/variables" as *;

  main {
    background-color: var(--bg-app);
    color: var(--color-text);
  }
</style>
