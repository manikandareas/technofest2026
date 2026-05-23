"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardList,
  FileHeart,
  Mic,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEMO_CASE, MARKETING_ASSETS } from "@/features/marketing/marketing-assets";

const demoFeatureTiles = [
  {
    icon: Mic,
    title: "Talk",
    body: "Tekan Talk, bicara seperti di klinik. Pasien jawab langsung pakai suara.",
  },
  {
    icon: Stethoscope,
    title: "Examine",
    body: "Pilih pemeriksaan yang relevan. Timer konsultasi tetap berjalan.",
  },
  {
    icon: FileHeart,
    title: "Rekam medis",
    body: "Buka data pasien saat perlu. Detail penting tidak dispoiler di awal.",
  },
  {
    icon: ClipboardList,
    title: "Quiz",
    body: "Akhiri konsultasi, tebak diagnosis, dapat skor dan tips perbaikan.",
  },
];

const inView = { once: true as const, amount: 0.15 as const };

export function DemoFeatureGrid() {
  const reduce = useReducedMotion();

  const card1Variants = {
    hidden: reduce
      ? { opacity: 1, x: 0, y: 0, scale: 1 }
      : { opacity: 0, x: -28, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 140, damping: 24, mass: 0.85 },
    },
  } as const;

  const card1InnerVariants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: reduce ? 0 : 0.08,
        type: "spring" as const,
        stiffness: 200,
        damping: 24,
      },
    },
  } as const;

  const card2Variants = {
    hidden: reduce
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 0, y: 36, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 150,
        damping: 24,
        mass: 0.82,
        delay: reduce ? 0 : 0.05,
      },
    },
  } as const;

  const card2InnerVariants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: reduce ? 0 : 0.1,
        type: "spring" as const,
        stiffness: 190,
        damping: 24,
      },
    },
  } as const;

  const tileVariants = {
    hidden: reduce
      ? { opacity: 1, y: 0, x: 0 }
      : { opacity: 0, y: 22, x: 0 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 280,
        damping: 26,
        delay: reduce ? 0 : i * 0.045,
      },
    }),
  };

  return (
    <div
      id="features"
      className="grid gap-3 contain-[layout] sm:gap-4 lg:grid-cols-4"
    >
      <motion.article
        className="relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-muted p-5 sm:min-h-[440px] sm:p-6 lg:col-span-2"
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        variants={card1Variants}
      >
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-[radial-gradient(circle_at_20%_15%,#FFAF73_0%,#F41A2F_30%,transparent_58%),radial-gradient(circle_at_64%_54%,#2B7FFF_0%,#6EA4E8_42%,transparent_72%)] opacity-85" />
        <div className="absolute bottom-8 left-0 h-48 w-48 rounded-full bg-[#F41A2F]/20 blur-3xl sm:h-56 sm:w-56" />
        <motion.div
          className="relative z-10 max-w-[min(100%,520px)] rounded-xl border border-border bg-card/95 shadow-md"
          variants={card1InnerVariants}
        >
          <div className="grid min-h-[180px] grid-cols-[1fr_0.38fr] border-b border-border sm:min-h-[200px]">
            <div className="space-y-3 p-5 text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-snug">
              <p className="text-foreground">
                {DEMO_CASE.patientName}, {DEMO_CASE.patientAge} — evaluasi praoperasi
                asma. Gali riwayat, cek alergi, nilai risiko anestesi.
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm sm:leading-snug">
                Demo gratis tanpa akun. Login untuk buka 18 kasus lainnya.
              </p>
            </div>
            <div className="relative border-l border-border p-4 sm:p-5">
              <div className="relative mx-auto aspect-square w-full max-w-[140px] overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={MARKETING_ASSETS.demoConsultationAvatar}
                  alt={`Pasien ${DEMO_CASE.patientName} di ruang konsultasi`}
                  fill
                  className="object-cover pixelated"
                  sizes="140px"
                />
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="mb-3 flex w-fit items-center gap-0.5 rounded-xl border-2 border-foreground bg-card p-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-8 w-11 rounded-lg bg-[linear-gradient(135deg,#0A59D2,#FFD5BB_55%,#F41A2F)] sm:h-9 sm:w-12 sm:rounded-[10px]"
                />
              ))}
            </div>
            <div className="grid grid-cols-[1fr_72px] gap-2 sm:grid-cols-[1fr_76px] sm:gap-3">
              <div className="truncate rounded-lg border border-border bg-card px-3 py-2 text-xs leading-snug text-muted-foreground shadow-sm sm:px-4 sm:py-2.5 sm:text-sm">
                Pasien: &quot;Saya cemas soal operasi minggu ini...&quot;
              </div>
              <div className="flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm">
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </div>
        </motion.div>
        <div className="relative z-10 mt-auto pt-8 text-white sm:pt-10">
          <h3 className="retro text-sm leading-relaxed sm:text-base">
            Satu ruang, semua alat
          </h3>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-snug text-white/90 sm:mt-4 sm:text-base sm:leading-snug">
            Talk, pemeriksaan, rekam medis, dan akhiri konsultasi — di HP, tablet,
            atau laptop.
          </p>
        </div>
      </motion.article>

      <motion.article
        className="relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-muted p-5 sm:min-h-[420px] sm:p-6 lg:col-span-2"
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        variants={card2Variants}
      >
        <motion.div
          className="mx-auto mt-10 w-full max-w-[560px] rounded-xl bg-card p-5 shadow-md sm:mt-12 sm:p-6"
          variants={card2InnerVariants}
        >
          <p className="text-pretty text-sm leading-snug text-foreground sm:text-base sm:leading-snug">
            Anamnesis, pemeriksaan, dan rekam medis dinilai.{" "}
            <span className="text-muted-foreground">
              Dapat XP, bintang, dan feedback apa yang perlu diperbaiki.
            </span>
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground sm:px-4 sm:py-2 sm:text-sm">
              <span className="relative size-4">
                <Image
                  src={MARKETING_ASSETS.iconStars}
                  alt=""
                  fill
                  className="object-contain pixelated"
                  sizes="16px"
                />
              </span>
              +120 XP
            </span>
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs text-foreground sm:px-4 sm:py-2 sm:text-sm">
              ★★★☆
            </span>
            <Button
              asChild
              className="ml-auto h-11 rounded-full px-5 text-sm sm:h-12 sm:px-6 sm:text-base"
            >
              <Link href="/register">Simpan skor</Link>
            </Button>
          </div>
        </motion.div>
        <div>
          <h3 className="retro text-sm leading-relaxed text-muted-foreground sm:text-base">
            Skor & leaderboard
          </h3>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-snug text-muted-foreground sm:mt-4 sm:text-base sm:leading-snug">
            Daftar untuk simpan riwayat, kumpulkan XP, dan bandingkan skor di
            leaderboard.
          </p>
        </div>
      </motion.article>

      {demoFeatureTiles.map((feature, index) => {
        const Icon = feature.icon;
        const fromLeft = index % 2 === 0;

        return (
          <motion.article
            key={feature.title}
            className="flex min-h-0 flex-col rounded-2xl border border-border bg-muted p-5 transition-shadow duration-200 sm:p-6 hover:shadow-lg"
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
            variants={tileVariants}
            whileHover={
              reduce ? undefined : { y: -3, transition: { duration: 0.2 } }
            }
          >
            <motion.div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground sm:h-12 sm:w-12"
              whileHover={
                reduce
                  ? undefined
                  : {
                      rotate: fromLeft ? -5 : 5,
                      scale: 1.04,
                      transition: { type: "spring", stiffness: 400, damping: 20 },
                    }
              }
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            <div className="mt-8 flex flex-1 flex-col sm:mt-10">
              <h3 className="retro text-sm leading-relaxed text-muted-foreground sm:text-base">
                {feature.title}
              </h3>
              <p className="mt-3 text-pretty text-sm leading-snug text-muted-foreground sm:mt-4 sm:text-base sm:leading-snug">
                {feature.body}
              </p>
            </div>
          </motion.article>
        );
      })}

      <motion.article
        className="flex min-h-0 flex-col rounded-2xl border border-border bg-muted p-5 transition-shadow duration-200 sm:p-6 hover:shadow-lg lg:col-span-4"
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        variants={tileVariants}
        custom={4}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground sm:h-12 sm:w-12">
              <div className="relative size-6 sm:size-7">
                <Image
                  src={MARKETING_ASSETS.iconTrophy}
                  alt=""
                  fill
                  className="object-contain pixelated"
                  sizes="28px"
                />
              </div>
            </div>
            <div>
              <h3 className="retro text-sm leading-relaxed text-foreground sm:text-base">
                Tahu apa yang perlu diperbaiki
              </h3>
              <p className="mt-2 max-w-3xl text-pretty text-sm leading-snug text-muted-foreground sm:text-base">
                Setiap sesi kasih skor jelas. PixelAid hanya simulasi edukatif — bukan
                saran medis untuk pasien nyata.
              </p>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
