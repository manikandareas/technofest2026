import { BgmProvider } from "@/components/audio/bgm-provider";

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <BgmProvider>{children}</BgmProvider>;
}
