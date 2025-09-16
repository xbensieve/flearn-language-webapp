import React, { type ReactNode } from 'react';

const TeacherLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div>
    <header>Teacher Header</header>
    <main>{children}</main>
    <footer>Teacher Footer</footer>
  </div>
);

export default TeacherLayout;