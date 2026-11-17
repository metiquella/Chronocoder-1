"use client";

import { useState } from "react";

/**
 * Primary navigation for small screens (#321).
 *
 * The desktop <nav> is `hidden md:flex`, so below 768px every header link
 * disappeared with no replacement. This renders a `md:hidden` disclosure
 * button that toggles the same three destinations, so mobile users can still
 * reach Mentors, How it works, and GitHub.
 */
const LINKS = [
  { href: "#mentors", label: "Mentors" },
  { href: "#features", label: "How it works" },
  {
    href: "https://github.com/anubhavaanand/Chronocoder-1",
    label: "GitHub",
    external: true,
  },
] as const;

const MENU_ID = "mobile-primary-nav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        aria-controls={MENU_ID}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-md border text-lg leading-none transition-colors duration-150"
        style={{
          color: "var(--fg-mid)",
          borderColor: "var(--border)",
        }}
      >
        <span aria-hidden="true">{open ? "\u2715" : "\u2630"}</span>
      </button>

      <nav
        id={MENU_ID}
        aria-label="Mobile primary"
        hidden={!open}
        className="absolute left-0 right-0 top-full border-b px-6 py-3 text-sm"
        style={{
          backgroundColor: "var(--bg)",
          borderColor: "var(--border)",
        }}
      >
        <ul className="container mx-auto flex max-w-7xl flex-col gap-3">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                style={{ color: "var(--fg-mid)" }}
                className="block py-1 transition-colors duration-150 hover:text-[oklch(94%_0.006_265)]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}