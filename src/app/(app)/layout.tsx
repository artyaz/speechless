import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { AppSidebar } from "~/components/layout/app-sidebar";
import { MobileNav } from "~/components/layout/mobile-nav";
import { Header } from "~/components/layout/header";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0">
        <AppSidebar user={session.user} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-60">
        <Header user={session.user} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-6">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
