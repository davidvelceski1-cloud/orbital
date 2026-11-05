import { CalendarClock, Compass, GraduationCap, MessageCircle, Rocket, Scale, LayoutDashboard, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/ask", label: "Ask", icon: MessageCircle },
  { href: "/compare", label: "Compare", icon: Scale },
  { href: "/learn", label: "Learn", icon: GraduationCap },
  { href: "/sky", label: "Tonight's Sky", icon: CalendarClock },
  { href: "/missions", label: "Missions", icon: Rocket },
];

export const DASHBOARD_ITEM: NavItem = { href: "/dashboard", label: "My space", icon: LayoutDashboard };
