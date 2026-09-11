import Link from "next/link";

const links = [
  { label: "GitHub", href: "https://github.com/anshumancodes/brainboard" },
  { label: "X", href: "https://x.com/anshumancdx" },
  { label: "anshumancdx", href: "https://anshumancdx.xyz" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 mx-auto max-w-7xl px-6 pb-6 pt-4 lg:px-10">
      <div className="flex flex-col gap-4  pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Brainboard. Think together.
        </p>

        <div className="flex items-center gap-5">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-white/40 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}