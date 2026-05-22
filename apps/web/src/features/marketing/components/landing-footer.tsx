"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const footerColumns = [
  {
    heading: "Fitur",
    links: [
      "Talk voice",
      "Examine",
      "Rekam medis",
      "Quiz diagnosis",
      "Feedback & XP",
      "Leaderboard",
      "Riwayat kasus",
      "Dashboard",
    ],
  },
  {
    heading: "Kasus MVP",
    links: [
      "Maya (demo)",
      "Budi",
      "Siti",
      "Kardiologi",
      "General Medicine",
      "Neurologi",
      "Pediatrics",
      "Dentistry",
    ],
  },
  {
    heading: "Aplikasi",
    links: [
      "Coba demo",
      "Daftar",
      "Masuk",
      "PWA install",
      "Onboarding",
      "Profil",
      "Disclaimer edukatif",
    ],
  },
] as const;

function footerHrefFor(label: string) {
  if (label === "Dashboard") {
    return "/app/home";
  }

  if (label === "Maya (demo)" || label === "Coba demo") {
    return "/app/cases/demo/brief";
  }

  if (label === "Budi" || label === "Siti") {
    return "/app/specialists";
  }

  if (label === "Kardiologi" || label === "General Medicine" || label === "Neurologi") {
    return "/app/specialists";
  }

  if (label === "Daftar") {
    return "/register";
  }

  if (label === "Masuk") {
    return "/sign-in";
  }

  if (label === "Leaderboard") {
    return "/leaderboard";
  }

  if (label === "Riwayat kasus") {
    return "/history";
  }

  if (label === "Profil") {
    return "/profile";
  }

  if (label === "Onboarding") {
    return "/app/onboarding";
  }

  if (label === "Disclaimer edukatif") {
    return "#cta";
  }

  return "#features";
}

export function LandingFooter() {
  const reduce = useReducedMotion();

  return (
    <footer className="w-full bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-0 xl:gap-x-16">
          <motion.div
            className="sm:col-span-2 lg:col-span-1"
            initial={reduce ? false : { opacity: 0, y: 20, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          >
            <motion.div
              whileHover={
                reduce
                  ? undefined
                  : { letterSpacing: "0.02em", transition: { duration: 0.35 } }
              }
            >
              <Link
                href="/"
                className="retro inline-block text-sm text-foreground sm:text-base"
              >
                PixelAid
              </Link>
            </motion.div>
            <p className="mt-4 max-w-xs text-sm leading-snug text-muted-foreground">
              Latihan kasus untuk mahasiswa kedokteran. Bukan alat diagnosis.
            </p>
          </motion.div>

          {footerColumns.map((column, columnIndex) => {
            const drift = columnIndex % 2 === 0 ? 1 : -1;

            return (
              <motion.div
                key={column.heading}
                className="min-w-0"
                initial={reduce ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25, margin: "0px 0px -8% 0px" }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 24,
                  delay: reduce ? 0 : 0.08 + columnIndex * 0.07,
                }}
              >
                <motion.h3
                  className="text-sm font-medium leading-snug text-muted-foreground"
                  initial={reduce ? false : { opacity: 0, x: drift * -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.9 }}
                  transition={{
                    delay: reduce ? 0 : 0.05 + columnIndex * 0.04,
                    duration: 0.45,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {column.heading}
                </motion.h3>
                <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                  {column.links.map((label, linkIndex) => (
                    <motion.li
                      key={label}
                      initial={reduce ? false : { opacity: 0, x: drift * 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{
                        delay: reduce ? 0 : linkIndex * 0.028 + columnIndex * 0.04,
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <motion.div
                        whileHover={
                          reduce
                            ? undefined
                            : {
                                x: drift * 5,
                                transition: {
                                  type: "spring",
                                  stiffness: 420,
                                  damping: 22,
                                },
                              }
                        }
                        className="w-fit"
                      >
                        <Link
                          href={footerHrefFor(label)}
                          className="text-sm leading-snug text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {label}
                        </Link>
                      </motion.div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
