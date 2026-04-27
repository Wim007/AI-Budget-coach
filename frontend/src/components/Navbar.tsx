'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/transactions', label: 'Transacties' },
    { href: '/profile', label: 'Profiel' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/dashboard" className="font-semibold text-green-700 text-lg tracking-tight">
          AI Budgetcoach
        </Link>

        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            Uitloggen
          </button>
        </div>
      </div>
    </nav>
  );
}
