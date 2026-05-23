"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TechnicalCrosshairFrame } from "@/features/marketing/components/technical-crosshair-frame";
import {
  DEMO_CASE,
  MARKETING_ASSETS,
  SPECIALIST_GRID,
} from "@/features/marketing/marketing-assets";

export function IntegrationHarnessSection() {
  const reduce = useReducedMotion();

  return (
    <section id="cases" className="w-full scroll-mt-[72px] bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-5">
          <motion.p
            className="text-sm font-normal leading-snug text-foreground sm:text-base sm:leading-snug"
            initial={reduce ? false : { opacity: 0, x: -28, rotate: -0.35 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          >
            18 kasus dari 6 spesialis siap dimainkan
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 36, scale: 0.94 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: 0.06 }}
            whileHover={reduce ? undefined : { scale: 1.02 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            <Button
              asChild
              variant="outline"
              className="h-10 w-fit shrink-0 rounded-full px-5 text-sm shadow-sm sm:h-11 sm:px-6 sm:text-base"
            >
              <Link href="/app/specialists">Pilih spesialis</Link>
            </Button>
          </motion.div>
        </div>

        <div className="relative -mx-4 mt-10 w-[calc(100%+2rem)] overflow-visible sm:-mx-6 sm:mt-12 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:mt-14 lg:w-[calc(100%+4rem)]">
          <TechnicalCrosshairFrame>
            <div className="mb-8 flex justify-center px-4 sm:mb-10 sm:px-6 lg:px-8">
              <motion.div
                className="flex w-full max-w-md items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:gap-5 sm:p-5"
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ type: "spring", stiffness: 220, damping: 24 }}
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:size-[4.5rem]">
                  <Image
                    src={MARKETING_ASSETS.demoPatientAvatar}
                    alt={`Avatar pasien ${DEMO_CASE.patientName}`}
                    fill
                    className="object-cover pixelated"
                    sizes="72px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground sm:text-base">
                    Demo tamu: {DEMO_CASE.patientName}, {DEMO_CASE.patientAge} thn
                  </p>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground sm:text-sm">
                    {DEMO_CASE.specialist} · {DEMO_CASE.difficulty} · tanpa akun
                  </p>
                </div>
                <Button asChild size="sm" className="hidden shrink-0 rounded-full sm:inline-flex">
                  <Link href="/app/cases/demo/brief">Main</Link>
                </Button>
              </motion.div>
            </div>

            <div className="grid w-full grid-cols-2 justify-items-center gap-x-4 gap-y-7 sm:gap-x-10 sm:gap-y-9 md:grid-cols-3 md:gap-x-10 md:gap-y-10 lg:gap-x-12">
              {SPECIALIST_GRID.map((item, index) => {
                const col = index % 3;
                const row = Math.floor(index / 3);
                const drift = (col - 1) * 6 + (row % 2 === 0 ? -4 : 4);
                const spin = index % 2 === 0 ? -2.5 : 2.5;

                return (
                  <motion.div
                    key={item.name}
                    className="group flex min-h-10 w-fit max-w-full min-w-0 flex-col items-center justify-center gap-2 text-center sm:gap-2.5"
                    initial={
                      reduce
                        ? false
                        : {
                            opacity: 0,
                            y: 24 + row * 8,
                            x: drift,
                            rotate: spin * 0.15,
                          }
                    }
                    whileInView={{
                      opacity: 1,
                      y: 0,
                      x: 0,
                      rotate: 0,
                    }}
                    viewport={{ once: true, amount: 0.35, margin: "0px 0px -8% 0px" }}
                    transition={{
                      type: "spring",
                      stiffness: 280 + (index % 4) * 18,
                      damping: 20 + (index % 3),
                      mass: 0.72,
                      delay: index * 0.035,
                    }}
                    whileHover={
                      reduce
                        ? undefined
                        : {
                            y: -3,
                            transition: { type: "spring", stiffness: 400, damping: 18 },
                          }
                    }
                  >
                    <motion.div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-card p-1.5 sm:h-12 sm:w-12"
                      whileHover={
                        reduce
                          ? undefined
                          : { rotate: index % 2 === 0 ? -6 : 6, scale: 1.06 }
                      }
                      transition={{ type: "spring", stiffness: 420, damping: 16 }}
                    >
                      <div className="relative size-full">
                        <Image
                          src={item.icon}
                          alt=""
                          fill
                          className={`object-contain pixelated ${
                            item.available ? "" : "opacity-50"
                          }`}
                          sizes="48px"
                        />
                      </div>
                    </motion.div>
                    <span className="text-sm font-medium leading-snug text-foreground sm:text-[15px]">
                      {item.name}
                    </span>
                    <span className="text-xs leading-snug text-muted-foreground">
                      {item.status} · {item.detail}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </TechnicalCrosshairFrame>
        </div>
      </div>
    </section>
  );
}
