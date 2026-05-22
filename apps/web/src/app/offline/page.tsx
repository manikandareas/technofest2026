import { PageShell } from "@/components/page-shell";

export default function OfflinePage() {
  return (
    <PageShell
      eyebrow="Offline"
      title="Koneksi tidak tersedia"
      description="PWA fallback route untuk halaman yang tidak bisa diambil saat offline."
      primaryHref="/app/home"
      primaryLabel="Coba lagi"
    />
  );
}
