import React, { type ReactNode } from 'react';

const AdminLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div>
    <header>Admin Header</header>
    <main>{children}</main>
    <footer>Admin Footer</footer>
  </div>
);

export default AdminLayout;