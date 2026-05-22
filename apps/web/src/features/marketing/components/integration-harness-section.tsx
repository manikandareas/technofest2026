"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Heart, HeartPulse, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TechnicalCrosshairFrame } from "@/features/marketing/components/technical-crosshair-frame";

const specialists = [
  {
    name: "Kardiologi",
    status: "Tersedia",
    detail: "Maya · Budi · Siti",
    icon: HeartPulse,
    available: true,
  },
  {
    name: "Maya",
    status: "Demo tamu",
    detail: "Nyeri dada · mudah",
    icon: Heart,
    available: true,
  },
  {
    name: "Budi",
    status: "Setelah login",
    detail: "Palpitasi · sedang",
    icon: Heart,
    available: true,
  },
  {
    name: "Siti",
    status: "Setelah login",
    detail: "Sesak napas · sulit",
    icon: Heart,
    available: true,
  },
  {
    name: "General Medicine",
    status: "Segera",
    detail: "Coming soon",
    icon: Lock,
    available: false,
  },
  {
    name: "Neurologi",
    status: "Segera",
    detail: "Coming soon",
    icon: Lock,
    available: false,
  },
] as const;

export function IntegrationHarnessSection() {
  const reduce = useReducedMotion();

  return (
    <section className="w-full bg-background py-12 sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-5">
          <motion.p
            className="text-sm font-normal leading-snug text-foreground sm:text-base sm:leading-snug"
            initial={reduce ? false : { opacity: 0, x: -28, rotate: -0.35 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          >
            Tiga kasus kardiologi siap dimainkan
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
              <Link href="/app/specialists">Lihat semua kasus</Link>
            </Button>
          </motion.div>
        </div>

        <div className="relative -mx-4 mt-10 w-[calc(100%+2rem)] overflow-visible sm:-mx-6 sm:mt-12 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:mt-14 lg:w-[calc(100%+4rem)]">
          <TechnicalCrosshairFrame>
            <div className="grid w-full grid-cols-2 justify-items-center gap-x-4 gap-y-7 sm:gap-x-10 sm:gap-y-9 md:grid-cols-3 md:gap-x-10 md:gap-y-10 lg:gap-x-12">
              {specialists.map((item, index) => {
                const col = index % 3;
                const row = Math.floor(index / 3);
                const drift = (col - 1) * 6 + (row % 2 === 0 ? -4 : 4);
                const spin = index % 2 === 0 ? -2.5 : 2.5;
                const Icon = item.icon;

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
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-card sm:h-10 sm:w-10"
                      whileHover={
                        reduce
                          ? undefined
                          : { rotate: index % 2 === 0 ? -6 : 6, scale: 1.06 }
                      }
                      transition={{ type: "spring", stiffness: 420, damping: 16 }}
                    >
                      <Icon
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          item.available
                            ? "text-primary"
                            : "text-muted-foreground opacity-50"
                        }`}
                      />
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
