<script>
  // Import brand image assets as static resource URLs
  import logo from "./assets/dogs-logo-cropped.png";
  import madeByDogs from "./assets/made-by-dogs-small.png";

  // Constant configurations for layout metrics
  const APP_MAX_WIDTH = "max-w-7xl";
  const CURRENT_YEAR = new Date().getFullYear();
  const WEAREDOGS_URL = "https://wearedogs.net";

  // Shared feature card styles
  const CARD_CLASS =
    "p-4 short:p-2.5 bg-card/60 hover:bg-card-hover/80 border border-white/5 hover:border-neon-red/30 rounded-xl transition-all duration-300 group";
  const CARD_TITLE_CLASS =
    "text-xs sm:text-sm font-bold tracking-wide mb-1 group-hover:text-neon-red transition-colors duration-300";
  const CARD_DESC_CLASS = "text-[10px] sm:text-xs text-neutral-500 leading-relaxed";
</script>

<main
  class="h-dvh max-h-dvh w-full flex flex-col justify-between bg-app text-white p-4 sm:p-6 md:p-8 lg:p-12 short:p-3 select-none overflow-hidden relative"
>
  <!-- Subtle Glowing background grids -->
  <div
    class="absolute inset-0 bg-radial-[ellipse_at_top_right] from-neon-red/8 to-transparent to-50% pointer-events-none"
  ></div>
  <div
    class="absolute inset-0 bg-radial-[ellipse_at_bottom_left] from-neon-red/3 to-transparent to-50% pointer-events-none"
  ></div>

  <!-- TOP NAV BAR -->
  <header
    class="w-full mx-auto {APP_MAX_WIDTH} flex items-center justify-between border-b border-white/5 pb-3 sm:pb-4 short:pb-2 z-10"
  >
    <div class="flex items-center gap-2.5 sm:gap-3">
      <img
        src={logo}
        alt="DOGS Logo"
        class="w-8 h-8 sm:w-10 sm:h-10 2xl:w-14 2xl:h-14 short:w-6 short:h-6 object-contain transition-transform duration-500 hover:rotate-12"
      />
      <h1
        class="text-lg sm:text-xl md:text-2xl short:text-base font-bold tracking-wider text-white"
      >
        DOGS
      </h1>
    </div>
  </header>

  <!-- CENTER BODY (Fits strictly inside viewport bounds) -->
  <div
    class="w-full mx-auto {APP_MAX_WIDTH} flex-1 flex flex-col justify-center gap-6 sm:gap-8 lg:gap-12 short:gap-3 my-4 short:my-2 overflow-hidden"
  >
    <!-- HERO MATRIX GRID -->
    <div class="grid grid-cols-1 sm:grid-cols-2 short:grid-cols-1 gap-6 lg:gap-12 items-center">
      <!-- Left: Text Branding & Header -->
      <div
        class="flex flex-col gap-3.5 text-center sm:text-left justify-center order-2 sm:order-1"
      >
        <!-- Tagline & Description -->
        <p
          class="text-lg sm:text-xl md:text-2xl lg:text-3xl short:text-base font-light text-neutral-200 leading-snug max-w-xl"
        >
          A premium, minimalist Svelte boilerplate crafted for speed and
          responsiveness.
        </p>

        <p
          class="text-[11px] sm:text-xs md:text-sm text-neutral-500 leading-relaxed max-w-md mx-auto sm:mx-0"
        >
          This template is built by DOGS for the homies. Fully optimized,
          lightweight, and ready for deployment.
        </p>
      </div>

      <!-- Right: DOGS Hero Logo (sized dynamically to prevent overflow) -->
      <div class="flex items-center justify-center order-1 sm:order-2 short:hidden">
        <div
          class="relative w-full max-w-[130px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[260px] 2xl:max-w-[360px] aspect-square flex items-center justify-center bg-card/30 border border-white/5 rounded-2xl p-3 backdrop-blur-md shadow-2xl transition-all duration-500 hover:border-neon-red/20"
        >
          <div
            class="absolute inset-0 bg-radial from-neon-red/5 to-transparent rounded-2xl pointer-events-none"
          ></div>
          <img
            src={logo}
            alt="DOGS dog head logo"
            class="w-full h-full object-contain animate-[pulse_6s_ease-in-out_infinite]"
          />
        </div>
      </div>
    </div>

    <!-- FEATURES CARD GRID SECTION -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      <div class={CARD_CLASS}>
        <h3 class={CARD_TITLE_CLASS}>Lucide Icons</h3>
        <p class={CARD_DESC_CLASS}>
          Tree-shakeable SVG icons via @lucide/svelte, imported one at a time.
        </p>
      </div>

      <div class={CARD_CLASS}>
        <h3 class={CARD_TITLE_CLASS}>Viewport Matrix</h3>
        <p class={CARD_DESC_CLASS}>
          Agile layout styles that seamlessly scale from mobile screens up to
          TVs.
        </p>
      </div>

      <div class={CARD_CLASS}>
        <h3 class={CARD_TITLE_CLASS}>Tailwind CSS</h3>
        <p class={CARD_DESC_CLASS}>
          Powered by Tailwind CSS v4 and plain CSS. No preprocessors.
        </p>
      </div>
    </div>
  </div>

  <!-- BOTTOM FOOTER -->
  <footer
    class="w-full mx-auto {APP_MAX_WIDTH} pt-3 short:pt-2 border-t border-white/5 z-10"
  >
    <div
      class="flex items-center justify-between gap-3 text-[10px] 2xl:text-sm tracking-wider text-neutral-600 select-none"
    >
      <span>&copy; {CURRENT_YEAR} DOGS.</span>
      <a
        href={WEAREDOGS_URL}
        target="_blank"
        rel="noopener noreferrer"
        class="shrink-0 opacity-70 hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-300"
      >
        <img
          src={madeByDogs}
          alt="This product was made by DOGS"
          width="480"
          height="159"
          class="h-6 sm:h-7 lg:h-8 2xl:h-12 short:h-5 w-auto"
        />
      </a>
    </div>
  </footer>
</main>

<style>
  /* h-dvh needs Chrome 108+; older app-tier browsers (see APP_CSS_TARGET) fall back to vh to still fill the screen */
  @supports not (height: 100dvh) {
    main {
      height: 100vh;
      max-height: 100vh;
    }
  }
</style>
