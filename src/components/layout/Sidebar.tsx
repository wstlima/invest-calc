"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({
  href,
  label,
  active,
  onNavigate,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition " +
        (active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-700 hover:bg-gray-100")
      }
    >
      <span
        className={
          "grid h-9 w-9 place-items-center rounded-lg transition " +
          (active ? "bg-white/15" : "bg-gray-100 group-hover:bg-white")
        }
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col border-r border-gray-200/70 bg-white">
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 13.5V20h16v-6.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 10.5 12 4l9 6.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-gray-900">Invest Calc</div>
          <div className="text-xs text-gray-500">Wellington Lima</div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-2xl bg-gray-50 p-3">
          <div className="text-xs font-medium text-gray-600">Atalhos</div>
          <div className="mt-2 text-xs text-gray-500">
            Simule, compare e acompanhe suas execuções.
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-2">
          <NavItem
            href="/"
            label="Simulador"
            active={pathname === "/"}
            onNavigate={onNavigate}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4h16v16H4z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 15v-5m4 5V7m4 8v-3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
          <NavItem
            href="/simulations"
            label="Simulações"
            active={pathname?.startsWith("/simulations") ?? false}
            onNavigate={onNavigate}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 4h14v16H7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 8h12M3 12h12M3 16h12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            }
          />
        </div>
      </nav>

      <div className="border-t border-gray-200/70 p-4">
        <div className="rounded-2xl bg-blue-50 p-3">
          <div className="text-xs font-semibold text-blue-800">Dica</div>
          <div className="mt-1 text-xs text-blue-700">
            Use a rota <span className="font-mono">/simulations</span> para ver a tabela completa.
          </div>
        </div>
      </div>
    </aside>
  );
}
