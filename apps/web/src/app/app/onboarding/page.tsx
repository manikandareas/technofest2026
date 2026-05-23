"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { HOME_ASSETS } from "@/components/home/home-assets";
import { Button } from "@/components/ui/8bit";
import {
  Stethoscope,
  MessageSquare,
  Heart,
  Trophy,
  Sparkles,
  Coins,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  FileSpreadsheet,
  Mars,
  Venus,
} from "lucide-react";
import { completeOnboarding, type OnboardingGender } from "./actions";

const GENDER_OPTIONS: Array<{
  value: OnboardingGender;
  label: string;
  description: string;
  accentClass: string;
  borderClass: string;
  image: string;
  icon: typeof Mars;
}> = [
  {
    value: "male",
    label: "Pria",
    description: "Karakter dokter pria",
    accentClass: "text-sky-500",
    borderClass: "border-sky-500",
    image: "/assets/patients/raka/avatar.png",
    icon: Mars,
  },
  {
    value: "female",
    label: "Perempuan",
    description: "Karakter dokter perempuan",
    accentClass: "text-rose-500",
    borderClass: "border-rose-500",
    image: "/assets/patients/nadia/avatar.png",
    icon: Venus,
  },
];

// Onboarding slides definition
const ONBOARDING_SLIDES = [
  {
    id: "welcome",
    title: "SELAMAT DATANG",
    shortTitle: "WELCOME",
    badge: "PIXELAID",
    doctorSpeech: "Selamat datang di PixelAid, rekan sejawat! Saya Dr. Pixel. Mari kita pelajari alur simulasi medis interaktif di bawah bimbingan saya agar Anda siap merawat pasien hari ini.",
    content: "PixelAid dirancang khusus untuk melatih proses berpikir kritis dokter dalam penanganan pasien nyata. Anda akan diuji mulai dari komunikasi empati, ketepatan diagnosis, hingga terapi klinis berbasis bukti.",
    icon: Sparkles,
    iconColor: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent",
  },
  {
    id: "talk",
    title: "1. TALK (KONSULTASI)",
    shortTitle: "KONSULTASI",
    badge: "TAHAP 1",
    doctorSpeech: "Komunikasi adalah kunci utama! Gali keluhan pasien sedalam mungkin, temukan kronologinya, dan perhatikan tanda bahaya (red flags) yang mungkin tersembunyi.",
    content: "Tanyakan keluhan utama, kronologi perjalanan penyakit, riwayat kesehatan dahulu, faktor risiko, dan perhatikan red flags (tanda bahaya) medis. Komunikasi empati yang baik akan membuka informasi penting dari pasien!",
    icon: MessageSquare,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary",
  },
  {
    id: "examine",
    title: "2. EXAMINE (PEMERIKSAAN)",
    shortTitle: "PEMERIKSAAN",
    badge: "TAHAP 2",
    doctorSpeech: "Gunakan penilaian klinis Anda untuk memilih pemeriksaan penunjang yang efisien. Ingat, dokter! Setiap pemeriksaan membutuhkan waktu dan biaya koin simulasi.",
    content: "Pilih pemeriksaan klinis awal yang relevan untuk kasus pasien. Anda dapat memilih pemeriksaan fisik, laboratorium, atau radiologi. Setiap keputusan memerlukan estimasi waktu dan biaya koin simulasi!",
    icon: Stethoscope,
    iconColor: "text-sky-500",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500",
  },
  {
    id: "quiz",
    title: "3. QUIZ (DIAGNOSIS)",
    shortTitle: "DIAGNOSIS",
    badge: "TAHAP 3",
    doctorSpeech: "Tantang ketajaman analisis Anda! Kunci diagnosis kerja yang paling tepat serta pilih tindakan penanganan awal medis untuk menyelamatkan pasien.",
    content: "Kunci diagnosis kerja dan keputusan awal setelah konsultasi selesai. Anda akan menjawab pertanyaan-pertanyaan klinis berbasis bukti (EBM) untuk membuktikan ketepatan keputusan medis Anda!",
    icon: HelpCircle,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500",
  },
  {
    id: "feedback",
    title: "4. FEEDBACK (EVALUASI)",
    shortTitle: "EVALUASI",
    badge: "HASIL AKHIR",
    doctorSpeech: "Belajarlah dari setiap kasus! Tinjau analisis performa klinis Anda secara mendalam, kumpulkan XP, dan mari puncaki papan peringkat nasional.",
    content: "Lihat skor akurasi diagnosis Anda, perolehan XP untuk naik tingkat di papan peringkat (Leaderboard), serta analisis detail mengenai area penanganan yang perlu diperbaiki. Teruslah berlatih!",
    icon: Trophy,
    iconColor: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent",
  },
  {
    id: "gender",
    title: "PILIH KARAKTER",
    shortTitle: "GENDER",
    badge: "PROFIL",
    doctorSpeech: "Sebelum masuk simulasi, pilih karakter yang paling sesuai untuk profil Anda. Pilihan ini akan tersimpan di data profil PixelAid.",
    content: "Pilih karakter pria atau perempuan untuk melengkapi profil dokter Anda.",
    icon: Heart,
    iconColor: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500",
  },
];

interface TerminalScannerProps {
  borderColor: string;
  colorClass: string;
  children: React.ReactNode;
}

function TerminalScanner({ borderColor, colorClass, children }: TerminalScannerProps) {
  return (
    <div className={cn(
      "relative flex items-center justify-center size-36 md:size-40 border-4 bg-black/95 overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,0.15)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.4)] rounded-none group select-none",
      borderColor
    )}>
      {/* Outer CRT glass shine border */}
      <div className="absolute inset-0.5 border border-white/5 pointer-events-none" />

      {/* Retro scanline grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '10px 10px',
        }}
      />

      {/* CRT Scanline horizontal stripes */}
      <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-20" />

      {/* Sweeping radar scanner line */}
      <div 
        className={cn("absolute inset-x-0 h-1 pointer-events-none opacity-40 shadow-[0_0_8px_currentColor]", colorClass)}
        style={{
          animation: "sweep 4s linear infinite",
          background: "linear-gradient(to bottom, transparent, currentColor, transparent)",
        }}
      />

      {/* Oscilloscope or ambient pulse waves */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <div className={cn("size-24 border-2 rounded-full animate-ping", borderColor)} style={{ animationDuration: '3s' }} />
        <div className={cn("size-32 border border-dashed rounded-full animate-spin", borderColor)} style={{ animationDuration: '20s' }} />
      </div>

      {/* Terminal decorative UI elements */}
      <div className={cn("absolute top-2 left-2 size-2 border-t-2 border-l-2", borderColor)} />
      <div className={cn("absolute top-2 right-2 size-2 border-t-2 border-r-2", borderColor)} />
      <div className={cn("absolute bottom-2 left-2 size-2 border-b-2 border-l-2", borderColor)} />
      <div className={cn("absolute bottom-2 right-2 size-2 border-b-2 border-r-2", borderColor)} />

      {/* Status readout */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 font-mono text-[0.45rem] font-bold tracking-widest text-white/45">
        DIAGNOSTIC SCREEN
      </div>

      {/* Floating Center Icon/Animation */}
      <div className="relative z-10 transform transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
        {children}
      </div>

      {/* System info bar at bottom */}
      <div className="absolute bottom-1 right-2 flex items-center gap-1 font-mono text-[0.45rem] font-bold text-white/30">
        <span className="size-1 bg-emerald-500 rounded-full animate-pulse" />
        SYS_OK
      </div>
    </div>
  );
}

type GenderChoiceGridProps = {
  selectedGender: OnboardingGender | null;
  onSelect: (gender: OnboardingGender) => void;
  compact?: boolean;
};

function GenderChoiceGrid({ selectedGender, onSelect, compact = false }: GenderChoiceGridProps) {
  return (
    <div className={cn("grid w-full grid-cols-2", compact ? "gap-2.5" : "gap-4")}>
      {GENDER_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = selectedGender === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={selected}
            className={cn(
              "group relative flex flex-col items-center border-2 bg-card/90 text-center transition-all duration-200",
              compact ? "min-h-[168px] p-2.5" : "min-h-[230px] p-4",
              selected
                ? cn(option.borderClass, "shadow-[4px_4px_0_rgba(0,0,0,0.18)] -translate-y-0.5")
                : "border-primary/35 hover:border-primary hover:bg-card"
            )}
          >
            <div className="pointer-events-none absolute inset-0.5 border border-white/10" />
            <div
              className={cn(
                "absolute right-2 top-2 flex items-center gap-1 border px-1.5 py-0.5 font-mono text-[0.5rem] font-bold uppercase",
                selected ? cn(option.borderClass, option.accentClass, "bg-background/80") : "border-primary/25 text-muted-foreground"
              )}
            >
              <Icon className="size-3" />
              {selected ? "SELECTED" : "PICK"}
            </div>
            <div className={cn("relative mt-4 overflow-hidden rounded-none border bg-background/70", compact ? "size-20" : "size-28", selected ? option.borderClass : "border-primary/20")}>
              <Image
                src={option.image}
                alt={option.description}
                fill
                className="object-contain pixelated transition-transform duration-200 group-hover:scale-105"
                sizes={compact ? "80px" : "112px"}
              />
            </div>
            <div className={cn("mt-3 space-y-1", compact ? "mt-2" : "mt-4")}>
              <p className={cn("retro font-bold uppercase tracking-wider", compact ? "text-[0.6rem]" : "text-xs", selected ? option.accentClass : "text-foreground")}>
                {option.label}
              </p>
              <p className={cn("leading-relaxed text-muted-foreground", compact ? "text-[0.625rem]" : "text-xs")}>
                {option.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function OnboardingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedGender, setSelectedGender] = useState<OnboardingGender | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentSlide = ONBOARDING_SLIDES[activeSlide];
  const isGenderSlide = currentSlide.id === "gender";
  const isLastSlide = activeSlide === ONBOARDING_SLIDES.length - 1;
  const requiresGender = isGenderSlide || isLastSlide;
  const disableNext = isPending || (requiresGender && !selectedGender);

  const handleNext = () => {
    setError(null);
    if (isGenderSlide && !selectedGender) {
      return;
    }
    if (activeSlide < ONBOARDING_SLIDES.length - 1) {
      setActiveSlide((prev) => prev + 1);
    } else {
      if (!selectedGender) {
        return;
      }
      startTransition(async () => {
        try {
          const result = await completeOnboarding(selectedGender);
          if (result?.error) {
            setError(result.error);
          }
        } catch (caught) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Onboarding belum bisa diselesaikan. Coba lagi.",
          );
        }
      });
    }
  };

  const handleBack = () => {
    if (activeSlide > 0) {
      setActiveSlide((prev) => prev - 1);
    }
  };

  return (
    <div className="relative min-h-dvh w-full bg-background text-foreground overflow-x-hidden">
      {/* Dynamic Scoped Keyframes and Animations style */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sweep {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bg-scanlines {
          background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.25),
            rgba(0, 0, 0, 0.25) 1px,
            transparent 1px,
            transparent 3px
          );
        }
      ` }} />

      {/* Specialists Theme Scene Background */}
      <div className="pointer-events-none fixed inset-0">
        <Image
          src={HOME_ASSETS.sceneBgMobile}
          alt=""
          fill
          priority
          className="object-cover object-center pixelated lg:hidden"
          sizes="100vw"
        />
        <Image
          src={HOME_ASSETS.sceneBgDesktop}
          alt=""
          fill
          priority
          className="hidden object-cover object-center pixelated lg:block"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/45 lg:from-background/10 lg:to-background/30"
        />
      </div>

      <main className="relative mx-auto flex min-h-dvh w-full max-w-[393px] flex-col md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
        {/* Onboarding Header with Floating Brand Logo */}
        <header className="relative z-20 shrink-0 px-3 pb-2 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-4 sm:pb-3 md:px-6 lg:px-8 lg:pb-4 lg:pt-10 flex flex-col items-center justify-center gap-3">
          <div className="relative size-16 md:size-20 animate-[logoFloat_4.5s_ease-in-out_infinite] select-none pointer-events-none filter drop-shadow-[0_4px_6px_rgba(16,185,129,0.25)]">
            <Image
              src="/logo.png"
              alt="PixelAid Logo"
              fill
              className="object-contain pixelated"
              priority
            />
          </div>
          <div className="grid grid-cols-[1fr] items-center gap-2 w-full">
            <h1 className="retro text-center text-[0.6875rem] leading-tight text-foreground drop-shadow-[1px_1px_0_var(--border)] sm:text-xs md:text-sm lg:text-base xl:text-lg uppercase tracking-wider">
              PIXELAID SIMULATION TUTORIAL
            </h1>
          </div>
        </header>

        {/* Specialists style Content Panel */}
        <section className="relative z-10 flex-1 flex flex-col justify-between px-3 pb-6 sm:px-4 md:px-6 lg:px-8 xl:px-10 gap-4 w-full">
          
          {/* Mobile Layout (Stacked) */}
          <div className="md:hidden flex flex-col justify-between flex-1 gap-4">
            {/* Dr. Pixel Dialogue Box (Mobile, borderless background approach) */}
            <div className="relative border-2 border-primary bg-card/90 p-3.5 flex gap-3.5 items-center shadow-[3px_3px_0_rgba(0,0,0,0.15)] shrink-0">
              <div className="pointer-events-none absolute inset-0.5 border border-primary/10" aria-hidden="true" />
              
              <div className="relative size-10 shrink-0 rounded-full overflow-hidden border border-primary/30 bg-primary/5">
                <Image
                  src={HOME_ASSETS.doctorCharacter}
                  alt="Dr. Pixel"
                  fill
                  className="object-cover object-[top_center] scale-125 translate-y-0.5 pixelated"
                />
              </div>
              
              <div className="flex-1 space-y-0.5 text-left min-w-0">
                <p className="retro text-[0.55rem] font-bold text-accent tracking-widest">
                  DR. PIXEL
                </p>
                <p key={activeSlide} className="text-[0.6875rem] leading-relaxed text-foreground font-medium animate-[fadeIn_0.3s_ease-out]">
                  {currentSlide.doctorSpeech}
                </p>
              </div>
            </div>

            {/* Main Interactive Slide Panel (Mobile, completely open sleek console, no cards!) */}
            <div className="flex-1 flex flex-col justify-between py-2">
              
              {/* Header Info Banner */}
              <div className="border-b border-primary/25 pb-2 flex flex-row justify-between items-center w-full shrink-0">
                <div className="retro text-[0.625rem] text-foreground flex items-center gap-1.5 uppercase font-bold">
                  <currentSlide.icon className={cn("size-4", currentSlide.iconColor)} />
                  {currentSlide.title}
                </div>
                <span className={cn("inline-flex items-center gap-1 border px-1.5 py-0.5 text-[0.45rem] font-bold uppercase leading-none retro", currentSlide.borderColor, currentSlide.bgColor, currentSlide.iconColor)}>
                  {currentSlide.badge}
                </span>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col justify-center items-center gap-4 py-4 w-full">
                {/* Visual Scanner */}
                <div className="shrink-0 flex w-full justify-center">
                  {isGenderSlide ? (
                    <GenderChoiceGrid
                      compact
                      selectedGender={selectedGender}
                      onSelect={setSelectedGender}
                    />
                  ) : (
                    <TerminalScanner
                      borderColor={currentSlide.borderColor}
                      colorClass={currentSlide.iconColor}
                    >
                    {currentSlide.id === "welcome" && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute size-20 border border-accent/20 border-dashed rounded-full animate-spin" style={{ animationDuration: "12s" }} />
                        <svg className="absolute size-16 text-accent/35 animate-pulse" viewBox="0 0 100 100" fill="none">
                          <path d="M0,50 L35,50 L40,30 L45,70 L50,55 L55,50 L100,50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <Heart className="size-12 text-accent animate-pulse relative z-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        <Sparkles className="absolute -top-2 -right-2 size-5 text-accent animate-bounce" />
                      </div>
                    )}
                    {currentSlide.id === "talk" && (
                      <div className="relative flex flex-col items-center justify-center gap-2">
                        <MessageSquare className="size-12 text-primary animate-[float_4s_ease-in-out_infinite] drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <div className="flex gap-1 items-end h-4 justify-center">
                          <div className="w-1 bg-primary/70 rounded-t animate-[pulse_0.6s_infinite_alternate]" style={{ height: "40%" }} />
                          <div className="w-1 bg-primary/90 rounded-t animate-[pulse_0.9s_infinite_alternate]" style={{ height: "80%" }} />
                          <div className="w-1 bg-primary/50 rounded-t animate-[pulse_0.5s_infinite_alternate]" style={{ height: "30%" }} />
                          <div className="w-1 bg-primary/95 rounded-t animate-[pulse_1.1s_infinite_alternate]" style={{ height: "95%" }} />
                          <div className="w-1 bg-primary/60 rounded-t animate-[pulse_0.7s_infinite_alternate]" style={{ height: "50%" }} />
                        </div>
                      </div>
                    )}
                    {currentSlide.id === "examine" && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute size-20 border border-sky-500/30 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
                        <div className="absolute size-16 border border-sky-500/40 rounded-full" />
                        <div className="absolute size-20 border border-sky-500/10 rounded-full overflow-hidden">
                          <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-sky-500 origin-left animate-spin" style={{ animationDuration: "3s" }} />
                        </div>
                        <Stethoscope className="size-12 text-sky-400 animate-[float_5s_ease-in-out_infinite] relative z-10 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
                        <div className="absolute -bottom-3 bg-sky-950/70 border border-sky-500/50 px-1.5 py-0.5 text-[0.45rem] font-bold text-sky-400 font-mono flex items-center gap-0.5 shadow-md">
                          <Coins className="size-2.5 text-sky-400 animate-spin" style={{ animationDuration: "6s" }} />
                          EST_COIN
                        </div>
                      </div>
                    )}
                    {currentSlide.id === "quiz" && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute size-20 border border-dashed border-purple-500/30 rounded-full animate-spin" style={{ animationDuration: "15s" }} />
                        <FileSpreadsheet className="size-12 text-purple-400 animate-[float_4.5s_ease-in-out_infinite] relative z-10 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                        <div className="absolute -bottom-3 right-1 flex items-center gap-0.5 bg-purple-950/70 border border-purple-500/50 px-1.5 py-0.5 text-[0.45rem] font-bold text-purple-400 font-mono shadow-md">
                          <CheckCircle2 className="size-2.5 text-purple-400 animate-pulse" />
                          EBM_CONFIRM
                        </div>
                      </div>
                    )}
                    {currentSlide.id === "feedback" && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute size-24 bg-accent/5 rounded-full blur-xl animate-pulse" />
                        <div className="absolute size-20 border-2 border-double border-accent/20 rounded-full animate-spin" style={{ animationDuration: "10s" }} />
                        <Trophy className="size-12 text-accent animate-[float_3.5s_ease-in-out_infinite] relative z-10 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        <Sparkles className="absolute -top-2 -right-2 size-5 text-accent animate-bounce" />
                        <div className="absolute -bottom-3 bg-amber-950/70 border border-accent/50 px-1.5 py-0.5 text-[0.45rem] font-bold text-accent font-mono flex items-center gap-0.5 shadow-md">
                          <Trophy className="size-2.5 text-accent" />
                          MAX_XP
                        </div>
                      </div>
                    )}
                    </TerminalScanner>
                  )}
                </div>

                {/* Info Text */}
                <div className="space-y-2 text-center max-w-[40ch]">
                  <p key={activeSlide} className="text-xs leading-relaxed text-foreground font-medium animate-[fadeIn_0.3s_ease-out]">
                    {currentSlide.content}
                  </p>
                  <div className="h-0.5 w-10 bg-primary/20 mx-auto rounded-full" />
                </div>
              </div>

              {/* Footer Controls & Navigation */}
              <div className="border-t border-primary/25 pt-3 flex flex-col gap-3 w-full shrink-0">
                {/* Step Indicators */}
                <div className="flex justify-center items-center gap-3 py-1">
                  {ONBOARDING_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setActiveSlide(idx)}
                      className="group relative flex flex-col items-center outline-none focus:outline-none"
                      aria-label={`Ke slide ${idx + 1}`}
                    >
                      <span
                        className={cn(
                          "size-2.5 border-2 transition-all duration-250 relative",
                          idx === activeSlide
                            ? "border-accent bg-accent scale-110 rotate-45 shadow-[2px_2px_0_rgba(0,0,0,0.15)]"
                            : "border-primary bg-secondary/15 hover:bg-primary/20"
                        )}
                      />
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div>
                    {activeSlide > 0 ? (
                      <Button
                        variant="secondary"
                        font="retro"
                        size="default"
                        onClick={handleBack}
                        disabled={isPending}
                        className="border-2 border-primary/50 text-foreground text-[0.625rem]"
                      >
                        <ArrowLeft className="size-3 mr-1" />
                        KEMBALI
                      </Button>
                    ) : (
                      <div className="w-1" />
                    )}
                  </div>

                  <div>
                    <Button
                      variant="default"
                      font="retro"
                      size="default"
                      onClick={handleNext}
                      disabled={disableNext}
                      className={cn(
                        "text-[0.625rem] text-primary-foreground",
                        isLastSlide ? "bg-accent! text-accent-foreground!" : "bg-primary!"
                      )}
                    >
                      {isPending ? (
                        "MEMPROSES..."
                      ) : isGenderSlide && !selectedGender ? (
                        "PILIH DULU"
                      ) : isLastSlide ? (
                        <>
                          MULAI SIMULASI
                          <Sparkles className="size-3.5 ml-1 animate-pulse" />
                        </>
                      ) : (
                        <>
                          LANJUT
                          <ArrowRight className="size-3.5 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {error ? (
                  <p className="rounded-xl border border-destructive/40 bg-background/95 px-3 py-2 text-center text-xs text-destructive">
                    {error}
                  </p>
                ) : null}
              </div>

            </div>
          </div>

          {/* Tablet & Desktop Layout (RPG Split-Screen Grid) */}
          <div className="hidden md:grid grid-cols-12 gap-8 items-stretch flex-1 min-h-[520px]">
            {/* Left Column: Dr. Pixel Sprite & Dialogue Guide Panel (5 cols) */}
            <div className="md:col-span-5 lg:col-span-5 flex flex-col gap-6 h-full justify-between items-center py-4">
              
              {/* Portrait Sprite Standing on background (No borders!) */}
              <div className="relative flex flex-col items-center justify-end flex-1 min-h-[220px] w-full group select-none">
                
                {/* Glowing emerald/mint aura beneath him */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-emerald-500/30 dark:bg-emerald-500/40 rounded-full blur-md filter animate-pulse" />
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-20 h-4 bg-emerald-400/20 dark:bg-emerald-400/30 rounded-full blur-sm" />

                {/* Dr. Pixel full-body character sprite */}
                <div className="relative w-44 h-56 lg:w-52 lg:h-64 animate-[float_4s_ease-in-out_infinite]">
                  <Image
                    src={HOME_ASSETS.doctorCharacter}
                    alt="Dr. Pixel"
                    fill
                    className="object-contain object-bottom pixelated"
                    priority
                  />
                  {/* Floating badge inside Sprite */}
                  <div className="absolute -top-2 -right-4 flex items-center gap-1.5 bg-black/85 px-2 py-0.5 border border-emerald-500/60 text-[0.55rem] font-bold text-emerald-400 font-mono shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                    <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    DR. PIXEL
                  </div>
                </div>
              </div>

              {/* Speech Bubble with custom pixel-art speech tail */}
              <div className="relative w-full border-2 border-primary bg-card/90 p-5 shadow-[4px_4px_0_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.3)] flex flex-col justify-center min-h-[140px] shrink-0">
                <div className="pointer-events-none absolute inset-0.5 border border-primary/10" aria-hidden="true" />
                
                {/* Pixel-art tail pointing up to character */}
                <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 flex flex-col items-center select-none pointer-events-none">
                  {/* Top tip */}
                  <div className="w-2.5 h-1 bg-primary" />
                  {/* Middle row */}
                  <div className="w-5 h-1 bg-card border-x-2 border-primary" />
                  {/* Base row */}
                  <div className="w-7.5 h-1 bg-card border-x-2 border-primary" />
                </div>

                <div className="space-y-1">
                  <p className="retro text-[0.625rem] font-bold text-accent tracking-widest uppercase">
                    Dr. Pixel
                  </p>
                  <p key={activeSlide} className="text-xs lg:text-sm leading-relaxed text-foreground font-medium animate-[fadeIn_0.3s_ease-out]">
                    {currentSlide.doctorSpeech}
                  </p>
                </div>
              </div>

            </div>

            {/* Right Column: Sleek Open Terminal Console (7 cols, no cards!) */}
            <div className="md:col-span-7 lg:col-span-7 flex flex-col h-full py-4 justify-between">
              
              {/* Sleek Elegant Header Divider */}
              <div className="border-b-2 border-primary/20 pb-3 flex flex-row justify-between items-center w-full shrink-0">
                <div className="retro text-xs lg:text-sm text-foreground flex items-center gap-2 uppercase font-bold">
                  <currentSlide.icon className={cn("size-5", currentSlide.iconColor)} />
                  {currentSlide.title}
                </div>
                <span className={cn("inline-flex items-center gap-1 border px-2 py-0.5 text-[0.55rem] font-mono font-bold uppercase leading-none retro relative", currentSlide.borderColor, currentSlide.bgColor, currentSlide.iconColor)}>
                  {currentSlide.badge}
                </span>
              </div>

              {/* Sleek Middle Visual and Text Area */}
              <div className="flex-1 flex flex-col justify-center items-center gap-6 py-6 w-full">
                {/* Visual Medical Scanner Box */}
                <div className="shrink-0 flex w-full justify-center">
                  {isGenderSlide ? (
                    <GenderChoiceGrid
                      selectedGender={selectedGender}
                      onSelect={setSelectedGender}
                    />
                  ) : (
                    <TerminalScanner
                      borderColor={currentSlide.borderColor}
                      colorClass={currentSlide.iconColor}
                    >
                    {currentSlide.id === "welcome" && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute size-24 border-2 border-accent/20 border-dashed rounded-full animate-spin" style={{ animationDuration: "12s" }} />
                        <svg className="absolute size-20 text-accent/35 animate-pulse" viewBox="0 0 100 100" fill="none">
                          <path d="M0,50 L35,50 L40,30 L45,70 L50,55 L55,50 L100,50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <Heart className="size-16 text-accent animate-pulse relative z-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        <Sparkles className="absolute -top-3 -right-3 size-6 text-accent animate-bounce" />
                      </div>
                    )}
                    {currentSlide.id === "talk" && (
                      <div className="relative flex flex-col items-center justify-center gap-3">
                        <MessageSquare className="size-16 text-primary animate-[float_4s_ease-in-out_infinite] drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        <div className="flex gap-1 items-end h-5 justify-center">
                          <div className="w-1 bg-primary/70 rounded-t animate-[pulse_0.6s_infinite_alternate]" style={{ height: "40%" }} />
                          <div className="w-1 bg-primary/90 rounded-t animate-[pulse_0.9s_infinite_alternate]" style={{ height: "80%" }} />
                          <div className="w-1 bg-primary/50 rounded-t animate-[pulse_0.5s_infinite_alternate]" style={{ height: "30%" }} />
                          <div className="w-1 bg-primary/95 rounded-t animate-[pulse_1.1s_infinite_alternate]" style={{ height: "95%" }} />
                          <div className="w-1 bg-primary/60 rounded-t animate-[pulse_0.7s_infinite_alternate]" style={{ height: "50%" }} />
                        </div>
                      </div>
                    )}
                    {currentSlide.id === "examine" && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute size-24 border border-sky-500/30 rounded-full animate-ping" style={{ animationDuration: "3s" }} />
                        <div className="absolute size-20 border border-sky-500/40 rounded-full" />
                        <div className="absolute size-24 border border-sky-500/10 rounded-full overflow-hidden">
                          <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-sky-500 origin-left animate-spin" style={{ animationDuration: "3s" }} />
                        </div>
                        <Stethoscope className="size-16 text-sky-400 animate-[float_5s_ease-in-out_infinite] relative z-10 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
                        <div className="absolute -bottom-4 bg-sky-950/70 border border-sky-500/50 px-2 py-0.5 text-[0.55rem] font-bold text-sky-400 font-mono flex items-center gap-1 shadow-md">
                          <Coins className="size-3 text-sky-400 animate-spin" style={{ animationDuration: "6s" }} />
                          EST_COIN
                        </div>
                      </div>
                    )}
                    {currentSlide.id === "quiz" && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute size-24 border border-dashed border-purple-500/30 rounded-full animate-spin" style={{ animationDuration: "15s" }} />
                        <FileSpreadsheet className="size-16 text-purple-400 animate-[float_4.5s_ease-in-out_infinite] relative z-10 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                        <div className="absolute -bottom-4 right-1 flex items-center gap-1 bg-purple-950/70 border border-purple-500/50 px-2 py-0.5 text-[0.55rem] font-bold text-purple-400 font-mono shadow-md">
                          <CheckCircle2 className="size-3 text-purple-400 animate-pulse" />
                          EBM_CONFIRM
                        </div>
                      </div>
                    )}
                    {currentSlide.id === "feedback" && (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute size-28 bg-accent/5 rounded-full blur-xl animate-pulse" />
                        <div className="absolute size-24 border-2 border-double border-accent/20 rounded-full animate-spin" style={{ animationDuration: "10s" }} />
                        <Trophy className="size-16 text-accent animate-[float_3.5s_ease-in-out_infinite] relative z-10 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        <Sparkles className="absolute -top-3 -right-3 size-6 text-accent animate-bounce" />
                        <div className="absolute -bottom-4 bg-amber-950/70 border border-accent/50 px-2 py-0.5 text-[0.55rem] font-bold text-accent font-mono flex items-center gap-1 shadow-md">
                          <Trophy className="size-3 text-accent" />
                          MAX_XP
                        </div>
                      </div>
                    )}
                    </TerminalScanner>
                  )}
                </div>

                {/* Informational Text */}
                <div className="space-y-3 text-center max-w-[55ch]">
                  <p key={activeSlide} className="text-sm lg:text-base leading-relaxed text-foreground font-medium animate-[fadeIn_0.3s_ease-out]">
                    {currentSlide.content}
                  </p>
                  <div className="h-1 w-16 bg-primary/20 mx-auto rounded-full" />
                </div>
              </div>

              {/* Sleek Elegant Footer Divider with Slide Navigation Controls */}
              <div className="border-t-2 border-primary/20 pt-4 flex flex-col gap-4 w-full shrink-0">
                {/* Step Indicators */}
                <div className="flex justify-center items-center gap-4 py-1">
                  {ONBOARDING_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setActiveSlide(idx)}
                      className="group relative flex flex-col items-center outline-none focus:outline-none"
                      aria-label={`Ke slide ${idx + 1}`}
                    >
                      <span
                        className={cn(
                          "size-3.5 border-2 transition-all duration-250 relative",
                          idx === activeSlide
                            ? "border-accent bg-accent scale-110 rotate-45 shadow-[2px_2px_0_rgba(0,0,0,0.15)]"
                            : "border-primary bg-secondary/15 hover:bg-primary/20"
                        )}
                      />
                      <span className={cn(
                        "absolute top-7 retro text-[0.55rem] tracking-widest transition-opacity whitespace-nowrap uppercase font-bold",
                        idx === activeSlide ? "opacity-100 text-accent" : "opacity-0 group-hover:opacity-60 text-muted-foreground"
                      )}>
                        {slide.shortTitle}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Controller Buttons */}
                <div className="flex items-center justify-between gap-4 w-full pt-4">
                  <div>
                    {activeSlide > 0 ? (
                      <Button
                        variant="secondary"
                        font="retro"
                        size="default"
                        onClick={handleBack}
                        disabled={isPending}
                        className="border-2 border-primary/50 text-foreground text-xs"
                      >
                        <ArrowLeft className="size-4 mr-1" />
                        KEMBALI
                      </Button>
                    ) : (
                      <div className="w-1" />
                    )}
                  </div>

                  <div>
                    <Button
                      variant="default"
                      font="retro"
                      size="default"
                      onClick={handleNext}
                      disabled={disableNext}
                      className={cn(
                        "text-xs text-primary-foreground",
                        isLastSlide ? "bg-accent! text-accent-foreground!" : "bg-primary!"
                      )}
                    >
                      {isPending ? (
                        "MEMPROSES..."
                      ) : isGenderSlide && !selectedGender ? (
                        "PILIH DULU"
                      ) : isLastSlide ? (
                        <>
                          MULAI SIMULASI
                          <Sparkles className="size-4 ml-1 animate-pulse" />
                        </>
                      ) : (
                        <>
                          LANJUT
                          <ArrowRight className="size-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {error ? (
                  <p className="rounded-xl border border-destructive/40 bg-background/95 px-3 py-2 text-center text-sm text-destructive">
                    {error}
                  </p>
                ) : null}
              </div>

            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
