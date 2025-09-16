import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import LoginPage from '../../pages/Login';
import UnauthorizedPage from '../../pages/UnauthorizedPage';
import PrivateRoute from './PrivateRoute';
import AdminLayout from '../../templates/AdminLayout';
import Admin from '../../pages/Admin';
import StaffLayout from '../../templates/StaffLayout';
import Staff from '../../pages/Staff';
import TeacherLayout from '../../templates/TeacherLayout';
import Teacher from '../../pages/Teacher';
import NotFoundPage from '../../pages/NotFoundPage';


// Route configuration
const routes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/admin',
    element: (
      <PrivateRoute allowedRoles={['admin']}>
        <AdminLayout>
          <Admin />
        </AdminLayout>
      </PrivateRoute>
    ),
    // Add nested routes here if needed, e.g.:
    // children: [
    //   { path: 'settings', element: <AdminSettings /> },
    // ]
  },
  {
    path: '/staff',
    element: (
      <PrivateRoute allowedRoles={['staff']}>
        <StaffLayout>
          <Staff />
        </StaffLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/teacher',
    element: (
      <PrivateRoute allowedRoles={['teacher']}>
        <TeacherLayout>
          <Teacher />
        </TeacherLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

// Create and export the router
const router = createBrowserRouter(routes);

export { router };