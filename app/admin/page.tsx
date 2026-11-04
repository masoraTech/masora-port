import Link from "next/link";
import { db } from "@/lib/db";
import Carousel from "@/components/Carousel";
import ConfirmButton from "@/components/ConfirmButton";
import Donut from "@/components/Donut";
import ProjectForm from "./ProjectForm";
import { deleteProject, toggleProject } from "./actions";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const [projects, categories, messages] = await Promise.all([
    db.project.findMany({ include: { images: { orderBy: { position: "asc" } }, category: true }, orderBy: { id: "desc" } }),
    db.category.findMany({ include: { _count: { select: { projects: true } } }, orderBy: { id: "asc" } }),
    db.message.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <main className="admin">
      <section className="admin-dashboard" aria-labelledby="dashboard-title">
        <div className="admin-dashboard-heading">
          <div>
            <span className="admin-eyebrow">MASORA TECHNOLOGIES · ADMINISTRATION</span>
            <h1 id="dashboard-title">Tableau de bord</h1>
            <p>Gérez vos projets et retrouvez les demandes envoyées depuis le site.</p>
          </div>
          <Link className="admin-primary-link" href="#new-project">Ajouter un projet <span aria-hidden="true">+</span></Link>
        </div>
        <div className="admin-stats" aria-label="Résumé de l’activité">
          <a className="admin-stat" href="#projects">
            <span className="admin-stat-label">Projets publiés</span>
            <strong>{projects.filter((project) => project.active).length}</strong>
            <span className="admin-stat-detail">sur {projects.length} projets au total</span>
          </a>
          <a className="admin-stat" href="#projects">
            <span className="admin-stat-label">Brouillons</span>
            <strong>{projects.filter((project) => !project.active).length}</strong>
            <span className="admin-stat-detail">projets masqués du site</span>
          </a>
          <a className="admin-stat" href="#messages">
            <span className="admin-stat-label">Demandes de contact</span>
            <strong>{messages.length}</strong>
            <span className="admin-stat-detail">messages reçus</span>
          </a>
          <div className="admin-stat">
            <span className="admin-stat-label">Expertises</span>
            <strong>{categories.length}</strong>
            <span className="admin-stat-detail">catégories disponibles</span>
          </div>
        </div>
      </section>

      <section className="admin-section admin-messages" id="messages" aria-labelledby="messages-title">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">BOÎTE DE RÉCEPTION</span>
            <h2 id="messages-title">Messages de contact</h2>
            <p>Consultez les demandes et répondez directement depuis votre messagerie.</p>
          </div>
          <span className="message-count">{messages.length} {messages.length === 1 ? "message" : "messages"}</span>
        </div>
        {messages.length === 0 ? (
          <div className="messages-empty">
            <span className="messages-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
            </span>
            <b>Aucun message pour le moment</b>
            <p>Les demandes envoyées depuis le formulaire de contact apparaîtront ici.</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <article className="message-card" key={message.id}>
                <div className="message-header">
                  <div className="message-sender">
                    <span className="message-avatar" aria-hidden="true">{message.name.trim().charAt(0).toUpperCase() || "?"}</span>
                    <div>
                      <h3>{message.name}</h3>
                      <a href={`mailto:${message.email}`}>{message.email}</a>
                    </div>
                  </div>
                  <div className="message-actions">
                    <time dateTime={message.createdAt.toISOString()}>
                      {message.createdAt.toLocaleString("fr-FR", {
                        dateStyle: "long",
                        timeStyle: "short",
                        timeZone: "Europe/Paris",
                      })}
                    </time>
                    <a className="message-reply" href={`mailto:${message.email}?subject=${encodeURIComponent("Votre demande à Masora Technologies")}`}>
                      Répondre <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>
                <p className="message-body">{message.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-section admin-projects" id="projects" aria-labelledby="projects-title">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">PORTFOLIO</span>
            <h2 id="projects-title">Vos projets</h2>
            <p>Publiez, masquez ou modifiez les réalisations présentées sur le site.</p>
          </div>
          <a className="admin-secondary-link" href="#new-project">Nouveau projet <span aria-hidden="true">↓</span></a>
        </div>

        <div className="tw">
          <table>
            <thead><tr><th>Images</th><th>Catégorie</th><th>Description</th><th>Publication</th><th>Actions</th></tr></thead>
            <tbody>
              {projects.length === 0 && <tr><td colSpan={5} className="empty">Aucun projet pour le moment. Ajoutez votre première réalisation ci-dessous.</td></tr>}
              {projects.map((p) => (
                <tr key={p.id}>
                  <td><Carousel mini images={p.images.map((i) => i.url)} title={p.title} /></td>
                  <td>{p.category.name}</td>
                  <td><b>{p.title}</b><br /><span className="mute">{p.description}</span></td>
                  <td>
                    <form action={toggleProject}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className={`sw ${p.active ? "on" : ""}`} role="switch" aria-checked={p.active} aria-label={p.active ? "Désactiver" : "Publier"} />
                      <span className="admin-project-status">{p.active ? "En ligne" : "Masqué"}</span>
                    </form>
                  </td>
                  <td className="acts-cell">
                    <div className="acts">
                      <Link className="ic" href={`/projects/${p.id}`} aria-label={`Voir ${p.title}`} title="Voir le projet">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>
                      </Link>
                      <Link className="ic" href={`/admin/projects/${p.id}/edit`} aria-label={`Modifier ${p.title}`} title="Modifier le projet">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.9L19.2 8a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" /></svg>
                      </Link>
                      <form action={deleteProject}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmButton message="Supprimer ce projet ?" label={`Supprimer ${p.title}`}>
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 14h12l1-14M9 7V4h6v3" /></svg>
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section admin-create" id="new-project" aria-labelledby="new-project-title">
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">NOUVELLE RÉALISATION</span>
            <h2 id="new-project-title">Ajouter un projet</h2>
            <p>Présentez une réalisation et choisissez si elle apparaît sur le site.</p>
          </div>
        </div>
        <ProjectForm categories={categories}>
          <Donut data={categories.map((c) => ({ name: c.name, count: c._count.projects }))} />
        </ProjectForm>
      </section>
    </main>
  );
}
