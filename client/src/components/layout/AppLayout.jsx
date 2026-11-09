import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-line py-5 text-center text-xs text-muted">
        ResolveX, smart campus issue reporting and resolution
      </footer>
    </div>
  );
}
