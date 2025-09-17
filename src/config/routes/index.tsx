import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import LoginPage from '../../pages/Login';
import UnauthorizedPage from '../../pages/UnauthorizedPage';
import PrivateRoute from './PrivateRoute';
import Admin from '../../pages/Admin';
import NotFoundPage from '../../pages/NotFoundPage';
import DashboardLayout from '../../templates/AdminLayout';
import Profile from '../../pages/Profile';

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
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Admin />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
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
