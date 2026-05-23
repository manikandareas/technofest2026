"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TechnicalCrosshairFrame } from "@/features/marketing/components/technical-crosshair-frame";

export function BottomCtaSection() {
  const reduce = useReducedMotion();

  return (
    <section id="cta" className="w-full bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative -mx-4 w-[calc(100%+2rem)] overflow-visible sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
          <TechnicalCrosshairFrame contentClassName="px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-x-14 xl:gap-x-20">
              <div className="min-w-0 space-y-4 sm:space-y-5">
                <motion.p
                  className="text-[15px] leading-snug text-muted-foreground sm:text-base"
                  initial={reduce ? false : { opacity: 0, x: -12, scale: 0.96 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.85 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24 }}
                >
                  Yuk mulai
                </motion.p>
                <motion.h2
                  className="retro max-w-[40rem] text-base leading-relaxed text-foreground sm:text-lg lg:text-xl"
                  initial={
                    reduce
                      ? false
                      : {
                          opacity: 0,
                          letterSpacing: "0.06em",
                          y: 18,
                          filter: "blur(8px)",
                        }
                  }
                  whileInView={{
                    opacity: 1,
                    letterSpacing: "0.02em",
                    y: 0,
                    filter: "blur(0px)",
                  }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  Siap latihan kasus pertamamu?
                </motion.h2>
                <p className="max-w-xl text-sm leading-snug text-muted-foreground sm:text-base">
                  Demo Maya gratis tanpa akun. Daftar untuk simpan skor, buka semua kasus,
                  dan naik leaderboard. Simulasi belajar — bukan diagnosis pasien nyata.
                </p>
              </div>
              <motion.div
                className="flex flex-col gap-3 sm:flex-row lg:justify-end"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.75 }}
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: reduce ? 0 : 0.12,
                      delayChildren: reduce ? 0 : 0.15,
                    },
                  },
                }}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 24, rotate: reduce ? 0 : -1.2 },
                    show: {
                      opacity: 1,
                      y: 0,
                      rotate: 0,
                      transition: { type: "spring", stiffness: 260, damping: 22 },
                    },
                  }}
                  whileHover={reduce ? undefined : { rotate: 0.5, y: -2 }}
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                >
                  <Button
                    asChild
                    variant="outline"
                    className="h-14 shrink-0 rounded-full px-7 text-base font-medium shadow-sm"
                  >
                    <Link href="/app/cases/demo/brief">Main demo Maya</Link>
                  </Button>
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 28, rotate: reduce ? 0 : 1.4 },
                    show: {
                      opacity: 1,
                      y: 0,
                      rotate: 0,
                      transition: { type: "spring", stiffness: 240, damping: 20 },
                    },
                  }}
                  whileHover={reduce ? undefined : { rotate: -0.6, y: -2 }}
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                >
                  <Button asChild className="h-14 shrink-0 rounded-full px-7 text-base font-medium">
                    <Link href="/register">Daftar & simpan skor</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </TechnicalCrosshairFrame>
        </div>
      </div>
    </section>
  );
}
