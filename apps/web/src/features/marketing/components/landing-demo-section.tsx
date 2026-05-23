"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DemoFeatureGrid } from "@/features/marketing/components/demo-feature-grid";

const DEMO_TITLE = "Ngobrol dengan pasien seperti di ruang konsultasi";
const demoWords = DEMO_TITLE.split(" ");

export function LandingDemoSection() {
  const reduce = useReducedMotion();

  const gridVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
        delayChildren: reduce ? 0 : 0.04,
      },
    },
  } as const;

  const colLeftVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.055,
        delayChildren: reduce ? 0 : 0.06,
      },
    },
  } as const;

  const wordRowVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.038,
      },
    },
  } as const;

  const eyebrowVariants = {
    hidden: reduce ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.2 },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
    },
  } as const;

  const wordVariants = {
    hidden: reduce
      ? { opacity: 1, y: 0, rotate: 0 }
      : { opacity: 0, y: "0.32em", rotate: -1.2 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { type: "spring" as const, stiffness: 380, damping: 26 },
    },
  } as const;

  const ctaWrapVariants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 280, damping: 24 },
    },
  } as const;

  const rightColVariants = {
    hidden: reduce ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 14, y: 10 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.55, ease: [0.19, 1, 0.35, 1] },
    },
  } as const;

  return (
    <section
      id="demo"
      className="w-full bg-background py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 grid gap-10 sm:mb-14 sm:gap-12 lg:grid-cols-2 lg:items-start lg:gap-x-14 xl:gap-x-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12, margin: "0px 0px -12% 0px" }}
          variants={gridVariants}
        >
          <motion.div
            className="min-w-0 max-w-xl lg:max-w-none"
            variants={colLeftVariants}
          >
            <motion.p
              className="text-[15px] leading-snug text-muted-foreground sm:text-base"
              variants={eyebrowVariants}
              style={{ transformOrigin: "0% 50%" }}
            >
              Konsultasi interaktif
            </motion.p>
            <motion.h2
              className="retro mt-3 max-w-[34rem] text-base leading-relaxed text-foreground sm:mt-4 sm:text-lg lg:text-xl"
              variants={wordRowVariants}
            >
              {demoWords.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  className="inline-block"
                  variants={wordVariants}
                >
                  {word}
                  {i < demoWords.length - 1 ? " " : null}
                </motion.span>
              ))}
            </motion.h2>
            <motion.div
              className="mt-8 sm:mt-10"
              variants={ctaWrapVariants}
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
            >
              <Button asChild className="h-14 rounded-full px-7 text-base">
                <Link href="/app/cases/demo/brief">Main demo Maya</Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div className="min-w-0" variants={rightColVariants}>
            <p className="text-pretty text-lg leading-snug text-foreground/85 sm:text-xl sm:leading-snug lg:max-w-[26rem]">
              Tekan Talk, lalu bicara seperti biasa. Pasien jawab pakai suara dan chat sesuai kasus — riwayat, alergi, dan gejala kamu gali sendiri.
            </p>
          </motion.div>
        </motion.div>
        <DemoFeatureGrid />
      </div>
    </section>
  );
}
