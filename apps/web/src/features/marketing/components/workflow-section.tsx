"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  TechnicalCrosshairFrame,
  TechnicalFrameHorizontalRule,
} from "@/features/marketing/components/technical-crosshair-frame";
import { WorkflowCopyBlock } from "@/features/marketing/components/workflow-copy-block";
import { WorkflowDiagram } from "@/features/marketing/components/workflow-diagram";
import {
  WorkflowCaseBriefPreview,
  WorkflowScorePreview,
} from "@/features/marketing/components/workflow-preview-panel";
import {
  DEMO_CASE,
  MARKETING_ASSETS,
} from "@/features/marketing/marketing-assets";

const workflowTitleParts = ["Brief", "konsultasi", "quiz"] as const;

export function WorkflowSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="workflow"
      className="w-full scroll-mt-[72px] bg-background py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:py-5">
          <div className="min-w-0 max-w-2xl lg:max-w-[min(100%,40rem)]">
            <motion.p
              className="text-[15px] leading-snug text-muted-foreground sm:text-base"
              initial={
                reduce
                  ? false
                  : { opacity: 0, clipPath: "inset(100% 0 0 0)", y: 6 }
              }
              whileInView={{ opacity: 1, clipPath: "inset(0% 0 0 0)", y: 0 }}
              viewport={{ once: true, amount: 0.9 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              Cara main
            </motion.p>
            <h2 className="retro mt-3 max-w-[34rem] text-base leading-relaxed text-foreground sm:mt-4 sm:text-lg lg:text-xl">
              {workflowTitleParts.map((part, i) => (
                <span key={part}>
                  <motion.span
                    className="inline-block"
                    initial={
                      reduce
                        ? false
                        : {
                            opacity: 0,
                            x: i % 2 === 0 ? -40 : 40,
                            skewX: i === 1 ? 3 : 0,
                          }
                    }
                    whileInView={{ opacity: 1, x: 0, skewX: 0 }}
                    viewport={{ once: true, amount: 0.55 }}
                    transition={{
                      delay: i * 0.11,
                      type: "spring",
                      stiffness: 160,
                      damping: 24,
                      mass: 0.85,
                    }}
                  >
                    {part}
                  </motion.span>
                  {i < workflowTitleParts.length - 1 ? " " : null}
                </span>
              ))}
            </h2>
          </div>
          <motion.div
            initial={reduce ? false : { opacity: 0, rotate: 4, y: 16 }}
            whileInView={{ opacity: 1, rotate: 0, y: 0 }}
            viewport={{ once: true, amount: 0.85 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 16,
              delay: reduce ? 0 : 0.28,
            }}
            whileHover={reduce ? undefined : { rotate: -0.6, scale: 1.02 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            <Button
              asChild
              variant="outline"
              className="h-10 w-fit shrink-0 rounded-full px-5 text-sm shadow-sm sm:h-11 sm:px-6 sm:text-base"
            >
              <Link href="/app/onboarding">Panduan singkat</Link>
            </Button>
          </motion.div>
        </div>

        <div className="relative -mx-4 mt-10 w-[calc(100%+2rem)] overflow-visible sm:-mx-6 sm:mt-12 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:mt-14 lg:w-[calc(100%+4rem)]">
          <TechnicalCrosshairFrame contentClassName="">
            <>
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 pb-10 pt-8 sm:pb-12 sm:pt-10 lg:grid-cols-2 lg:items-start lg:gap-x-14 lg:gap-y-0 lg:pb-14 lg:pt-12 xl:gap-x-20">
                  <motion.div
                    initial={reduce ? false : { opacity: 0, x: -36, filter: "blur(6px)" }}
                    whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    viewport={{ once: true, amount: 0.25, margin: "0px 0px -8% 0px" }}
                    transition={{
                      type: "spring",
                      stiffness: 150,
                      damping: 24,
                    }}
                  >
                    <WorkflowCopyBlock
                      title="1. Brief kasus"
                      body="Baca keluhan dan triase pasien — tanpa spoiler diagnosis. Detail penting kamu gali lewat Talk dan rekam medis."
                      items={[
                        ["Keluhan", "Gambaran awal pasien"],
                        ["Triase", "Konteks klinis singkat"],
                        ["Mulai", "Timer konsultasi langsung jalan"],
                      ]}
                    />
                  </motion.div>
                  <motion.div
                    initial={reduce ? false : { opacity: 0, x: 40, y: 12 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.25, margin: "0px 0px -8% 0px" }}
                    transition={{
                      type: "spring",
                      stiffness: 170,
                      damping: 22,
                      delay: reduce ? 0 : 0.08,
                    }}
                  >
                    <WorkflowCaseBriefPreview
                      avatarSrc={MARKETING_ASSETS.demoPatientAvatar}
                      patientName={DEMO_CASE.patientName}
                      patientAge={DEMO_CASE.patientAge}
                      specialist={DEMO_CASE.specialist}
                      chiefComplaint={DEMO_CASE.chiefComplaint}
                      triageNote={DEMO_CASE.triageNote}
                      difficulty={DEMO_CASE.difficulty}
                    />
                  </motion.div>
                </div>
              </div>

              <TechnicalFrameHorizontalRule />

              <div className="px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 py-10 sm:py-12 lg:grid-cols-2 lg:items-start lg:gap-x-14 lg:gap-y-0 lg:py-14 xl:gap-x-20">
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 48, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.22, margin: "0px 0px -10% 0px" }}
                    transition={{
                      type: "spring",
                      stiffness: 130,
                      damping: 22,
                      mass: 0.9,
                    }}
                  >
                    <WorkflowCopyBlock
                      title="2. Konsultasi"
                      body="Kamu jadi dokter virtual: ngobrol pakai suara, pilih pemeriksaan, buka rekam medis, lalu akhiri saat siap."
                      items={[
                        ["Talk", "Tekan sekali, bicara seperti di klinik"],
                        ["Examine", "Pilih pemeriksaan yang masuk akal"],
                        ["Timer", "Waktu terbatas, bisa perpanjang sekali"],
                      ]}
                    />
                  </motion.div>
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: -40, rotate: 1.2 }}
                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                    viewport={{ once: true, amount: 0.22, margin: "0px 0px -10% 0px" }}
                    transition={{
                      type: "spring",
                      stiffness: 180,
                      damping: 20,
                      delay: reduce ? 0 : 0.1,
                    }}
                  >
                    <WorkflowDiagram />
                  </motion.div>
                </div>
              </div>

              <TechnicalFrameHorizontalRule />

              <div className="px-4 sm:px-6 lg:px-8">
                <div className="grid gap-10 pb-8 pt-10 sm:pb-10 sm:pt-12 lg:grid-cols-2 lg:items-start lg:gap-x-14 lg:gap-y-0 lg:pb-12 lg:pt-14 xl:gap-x-20">
                  <motion.div
                    initial={
                      reduce ? false : { opacity: 0, x: 32, rotateZ: -2.5, skewX: 2 }
                    }
                    whileInView={{ opacity: 1, x: 0, rotateZ: 0, skewX: 0 }}
                    viewport={{ once: true, amount: 0.22, margin: "0px 0px -10% 0px" }}
                    transition={{
                      type: "spring",
                      stiffness: 110,
                      damping: 20,
                    }}
                  >
                    <WorkflowCopyBlock
                      title="3. Quiz & hasil"
                      body="Tebak diagnosis, dapat skor dan feedback. Daftar untuk simpan XP, riwayat, dan naik leaderboard."
                      items={[
                        ["Quiz", "Jawab diagnosis setelah konsultasi"],
                        ["Skor", "Anamnesis, pemeriksaan, RM, dan waktu"],
                        ["Progress", "XP, riwayat kasus, leaderboard"],
                      ]}
                    />
                  </motion.div>
                  <motion.div
                    initial={
                      reduce
                        ? false
                        : { opacity: 0, x: -28, scale: 0.96, filter: "contrast(0.92)" }
                    }
                    whileInView={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      filter: "contrast(1)",
                    }}
                    viewport={{ once: true, amount: 0.22, margin: "0px 0px -10% 0px" }}
                    transition={{
                      type: "spring",
                      stiffness: 155,
                      damping: 23,
                      delay: reduce ? 0 : 0.09,
                    }}
                  >
                    <WorkflowScorePreview
                      xp="+120 XP"
                      stars="★★★☆"
                      feedback="Gali riwayat asma dan alergi lebih sistematis sebelum penilaian risiko anestesi."
                      iconStarsSrc={MARKETING_ASSETS.iconStars}
                      iconTrophySrc={MARKETING_ASSETS.iconTrophy}
                    />
                  </motion.div>
                </div>
              </div>
            </>
          </TechnicalCrosshairFrame>
        </div>
      </div>
    </section>
  );
}
