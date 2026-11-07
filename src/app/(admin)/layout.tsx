"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  LayoutDashboard,
  Briefcase,
  Image,
  MessageSquare,
  BookOpen,
  Package,
  FileText,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "@supabase/supabase-js";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/devis", label: "Devis", icon: FileText },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/realisations", label: "Réalisations", icon: Image },
  { href: "/admin/temoignages", label: "Témoignages", icon: MessageSquare },
  { href: "/admin/knowledge-base", label: "Base IA", icon: BookOpen },
  { href: "/admin/catalogue", label: "Catalogue", icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // trailingSlash: usePathname() renvoie "/admin/login/", pas "/admin/login"
  const pathname = usePathname().replace(/\/$/, "");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Compteur temps réel des devis "nouveau"
  useEffect(() => {
    if (!session) return;
    const count = () =>
      supabase.from("devis").select("id", { count: "exact", head: true }).eq("statut", "nouveau").then(({ count }) => setUnread(count ?? 0));
    count();
    const ch = supabase.channel("devis-badge").on("postgres_changes", { event: "*", schema: "public", table: "devis" }, count).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [session]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (!data.session && pathname !== "/admin/login") {
        router.replace("/admin/login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s && pathname !== "/admin/login") router.replace("/admin/login");
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-navy border-t-transparent" />
      </div>
    );
  }

  if (!session && pathname !== "/admin/login") return null;
  if (pathname === "/admin/login") return <>{children}</>;

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-56 bg-brand-navy text-white flex flex-col transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <Link href="/admin/dashboard" className="text-xl font-black">
            <span className="text-brand-gold">SOL</span>-CHIC
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-brand-gold text-brand-navy"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {href === "/admin/devis" && unread > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 text-xs text-white">{unread}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-3">{session?.user.email}</p>
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white w-full"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 md:ml-56">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-200 px-4 h-14 flex items-center md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-brand-navy" />
          </button>
          <span className="ml-3 font-bold text-brand-navy">Administration</span>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
