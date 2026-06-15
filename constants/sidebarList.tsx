import {
  LayoutDashboard,
  Users,
  School,
  PersonStanding,
  Landmark,
  Proportions,
  Image,
  Settings,
  LogOut,
  LucideIcon,
} from "lucide-react";

export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  href: string;
}

export const staffMenuItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/staff/dashboard",
  },
  {
    title: "Coach",
    icon: Users,
    href: "/staff/coach",
  },
  {
    title: "School",
    icon: School,
    href: "/staff/school",
  },
  {
    title: "Athlete",
    icon: PersonStanding,
    href: "/staff/athlete",
  },
  {
    title: "Media",
    icon: Image,
    href: "/staff/media",
  },
  {
    title: "Finance",
    icon: Landmark,
    href: "/staff/finance",
  },
  // {
  //   title: "Report Finance",
  //   icon: Proportions,
  //   href: "/staff/report",
  // },
];

export const staffSettingsItems: SidebarItem[] = [
  // {
  //   title: "Coach Settings",
  //   icon: Settings,
  //   href: "/staff/settings",
  // },
  {
    title: "Logout",
    icon: LogOut,
    href: "/logout",
  },
];

export const coachMenuItems: SidebarItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/coach/dashboard",
  },
  {
    title: "Athlete",
    icon: PersonStanding,
    href: "/coach/athlete",
  },
  {
    title: "Media",
    icon: Image,
    href: "/coach/media",
  },
];

export const coachSettingsItems: SidebarItem[] = [
  {
    title: "Logout",
    icon: LogOut,
    href: "/logout",
  },
];
