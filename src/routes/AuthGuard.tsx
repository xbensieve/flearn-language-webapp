import { Navigate, Outlet } from "react-router-dom";
import { getRedirectPathByRole } from "@/utils/authUtils";

// Helper check đăng nhập
const useAuthCheck = () => {
  const token = localStorage.getItem("FLEARN_ACCESS_TOKEN");
  const rolesString = localStorage.getItem("FLEARN_USER_ROLES");
  let roles: string[] = [];
  try {
    roles = rolesString ? JSON.parse(rolesString) : [];
  } catch {
    roles = [];
  }
  return { isAuth: !!token && roles.length > 0, roles };
};

/**
 * Component bảo vệ các trang Public (Login, Register).
 * Nếu đã đăng nhập -> Tự động chuyển hướng vào trong (Dashboard/Learner).
 * Nếu chưa đăng nhập -> Cho phép hiện trang Login/Register.
 */
export const PublicRoute = () => {
  const { isAuth, roles } = useAuthCheck();

  if (isAuth) {
    const redirectPath = getRedirectPathByRole(roles);
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

/**
 * Component xử lý riêng cho đường dẫn gốc "/"
 * Thay vì luôn redirect về login, nó sẽ check xem user có đó không.
 */
export const RootRedirect = () => {
  const { isAuth, roles } = useAuthCheck();

  if (isAuth) {
    const redirectPath = getRedirectPathByRole(roles);
    return <Navigate to={redirectPath} replace />;
  }

  return <Navigate to="/login" replace />;
};
