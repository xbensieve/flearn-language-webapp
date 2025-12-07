import {
  createBrowserRouter,
  Outlet,
  type RouteObject,
} from "react-router-dom";
import { Navigate } from "react-router-dom";
import { PublicRoute, RootRedirect } from "@/routes/AuthGuard";
// Import Pages (Common)
import UnauthorizedPage from "../../pages/UnauthorizedPage";
import NotFoundPage from "../../pages/NotFoundPage";
import ForgotPassword from "../../pages/ForgotPassword";
import ResetPassword from "../../pages/ForgotPassword/ResetPassword";

// Import Pages (Learner)
import Register from "../../pages/Register";
import LoginLearner from "@/pages/Login/LoginLearner";
import LearnerLayout from "../../templates/LearnerLayout";
import BrowseCourses from "../../pages/Learner";
import TeacherApplicationPage from "../../pages/Teacher";
import Profile from "../../pages/Profile";
import ApplicationStatus from "../../pages/Teacher/ApplicationStatus";
import MyCourses from "../../pages/Teacher/MyCourse";

// Import Pages (System - Admin/Manager/Teacher)
import LoginDashboard from "../../pages/Login/LoginSystem";
import PrivateRoute from "./PrivateRoute";
import DashboardLayout from "../../templates/AdminLayout";
import Admin from "../../pages/Admin";
import CourseTemplatesPage from "../../pages/Admin/CourseTemplate";
import Goals from "../../pages/Admin/Goals";
import ConversationPromptPage from "../../pages/Admin/ConversationPromptPage";
import ProgramPage from "../../pages/Admin/Program";
import RefundAdminPage from "../../pages/Admin/RefundAdminPage";
import LevelPage from "../../pages/Admin/Level";
import AdminPayoutsPage from "../../pages/Admin/AdminPayoutPage";
import UsersPage from "../../pages/Admin/UsersPage";
import StaffPage from "../../pages/Admin/StaffPage";
import CoursesPage from "../../pages/Admin/CoursesPage";
import AdminSettingsPage from "../../pages/Admin/SettingsPage";

// Manager & Teacher Components
import Dashboard from "@/pages/Manager/Dashboard";
import TeacherApplicationByManager from "@/pages/Manager/Teacher/TeacherApplications";
import TeacherApplicationDetailByManager from "@/pages/Manager/Teacher/ApplicationDetail";
import Courses from "@/pages/Manager/Course/Courses";
import CourseDetailByManager from "@/pages/Manager/Course/CourseDetail";
import ExerciseGradingPageByManager from "@/pages/Manager/Exercise/ExerciseGradingPage";
import ProfileByManager from "@/pages/Manager/Profile/Profile";
import CancellationRequests from "@/pages/Manager/CancellationRequests";
import TeacherLayout from "../../templates/TeacherLayout";
import TeacherExerciseGradingPage from "@/pages/Teacher/ExerciseGrading/TeacherExerciseGradingPage";
import CourseDetailView from "../../pages/Teacher/CourseDetailView";
import CourseDetail from "../../pages/Teacher/CourseDetail";
import EditCoursePage from "../../pages/Teacher/EditCoursePage";
import UnitsManager from "../../pages/Teacher/UnitsManager";
import MyClasses from "../../pages/Teacher/MyClasses";
import ClassDetail from "../../pages/Teacher/ClassDetail";
import TeacherPayoutPage from "../../pages/Teacher/TeacherPayoutPage";
import WalletHistoryPage from "@/pages/Wallet/WalletHistory";
import CreateCoursePage from "@/pages/Teacher/Course/CreateCoursePage";
import PayoutManagerPage from "@/pages/Teacher/Finance/PayoutManagerPage";

// Lấy biến môi trường (Mặc định là learner nếu không set)
const APP_MODE = import.meta.env.VITE_APP_MODE || "learner";

// --- 1. COMMON ROUTES (Dùng chung cho cả 2 App) ---
const commonRoutes: RouteObject[] = [
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "*", element: <NotFoundPage /> },
];

// --- 2. LEARNER ROUTES ---
const learnerRoutes: RouteObject[] = [
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: <LoginLearner /> },
      { path: "/register", element: <Register /> },
    ],
  },
  {
    path: "/learner",
    element: (
      <PrivateRoute allowedRoles={["learner"]}>
        <LearnerLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, path: "/learner", element: <ApplicationStatus /> },
      { path: "application", element: <TeacherApplicationPage /> },
      { path: "status", element: <ApplicationStatus /> },
    ],
  },
];

// --- 3. SYSTEM ROUTES ---
const systemRoutes: RouteObject[] = [
  // Redirect trang chủ về Login
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    element: <PublicRoute />,
    children: [{ path: "/login", element: <LoginDashboard /> }],
  },
  // --- ADMIN ROUTES ---
  {
    path: "/admin",
    element: (
      <PrivateRoute allowedRoles={["admin"]}>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { index: true, path: "dashboard", element: <Admin /> },
      { path: "profile", element: <Profile /> },
      { path: "course-templates", element: <CourseTemplatesPage /> },
      { path: "goals", element: <Goals /> },
      { path: "conversation-prompts", element: <ConversationPromptPage /> },
      { path: "programs", element: <ProgramPage /> },
      { path: "refund", element: <RefundAdminPage /> },
      { path: "levels/:programId", element: <LevelPage /> },
      { path: "payouts", element: <AdminPayoutsPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "staff", element: <StaffPage /> },
      { path: "courses", element: <CoursesPage /> },
      { path: "wallet-transactions", element: <WalletHistoryPage /> },
      { path: "settings", element: <AdminSettingsPage /> },
    ],
  },
  // --- MANAGER ROUTES ---
  {
    path: "/dashboard",
    element: (
      <PrivateRoute allowedRoles={["manager"]}>
        <Outlet />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "applications", element: <TeacherApplicationByManager /> },
      {
        path: "applications/:id",
        element: <TeacherApplicationDetailByManager />,
      },
      { path: "courses", element: <Courses /> },
      { path: "courses/:id", element: <CourseDetailByManager /> },
      { path: "exercise-grading", element: <ExerciseGradingPageByManager /> },
      { path: "profile", element: <ProfileByManager /> },
      { path: "cancellation-requests", element: <CancellationRequests /> },
    ],
  },
  // --- TEACHER ROUTES ---
  {
    path: "/teacher",
    element: (
      <PrivateRoute allowedRoles={["teacher"]}>
        <TeacherLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <BrowseCourses /> },
      { path: "profile", element: <Profile /> },
      { path: "course", element: <MyCourses /> },
      {
        path: "assignments",
        element: <TeacherExerciseGradingPage />,
      },
      { path: "course/create", element: <CreateCoursePage /> },
      { path: "course/:id", element: <CourseDetailView /> },
      { path: "course/:id/edit", element: <CourseDetail /> },
      { path: "course/:id/edit-course", element: <EditCoursePage /> },
      { path: "course/:id/edit/unit/:id", element: <UnitsManager /> },
      { path: "classes", element: <MyClasses /> },
      { path: "classes/:id", element: <ClassDetail /> },
      { path: "payout-request", element: <PayoutManagerPage /> },
      { path: "payouts", element: <TeacherPayoutPage /> },
      { path: "wallet-transactions", element: <WalletHistoryPage /> },
    ],
  },
];

// --- BUILD ROUTER BASED ON MODE ---
// Nếu mode là 'system', chỉ load route hệ thống. Ngược lại load route Learner.
const finalRoutes =
  APP_MODE === "system"
    ? [...systemRoutes, ...commonRoutes]
    : [...learnerRoutes, ...commonRoutes];

const router = createBrowserRouter(finalRoutes);

export { router };
