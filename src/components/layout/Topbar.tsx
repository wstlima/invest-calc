import Link from "next/link";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 lg:pl-80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 lg:hidden"
            aria-label="Abrir menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-gray-900">Calculadora de Investimentos</div>
            <div className="text-xs text-gray-500">Layout TailWind</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:inline-flex"
          >
            Simulador
          </Link>
          <Link
            href="/simulations"
            className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Simulações
          </Link>
          <Link
            href="/docs"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 md:inline-flex"
          >
            API Docs
          </Link>
        </div>
      </div>
    </header>
  );
}
