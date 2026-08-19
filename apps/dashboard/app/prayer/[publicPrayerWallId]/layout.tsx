import { ToastProvider } from "../../../components/ui/Toast";

/**
 * Every page under here was rendering with no ToastProvider ancestor at all --
 * MyPrayerRequestList and PrayerWallList's action handlers (pray, mark answered,
 * toggle public/anonymous) had nowhere to surface an error if one occurred, same gap
 * this session already fixed on the dashboard side. Matches (marketing)/layout.tsx
 * and (dashboard)/layout.tsx's own use of ToastProvider -- this route group just
 * never had a layout.tsx at all until now.
 */
export default function PublicPrayerWallLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
