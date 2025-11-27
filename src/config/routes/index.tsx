import { createBrowserRouter, Outlet, type RouteObject } from 'react-router-dom';
import LoginPage from '../../pages/Login';
import UnauthorizedPage from '../../pages/UnauthorizedPage';
import PrivateRoute from './PrivateRoute';
import Admin from '../../pages/Admin';
import NotFoundPage from '../../pages/NotFoundPage';
import DashboardLayout from '../../templates/AdminLayout';
import Profile from '../../pages/Profile';
import TeacherApplicationPage from '../../pages/Teacher';
import LearnerLayout from '../../templates/LearnerLayout';
import ApplicationStatus from '../../pages/Teacher/ApplicationStatus';
import Register from '../../pages/Register';
import CreateSurvey from '../../pages/Teacher/CreateSurvey';
import MySurvey from '../../pages/Teacher/MySurvey';
import CreateCourse from '../../pages/Teacher/CreateCourse';
import MyCourses from '../../pages/Teacher/MyCourse';
import CourseTemplatesPage from '../../pages/Admin/CourseTemplate';
import Goals from '../../pages/Admin/Goals';
import BrowseCourses from '../../pages/Learner';
import TeacherLayout from '../../templates/TeacherLayout';
import CourseDetail from '../../pages/Teacher/CourseDetail';
import CourseDetailView from '../../pages/Teacher/CourseDetailView';
import UnitsManager from '../../pages/Teacher/UnitsManager';
import EditCoursePage from '../../pages/Teacher/EditCoursePage';


import ConversationPromptPage from '../../pages/Admin/ConversationPromptPage';
import MyClasses from '../../pages/Teacher/MyClasses';
import ClassDetail from '../../pages/Teacher/ClassDetail';
import ForgotPassword from '../../pages/ForgotPassword';
import ResetPassword from '../../pages/ForgotPassword/ResetPassword';
import ProgramPage from '../../pages/Admin/Program';
import LevelPage from '../../pages/Admin/Level';
import RefundAdminPage from '../../pages/Admin/RefundAdminPage';
import PayoutPage from '../../pages/Teacher/PayoutPage';
import AdminPayoutsPage from '../../pages/Admin/AdminPayoutPage';
import LandingPage from '../../pages/LandingPage';
import TeacherGradingPage from '../../pages/Teacher/TeacherGradingPage';
import TeacherPayoutPage from '../../pages/Teacher/TeacherPayoutPage';

import Courses from '@/pages/Manager/Course/Courses';
import CourseDetailByManager from '@/pages/Manager/Course/CourseDetail';
import ProfileByManager from '@/pages/Manager/Profile/Profile';
import UsersPage from '../../pages/Admin/UsersPage';
import StaffPage from '../../pages/Admin/StaffPage';
import CoursesPage from '../../pages/Admin/CoursesPage';
import Dashboard from '@/pages/Manager/Dashboard';
import TeacherApplicationByManager from '@/pages/Manager/Teacher/TeacherApplications';
import TeacherApplicationDetailByManager from '@/pages/Manager/Teacher/ApplicationDetail';
import ExerciseGradingPageByManager from '@/pages/Manager/Exercise/ExerciseGradingPage';
// Route configuration
const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/admin',
    element: (
      <PrivateRoute allowedRoles={['admin']}>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        path: 'dashboard',
        element: <Admin />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'course-templates',
        element: <CourseTemplatesPage />,
      },
      {
        path: 'goals',
        element: <Goals />,
      },
      {
        path: 'conversation-prompts',
        element: <ConversationPromptPage />,
      },
      {
        path: 'programs',
        element: <ProgramPage />,
      },
      {
        path: 'refund',
        element: <RefundAdminPage />,
      },
      {
        path: 'levels/:programId',
        element: <LevelPage />,
      },
      {
        path: 'payouts',
        element: <AdminPayoutsPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'staff',
        element: <StaffPage />,
      },
      {
        path: 'courses',
        element: <CoursesPage />,
      },
    ],
  },

  {
    path: '/dashboard',
    element: (
      <PrivateRoute allowedRoles={['manager']}>
        <Outlet />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'applications',
        element: <TeacherApplicationByManager />,
      },
      {
        path: 'applications/:id',
        element: <TeacherApplicationDetailByManager />,
      },
      {
        path: 'courses',
        element: <Courses />,
      },
      {
        path: 'courses/:id',
        element: <CourseDetailByManager />,
      },
      {
        path: 'exercise-grading',
        element: <ExerciseGradingPageByManager />,
      },
      {
        path: 'profile',
        element: <ProfileByManager />,
      },
    ],
  },
  {
    path: '/learner',
    element: (
      <PrivateRoute allowedRoles={['learner', 'teacher']}>
        <LearnerLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, path: '', element: <BrowseCourses /> },
      { index: true, path: 'survey', element: <MySurvey /> },
      { path: 'application', element: <TeacherApplicationPage /> },
      { path: 'profile', element: <Profile /> },
      { path: 'status', element: <ApplicationStatus /> },
      { path: 'survey/create', element: <CreateSurvey /> },
      { path: 'course', element: <MyCourses /> },
      { path: 'course/create', element: <CreateCourse /> },
    ],
  },
  {
    path: '/teacher',
    element: (
      <PrivateRoute allowedRoles={['teacher']}>
        <TeacherLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, path: '', element: <BrowseCourses /> },
      { path: 'application', element: <TeacherApplicationPage /> },
      { path: 'profile', element: <Profile /> },
      { path: 'status', element: <ApplicationStatus /> },
      { path: 'survey/create', element: <CreateSurvey /> },
      { path: 'course', element: <MyCourses /> },
      {
        path: 'course/exercise-grading/assignments',
        element: <TeacherGradingPage />,
      },
      { path: 'course/create', element: <CreateCourse /> },
      { path: 'course/:id', element: <CourseDetailView /> },
      { path: 'course/:id/edit', element: <CourseDetail /> },
      { path: 'course/:id/edit-course', element: <EditCoursePage /> },
      { path: 'course/:id/edit/unit/:id', element: <UnitsManager /> },
      { path: 'classes', element: <MyClasses /> },
      { path: 'classes/:id', element: <ClassDetail /> },
      { path: 'payout-request', element: <PayoutPage /> },
      { path: 'payouts', element: <TeacherPayoutPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// Create and export the router
const router = createBrowserRouter(routes);

export { router };
