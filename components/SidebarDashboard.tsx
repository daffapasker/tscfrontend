"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { LogOut, ChevronDown, Settings, Menu } from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import useAuth from "@/hooks/useAuth"
import { authKey } from "@/keys/auth.key"
import authService from "@/services/auth.service"
import {
  staffMenuItems, staffSettingsItems,
  coachMenuItems, coachSettingsItems,
} from "@/constants/sidebarList"

// ✅ Komponen nav terpisah — BUKAN nested function di dalam render
// Ini mencegah remount setiap kali parent re-render
interface SidebarNavProps {
  menuItems: typeof staffMenuItems
  settingsItems: typeof staffSettingsItems
  pathname: string
  name: string
  email: string
  initials: string
  handleLogout: () => void
}

function SidebarNav({
  menuItems, settingsItems, pathname,
  name, email, initials, handleLogout,
}: SidebarNavProps) {
  return (
    // ✅ Gunakan div biasa, BUKAN komponen Sidebar dari shadcn
    // Sidebar butuh SidebarProvider context — tidak tersedia di dalam Sheet
    <div className="flex flex-col h-full border-r border-border/40 bg-background w-full">
      
      {/* Header */}
      <div className="px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 h-10 w-10 rounded-xl overflow-hidden ring-1 ring-border/50 shadow-sm">
              <Image src="/logo.jpeg" alt="TSC Logo" width={40} height={40} className="object-cover" />
            </div>
          </div>
          <div className="flex flex-col leading-none gap-0.5">
            <span className="text-[15px] font-semibold tracking-tight">
              <span className="text-violet-500">Trisula</span>{" "}
              <span className="text-emerald-500">Sport Club</span>
            </span>
            <span className="text-[11px] text-muted-foreground font-normal tracking-wide">
              Portal Akademik
            </span>
          </div>
        </Link>
      </div>

      <div className="h-px bg-border/40 mx-2" />

      {/* Menu utama */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Menu Utama
        </p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 h-9 rounded-lg px-3 text-[13.5px] font-normal transition-all duration-150",
                "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                isActive && [
                  "bg-violet-50 dark:bg-violet-950/40",
                  "text-violet-700 dark:text-violet-300",
                  "hover:bg-violet-50 dark:hover:bg-violet-950/40",
                  "font-medium",
                ]
              )}
            >
              <item.icon className={cn(
                "h-[17px] w-[17px] flex-shrink-0",
                isActive ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground/70"
              )} />
              <span>{item.title}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500 flex-shrink-0" />
              )}
            </Link>
          )
        })}

        {settingsItems.length > 0 && (
          <>
            <div className="h-px bg-border/40 my-3" />
            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Sistem
            </p>
            {settingsItems.map((item) => {
              const isActive = pathname === item.href
              const isLogout = item.href === "/logout"

              if (isLogout) {
                return (
                  <button
                    key={item.href}
                    onClick={handleLogout}
                    className={cn(
                      "w-full flex items-center gap-3 h-9 rounded-lg px-3 text-[13.5px] font-normal transition-all duration-150 cursor-pointer",
                      "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                    )}
                  >
                    <item.icon className="h-[17px] w-[17px] flex-shrink-0 text-red-600 dark:text-red-400" />
                    <span>{item.title}</span>
                  </button>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 h-9 rounded-lg px-3 text-[13.5px] font-normal transition-all duration-150",
                    "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    isActive && [
                      "bg-violet-50 dark:bg-violet-950/40",
                      "text-violet-700 dark:text-violet-300",
                      "font-medium",
                    ]
                  )}
                >
                  <item.icon className={cn(
                    "h-[17px] w-[17px] flex-shrink-0",
                    isActive ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground/70"
                  )} />
                  <span>{item.title}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                  )}
                </Link>
              )
            })}
          </>
        )}
      </div>

      {/* Footer / User dropdown */}
      <div className="px-2 pb-3 pt-2 border-t border-border/40">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "w-full flex items-center gap-3 rounded-xl px-3 py-2.5",
              "hover:bg-accent/60 transition-colors duration-150"
            )}>
              <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-violet-500/20">
                <AvatarImage src="/images/avatar.jpg" alt="User" />
                <AvatarFallback className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left min-w-0 flex-1">
                <span className="text-[13px] font-medium text-foreground leading-none mb-0.5">
                  {name}
                </span>
                <span className="text-[11px] text-muted-foreground leading-none truncate w-full">
                  {email}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end" side="top" sideOffset={8}
            className="w-56 rounded-xl border border-border/50 bg-popover shadow-lg p-1"
          >
            <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
              <Avatar className="h-7 w-7 ring-1 ring-border">
                <AvatarImage src="/images/avatar.jpg" alt="User" />
                <AvatarFallback className="bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-[10px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-medium text-foreground">{name}</span>
                <span className="text-[11px] text-muted-foreground truncate">{email}</span>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-border/40 my-1" />
            <DropdownMenuItem className="rounded-lg px-2 py-2 text-[13px] cursor-pointer gap-2.5">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Profil Saya</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40 my-1" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="rounded-lg px-2 py-2 text-[13px] cursor-pointer gap-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function DashboardSidebar() {
  const [isMobile, setIsMobile] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // ✅ Tutup sheet otomatis saat navigasi
  useEffect(() => {
    setSheetOpen(false)
  }, [pathname])

  const role = (user as any)?.role
  const menuItems = isLoading ? [] : role === "pelatih" ? coachMenuItems : role === "pengurus" ? staffMenuItems : []
  const settingsItems = isLoading ? [] : role === "pelatih" ? coachSettingsItems : role === "pengurus" ? staffSettingsItems : []
  const name = isLoading ? "Memuat..." : (user as any)?.name || (user as any)?.username || "User TSC"
  const email = isLoading ? "..." : (user as any)?.email ?? `${name.toLowerCase().replace(/\s+/g, "")}@tsc.id`
  const initials = isLoading
    ? "..."
    : name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "US"

  const handleLogout = async () => {
    try {
      await authService.logout()
      queryClient.setQueryData(authKey.me(), null)
      router.push("/login")
    } catch (err) {
      console.error(err)
    }
  }

  const navProps = { menuItems, settingsItems, pathname, name, email, initials, handleLogout }

  if (isMobile) {
    return (
      <>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          {/* ✅ SheetContent langsung render SidebarNav — tidak ada Sidebar wrapper */}
          <SheetContent side="left" className="p-0 w-[280px]">
            <SidebarNav {...navProps} />
          </SheetContent>
        </Sheet>
        <div className="h-16" />
      </>
    )
  }

  return (
    <div className="hidden lg:flex w-[240px] h-screen sticky top-0 flex-shrink-0">
      <SidebarNav {...navProps} />
    </div>
  )
}