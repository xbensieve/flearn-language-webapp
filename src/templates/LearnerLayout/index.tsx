import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { GraduationCap, LogOut, Menu } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import LoadingScreen from "@/components/Loading/LoadingScreen";
import { cn } from "@/lib/utils";
import { logoutService } from "@/services/auth";

const NAV_ITEMS = [
  { label: "Apply", href: "/learner/application" },
  { label: "My Applications", href: "/learner/status" },
] as const;

export default function LearnerLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: (refreshToken: string) => logoutService(refreshToken),
    onSuccess: () => {
      localStorage.removeItem("FLEARN_ACCESS_TOKEN");
      localStorage.removeItem("FLEARN_REFRESH_TOKEN");
      localStorage.removeItem("FLEARN_USER_ROLES");
      toast.success("Logged out successfully!");
      window.location.href = "/login";
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to log out!");
    },
  });

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("FLEARN_REFRESH_TOKEN");
    if (refreshToken) {
      logout(refreshToken);
    } else {
      localStorage.clear();
      toast.success("Logged out successfully!");
      window.location.href = "/login";
    }
  };

  if (isLoggingOut) return <LoadingScreen />;

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (
    item:
      | (typeof NAV_ITEMS)[number]
      | { label: string; href: null; isLogout?: boolean }
  ) => {
    if ("isLogout" in item) {
      return (
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50",
            "data-[pending=true]:opacity-50"
          )}
          onClick={handleLogout}
          disabled={isLoggingOut}
          data-pending={isLoggingOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {item.label}
          {isLoggingOut && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
        </Button>
      );
    }

    return (
      <NavigationMenuLink asChild>
        <Link
          to={item.href as string}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActive(item.href as string)
              ? "bg-accent text-accent-foreground"
              : "text-foreground"
          )}
        >
          {item.label}
        </Link>
      </NavigationMenuLink>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-primary"
          >
            <GraduationCap className="h-7 w-7" />
            <span>FLearn</span>
          </Link>

          {/* Desktop Menu - Bao gồm cả Đăng xuất */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavigationMenuItem key={item.href}>
                  {renderNavItem(item)}
                </NavigationMenuItem>
              ))}

              {/* Divider */}
              <div className="mx-2 h-6 w-px bg-border" />

              {/* Logout as menu item */}
              <NavigationMenuItem>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                  {isLoggingOut && (
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  )}
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 pt-12">
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "rounded-md px-4 py-3 text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive(item.href)
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}

                <div className="my-4 border-t border-border" />

                <Button
                  variant="ghost"
                  className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                  {isLoggingOut && (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin" />
                  )}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} FLearn. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
