import { AnnouncementBar } from "../../components/marketing/AnnouncementBar";
import { Header } from "../../components/marketing/Header";
import { Footer } from "../../components/marketing/Footer";
import { ToastProvider } from "../../components/ui/Toast";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
