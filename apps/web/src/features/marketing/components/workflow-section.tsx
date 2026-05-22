"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  TechnicalCrosshairFrame,
  TechnicalFrameHorizontalRule,
} from "@/features/marketing/components/technical-crosshair-frame";
import { WorkflowCodePanel } from "@/features/marketing/components/workflow-code-panel";
import { WorkflowCopyBlock } from "@/features/marketing/components/workflow-copy-block";
import { WorkflowDiagram } from "@/features/marketing/components/workflow-diagram";

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
                      body="Kamu dapat keluhan dan triase — tanpa spoiler diagnosis. Detail penting kamu cari sendiri."
                      items={[
                        ["Keluhan", "Gambaran awal pasien"],
                        ["Triase", "Seberapa urgent"],
                        ["Mulai", "Timer jalan"],
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
                    <WorkflowCodePanel
                      lines={[
                        <>
                          <span className="text-[#F05252]">pasien</span> ={" "}
                          <span className="text-[#315BA8]">&quot;Maya, 34 thn&quot;</span>
                        </>,
                        <>
                          <span className="text-[#F05252]">keluhan</span> ={" "}
                          <span className="text-[#315BA8]">
                            &quot;Nyeri dada sejak 2 jam&quot;
                          </span>
                        </>,
                        <>
                          <span className="text-[#F05252]">spesialis</span> ={" "}
                          <span className="text-[#315BA8]">&quot;Kardiologi&quot;</span>
                        </>,
                        <>
                          <span className="text-muted-foreground">
                            {"// detail → lewat Talk & RM"}
                          </span>
                        </>,
                        <>
                          <span className="text-[#F05252]">mulai</span>
                          <span className="text-[#315BA8]">_konsultasi</span>()
                        </>,
                      ]}
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
                      body="Ini inti permainannya: ngobrol, periksa, baca RM, lalu putuskan kapan selesai."
                      items={[
                        ["Talk", "Tekan sekali, langsung ngobrol"],
                        ["Examine", "Pilih pemeriksaan yang tepat"],
                        ["Timer", "Waktu terbatas, bisa perpanjang 1×"],
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
                      body="Jawab diagnosis, lihat skor, dan tahu apa yang bisa kamu perbaiki berikutnya."
                      items={[
                        ["Quiz", "Tebak diagnosis setelah konsultasi"],
                        ["Skor", "Anamnesis, pemeriksaan, RM, waktu"],
                        ["Progress", "XP, riwayat, leaderboard"],
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
                    <WorkflowCodePanel
                      lines={[
                        <>
                          <span className="text-[#F05252]">akhiri</span>
                          <span className="text-[#315BA8]">_konsultasi</span>()
                        </>,
                        <>
                          <span className="text-[#F05252]">jawab</span>
                          <span className="text-[#315BA8]">_quiz</span>(
                          <span className="text-[#315BA8]">&quot;STEMI suspect&quot;</span>)
                        </>,
                        <>
                          <span className="text-[#F05252]">hasil</span> = {"{"}
                        </>,
                        <>
                          {"  "}xp: <span className="text-[#315BA8]">+120</span>,
                        </>,
                        <>
                          {"  "}bintang: <span className="text-[#315BA8]">3</span>,
                        </>,
                        <>
                          {"  "}feedback:{" "}
                          <span className="text-[#315BA8]">
                            &quot;Cek alergi lebih awal&quot;
                          </span>
                        </>,
                        <>{"}"}</>,
                      ]}
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
