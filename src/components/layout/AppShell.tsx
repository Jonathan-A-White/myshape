import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toast } from "@/components/feedback/Toast";

export function AppShell() {
  return (
    <div className="flex min-h-full flex-col bg-surface dark:bg-gray-900">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <Toast />
      <BottomNav />
    </div>
  );
}
