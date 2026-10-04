import Link from "next/link";

// The dark header bar from the reference design.
// onHome: true on "/", where the nav links are in-page anchors (#doors).
//         false elsewhere, where they become /#doors and so on (spec section 4).
// showJoin: the "Join early access" button. Hidden on /join (spec section 6).
export default function SiteHeader({ onHome = false, showJoin = true }: { onHome?: boolean; showJoin?: boolean }) {
  const prefix = onHome ? "" : "/";
  return (
    <div className="on-dark" id="top">
      <header className="site-header">
        {onHome ? (
          <a href="#top" className="logo">Family Guardian</a>
        ) : (
          <Link href="/" className="logo">Family Guardian</Link>
        )}
        <nav className="site-nav" aria-label="Main">
          <a className="nav-link" href={`${prefix}#doors`}>What it does</a>
          <a className="nav-link" href={`${prefix}#respect`}>For Mom</a>
          <a className="nav-link" href={`${prefix}#plans`}>Plans</a>
          <a className="nav-link" href={`${prefix}#status`}>Early access</a>
        </nav>
        {showJoin && (
          <Link href="/join" className="btn btn-light btn-header">Join early access</Link>
        )}
      </header>
    </div>
  );
}
