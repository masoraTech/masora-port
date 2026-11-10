import { sendMessage } from "./actions";

export default function Contact({ searchParams }: { searchParams: { sent?: string; error?: string } }) {
  return (
    <main className="page contact-page">
      <section className="contact-intro">
        <span className="section-eyebrow">CONTACT · MASORA TECHNOLOGIES</span>
        <h1>Parlons de votre <span className="gradient-text">projet</span>.</h1>
        <p>Racontez-nous vos objectifs : nous revenons vers vous sous 48 h avec une première proposition.</p>
        <ul className="contact-points">
          <li><i aria-hidden="true" />Réponse sous 48 h</li>
          <li><i aria-hidden="true" />Accompagnement de l’idée au lancement</li>
          <li><i aria-hidden="true" /><a href="mailto:masora.contact@gmail.com">masora.contact@gmail.com</a></li>
        </ul>
      </section>
      <form action={sendMessage} className="stack contact-card">
        <label className="field">
          <span>Nom</span>
          <input name="name" required placeholder="Votre nom" />
        </label>
        <label className="field">
          <span>E-mail</span>
          <input name="email" type="email" required placeholder="vous@entreprise.com" />
        </label>
        <label className="field">
          <span>Message</span>
          <textarea name="body" rows={5} required placeholder="Décrivez votre projet…" />
        </label>
        <button className="btn" type="submit">Envoyer le message</button>
        {searchParams.sent && <p className="okmsg" role="status">Message envoyé. Merci !</p>}
        {searchParams.error && <p className="errmsg" role="alert">Vérifiez les champs et réessayez.</p>}
      </form>
    </main>
  );
}
