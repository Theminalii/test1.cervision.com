import type { ReactNode } from "react";
import { PublicNav } from "./public-nav";
import { PublicFooter } from "./public-footer";

export function PublicPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <section className="border-b border-border bg-gradient-to-b from-muted/60 to-transparent">
        <div className="container-page py-16">
          {eyebrow && (
            <div className="text-xs font-semibold uppercase tracking-widest text-gold-foreground">{eyebrow}</div>
          )}
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          {description && <p className="mt-4 max-w-2xl text-muted-foreground">{description}</p>}
        </div>
      </section>
      <main className="container-page py-14">{children}</main>
      <PublicFooter />
    </div>
  );
}
