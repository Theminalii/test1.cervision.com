import { Link } from "@tanstack/react-router";

export function PublicFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="gold-gradient grid size-9 place-items-center rounded-lg">
              <span className="font-display text-sm font-bold text-primary">K</span>
            </div>
            <div>
              <div className="font-display font-bold">KAFD Hackathon</div>
              <div className="text-xs text-primary-foreground/70">King Abdullah Financial District</div>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/75">
            A premium innovation platform powering KAFD's flagship hackathon for builders shaping the
            future of finance, smart cities and sustainability in the Kingdom.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Platform</div>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/tracks">Tracks</Link></li>
            <li><Link to="/timeline">Timeline</Link></li>
            <li><Link to="/prizes">Prizes</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold">Participate</div>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/rules">Rules</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 text-xs text-primary-foreground/60 sm:flex-row sm:items-center">
          <div>© {new Date().getFullYear()} KAFD Authority. All rights reserved.</div>
          <div>Riyadh · Kingdom of Saudi Arabia</div>
        </div>
      </div>
    </footer>
  );
}
