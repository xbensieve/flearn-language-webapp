import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  UserCheck,
  ChevronLeft,
  GraduationCap,
  ClipboardCheck,
  UserCircle,
  XCircle,
} from "lucide-react";
import { useSidebarStore } from "@/hooks/useSidebar";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
  { to: "/dashboard/applications", icon: UserCheck, label: "Đơn đăng ký" },
  { to: "/dashboard/courses", icon: BookOpen, label: "Khóa học" },
  {
    to: "/dashboard/exercise-grading",
    icon: ClipboardCheck,
    label: "Chấm điểm bài tập",
  },
  {
    to: "/dashboard/cancellation-requests",
    icon: XCircle,
    label: "Yêu cầu hủy",
  },
  { to: "/dashboard/profile", icon: UserCircle, label: "Hồ sơ" },
];

export const Sidebar = () => {
  const { isOpen, toggle } = useSidebarStore();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-surface border-r border-border transition-all duration-300 z-40",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            {isOpen && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-blue-500" />
                <span className="font-sans font-semibold text-2xl text-blue-500 ">
                  FLearn
                </span>
              </div>
            )}
            <button
              onClick={toggle}
              className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft
                className={cn(
                  "h-5 w-5 transition-transform",
                  !isOpen && "rotate-180"
                )}
              />
            </button>
          </div>

          <nav className="flex-1 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 mx-2 mb-1 rounded-lg transition-all",
                    isActive
                      ? "bg-blue-500 text-white hover:bg-blue-400"
                      : "hover:bg-blue-100 text-gray-700"
                  )
                }
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {isOpen && (
          <div className="px-4 py-3 text-xs text-gray-400 border-t border-border text-center">
            FLearn © {dayjs().year()}
          </div>
        )}
      </div>
    </aside>
  );
};
