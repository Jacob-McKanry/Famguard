import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

// Header + main content + footer. Every public page uses this so they match.
export default function PageShell({
  children,
  onHome = false,
  showJoin = true,
}: {
  children: React.ReactNode;
  onHome?: boolean;
  showJoin?: boolean;
}) {
  return (
    <div className="page">
      <SiteHeader onHome={onHome} showJoin={showJoin} />
      {/* tabIndex -1 lets the skip link move keyboard focus here */}
      <main id="main" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </div>
  );
}

// The dark strip under the header on inner pages (join, reserve, confirmed).
export function PageHero({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <section className="on-dark">
      <div className="page-hero-inner">
        <div className="eyebrow eyebrow-gold">{eyebrow}</div>
        <h1 className="page-hero-title">{title}</h1>
        <p className="page-hero-lead">{lead}</p>
      </div>
    </section>
  );
}
