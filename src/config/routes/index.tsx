import { createBrowserRouter, type RouteObject } from 'react-router-dom';
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
import StaffDashboardLayout from '../../templates/StaffLayout';
import ApplicationsPending from '../../pages/Staff/ApplicationPending';
import Register from '../../pages/Register';
import CreateSurvey from '../../pages/Teacher/CreateSurvey';
import MySurvey from '../../pages/Teacher/MySurvey';
import LandingPage from '../../pages/LandingPage';
import CreateCourse from '../../pages/Teacher/CreateCourse';
import MyCourses from '../../pages/Teacher/MyCourse';
import CourseTemplatesPage from '../../pages/Admin/CourseTemplate';
import Goals from '../../pages/Admin/Goals';
import BrowseCourses from '../../pages/Learner';
import TeacherLayout from '../../templates/TeacherLayout';
import CourseDetail from '../../pages/Teacher/CourseDetail';
import CourseDetailView from '../../pages/Teacher/CourseDetailView';
import UnitsManager from '../../pages/Teacher/UnitsManager';

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
    ],
  },

  {
    path: '/staff',
    element: (
      <PrivateRoute allowedRoles={['staff']}>
        <StaffDashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        path: 'dashboard',
        element: <Admin />,
      },
      {
        path: 'application/pending',
        element: <ApplicationsPending />,
      },
      {
        path: 'profile',
        element: <Profile />,
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
      { path: 'course/create', element: <CreateCourse /> },
      { path: 'course/:id', element: <CourseDetailView /> },
      { path: 'course/:id/edit', element: <CourseDetail /> },
      { path: 'course/:id/edit/unit/:id', element: <UnitsManager /> },
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
