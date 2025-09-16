import React, { type ReactNode } from 'react';

const StaffLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div>
    <header>Staff Header</header>
    <main>{children}</main>
    <footer>Staff Footer</footer>
  </div>
);

export default StaffLayout;