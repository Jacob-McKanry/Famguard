import Link from "next/link";
import { COMPANY_NAME } from "@/config";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© 2026 {COMPANY_NAME}. Family Guardian is a working name.</span>
      <span className="footer-links">
        <Link href="/#respect">Our promise</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        {/* Contact goes to the top of the page until a real contact email exists. */}
        <Link href="/#top">Contact</Link>
      </span>
    </footer>
  );
}
