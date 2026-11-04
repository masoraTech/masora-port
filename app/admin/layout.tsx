import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="adm">
        <Link className="adm-brand" href="/" aria-label="Masora Technologies, voir le site">
          <img src="/masora_technologies_icon.png" alt="" />
          <span>Masora <b>Admin</b></span>
        </Link>
        {isAdmin() && (
          <>
            <nav className="adm-nav" aria-label="Navigation du tableau de bord">
              <Link href="/admin">Tableau de bord</Link>
              <Link href="/admin#messages">Contacts</Link>
              <Link href="/admin#projects">Projets</Link>
            </nav>
            <div className="adm-actions">
              <Link className="adm-site-link" href="/">Voir le site <span aria-hidden="true">↗</span></Link>
              <form action={logout}><button className="lnk">Déconnexion</button></form>
            </div>
          </>
        )}
      </header>
      {children}
    </>
  );
}
