export default function Loading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#02153d] px-6 text-white">
      <section
        className="flex w-full max-w-sm flex-col items-center gap-6 text-center"
        aria-label="Memuat PixelAid"
      >
        <div
          className="relative size-20 animate-spin"
          aria-hidden="true"
          style={{
            animationDuration: "1s",
            animationTimingFunction: "steps(8, end)",
          }}
        >
          <div className="absolute left-1/2 top-0 size-4 -translate-x-1/2 bg-[#f4c44f] shadow-[0_0_0_2px_#1b2f5f]" />
          <div className="absolute right-2 top-2 size-3 bg-[#f4c44f]/85 shadow-[0_0_0_2px_#1b2f5f]" />
          <div className="absolute right-0 top-1/2 size-4 -translate-y-1/2 bg-[#f4c44f] shadow-[0_0_0_2px_#1b2f5f]" />
          <div className="absolute bottom-2 right-2 size-3 bg-[#f4c44f]/85 shadow-[0_0_0_2px_#1b2f5f]" />
          <div className="absolute bottom-0 left-1/2 size-4 -translate-x-1/2 bg-[#f4c44f] shadow-[0_0_0_2px_#1b2f5f]" />
          <div className="absolute bottom-2 left-2 size-3 bg-[#f4c44f]/85 shadow-[0_0_0_2px_#1b2f5f]" />
          <div className="absolute left-0 top-1/2 size-4 -translate-y-1/2 bg-[#f4c44f] shadow-[0_0_0_2px_#1b2f5f]" />
          <div className="absolute left-2 top-2 size-3 bg-[#f4c44f]/85 shadow-[0_0_0_2px_#1b2f5f]" />
        </div>

        <div className="space-y-3">
          <p className="retro text-xs leading-relaxed text-[#f4c44f] drop-shadow-[2px_2px_0_#10224f] sm:text-sm">
            Menyiapkan ruang praktik
          </p>
          <p className="mx-auto max-w-xs text-sm leading-6 text-white/80">
            Pasien simulasi sedang dipanggil. Siapkan pertanyaan terbaikmu.
          </p>
        </div>
      </section>
    </main>
  );
}
