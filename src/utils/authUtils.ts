import type { NavigateFunction } from "react-router-dom";
import { notifyError } from "./toastConfig";

// Định nghĩa đích đến cho từng Role
export const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/admin/dashboard",
  manager: "/dashboard",
  teacher: "/teacher",
  learner: "/learner",
};

/**
 * Hàm kiểm tra và điều hướng người dùng dựa trên Role và Cổng đăng nhập hiện tại.
 * @param roles Danh sách role của user
 * @param navigate Hook navigate của React Router
 * @param portalType Loại cổng đang đứng: 'public' (Learner) hay 'internal' (Staff)
 */
export const handleRoleRedirect = (
  roles: string[],
  navigate: NavigateFunction,
  portalType: "public" | "internal"
) => {
  // 1. Xác định Role cao nhất của user
  // Thứ tự ưu tiên: Admin > Manager > Teacher > Learner
  const userRole =
    roles.find((r) => r.toLowerCase() === "admin") ||
    roles.find((r) => r.toLowerCase() === "manager") ||
    roles.find((r) => r.toLowerCase() === "teacher") ||
    roles.find((r) => r.toLowerCase() === "learner");

  const normalizedRole = userRole?.toLowerCase();

  // 2. Logic chặn quyền (Guard) theo chuẩn Enterprise

  // TRƯỜNG HỢP 1: Đang ở cổng Staff (Internal)
  if (portalType === "internal") {
    if (!normalizedRole || normalizedRole === "learner") {
      notifyError("Access Denied: This portal is for Staff only.");
      localStorage.clear(); // Xóa session ngay lập tức
      navigate("/login"); // Đá về cổng Public
      return;
    }
    // Nếu là Staff -> Cho vào đúng trang
    navigate(ROLE_REDIRECTS[normalizedRole] || "/unauthorized");
  }

  // TRƯỜNG HỢP 2: Đang ở cổng Learner (Public)
  else if (portalType === "public") {
    if (
      normalizedRole &&
      ["admin", "manager", "teacher"].includes(normalizedRole)
    ) {
      notifyError("Staff accounts must use the Admin Portal.");
      navigate("/admin/login");
      return;
    }
    navigate("/learner");
  }
};
