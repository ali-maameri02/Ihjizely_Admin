import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarProvider as RawSidebarProvider } from "@/components/ui/sidebar";

// Cast it to a standard div-based provider
const SidebarProvider = RawSidebarProvider as React.FC<React.HTMLAttributes<HTMLDivElement> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

export function ProtectedLayout({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex flex-col bg-white pt-16 px-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}