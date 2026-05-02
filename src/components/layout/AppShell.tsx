import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: ReactNode;
}

/**
 * Top-level frame for authenticated pages: sidebar + header + content area.
 */
export function AppShell({ children }: AppShellProps): JSX.Element {
  return (
    <div className="flex h-full min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </div>
    </div>
  );
}
