import { useEffect, useId, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Clock3,
  LogOut,
  Menu,
  Moon,
  Sun,
  Users,
  X,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/islands/ui/dropdown-menu";
import { memberRoleLabel } from "@/lib/member-role-label";

const STORAGE_KEY = "tpe-theme";

type Theme = "dark" | "light";

type AppHeaderMember = {
  name: string;
  initials: string;
  role: string;
  isExternal: boolean;
};

type AppHeaderProps = {
  pathname: string;
  member: AppHeaderMember | null;
};

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore */
  }
  return "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

function NavLinks({
  pathname,
  member,
  onNavigate,
  className = "",
}: {
  pathname: string;
  member: AppHeaderMember | null;
  onNavigate?: () => void;
  className?: string;
}) {
  const isActive = (path: string) => pathname === path;
  const showExternal =
    member && (member.isExternal || member.role === "manager");
  const showGestion = member?.role === "manager";

  return (
    <nav className={className} aria-label="Navigation principale">
      <a
        href="/"
        className={`nav-item ${isActive("/") ? "nav-item-active" : ""}`}
        onClick={onNavigate}
      >
        <CalendarDays className="size-4" aria-hidden="true" />
        Calendrier
      </a>
      {showExternal ? (
        <a
          href="/external"
          className={`nav-item ${isActive("/external") ? "nav-item-active" : ""}`}
          onClick={onNavigate}
        >
          <Clock3 className="size-4" aria-hidden="true" />
          Jours travaillés
        </a>
      ) : null}
      {showGestion ? (
        <a
          href="/gestion"
          className={`nav-item ${isActive("/gestion") ? "nav-item-active" : ""}`}
          onClick={onNavigate}
        >
          <Users className="size-4" aria-hidden="true" />
          Gestion
        </a>
      ) : member ? (
        <span
          className="nav-item pointer-events-none opacity-50"
          aria-disabled="true"
          title="Accès réservé aux managers"
        >
          <Users className="size-4" aria-hidden="true" />
          Gestion
          <span className="sr-only"> (réservé aux managers)</span>
        </span>
      ) : null}
    </nav>
  );
}

function ThemeToggleButton() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = readTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const label =
    theme === "dark" ? "Passer en thème clair" : "Passer en thème sombre";

  return (
    <button
      type="button"
      onClick={toggle}
      className="touch-target rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}

function ActingMemberMenu({ member }: { member: AppHeaderMember }) {
  const roleLabel = memberRoleLabel(member);
  const logout = () => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/logout";
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className="acting-member-chip group outline-none"
        aria-label={`${roleLabel} ${member.name}. Ouvrir le menu`}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
          aria-hidden="true"
        >
          {member.initials || "?"}
        </span>
        <span className="min-w-0 text-left">
          <span className="hidden truncate text-sm font-medium text-foreground sm:block">
            {member.name}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{roleLabel}</span>
            <ChevronDown
              className="size-3.5 opacity-70 transition group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              {member.name}
            </span>
            <span className="text-xs text-muted-foreground">{roleLabel}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer gap-2"
          onSelect={(event) => {
            event.preventDefault();
            logout();
          }}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AppHeader({ pathname, member }: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <a href="/" className="flex min-w-0 shrink items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-primary">
              TPE
            </span>
            <span className="hidden truncate text-sm font-medium text-foreground sm:inline">
              Team Planning Engine
            </span>
          </a>

          <NavLinks
            pathname={pathname}
            member={member}
            className="desktop-nav ml-2 hidden flex-1 items-center gap-0.5 md:flex"
          />

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggleButton />
            {member ? (
              <div className="hidden sm:block">
                <ActingMemberMenu member={member} />
              </div>
            ) : null}
            <div className="md:hidden">
            <button
              type="button"
              className="touch-target rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
            </div>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id={menuId}
            className="absolute inset-x-0 top-0 border-b border-border bg-card px-4 pb-5 pt-4 shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">Menu</span>
              <button
                type="button"
                className="touch-target rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Fermer le menu"
                onClick={() => setMenuOpen(false)}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <NavLinks
              pathname={pathname}
              member={member}
              onNavigate={() => setMenuOpen(false)}
              className="mobile-nav flex flex-col gap-1"
            />

            {member ? (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex items-center gap-3 px-1">
                  <span
                    className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground"
                    aria-hidden="true"
                  >
                    {member.initials || "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {memberRoleLabel(member)}
                    </p>
                  </div>
                </div>
                <form method="POST" action="/api/logout" className="space-y-1">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-muted"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Se déconnecter
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
