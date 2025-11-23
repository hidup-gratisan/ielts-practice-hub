import { Home, Headphones, BookOpen, PenTool, Mic, Trophy, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Listening", url: "/listening", icon: Headphones },
  { title: "Reading", url: "/reading", icon: BookOpen },
  { title: "Writing", url: "/writing", icon: PenTool },
  { title: "Speaking", url: "/speaking", icon: Mic },
  { title: "My Progress", url: "/progress", icon: Trophy },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-foreground">IELTS Prep</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              activeClassName="bg-sidebar-accent font-medium"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}
