import { BgmProvider } from "@/components/audio/bgm-provider";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BgmProvider>{children}</BgmProvider>;
}
