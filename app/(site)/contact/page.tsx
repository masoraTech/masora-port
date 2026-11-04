import { sendMessage } from "./actions";

export default function Contact({ searchParams }: { searchParams: { sent?: string; error?: string } }) {
  return (
    <main className="page">
      <h1>Contact</h1>
      <p>Parlez-moi de votre projet, je réponds sous 48 h.</p>
      <form action={sendMessage} className="stack" style={{ maxWidth: 520 }}>
        <input name="name" required placeholder="Votre nom" aria-label="Nom" />
        <input name="email" type="email" required placeholder="Votre e-mail" aria-label="E-mail" />
        <textarea name="body" rows={5} required placeholder="Votre message" aria-label="Message" />
        <button className="btn" type="submit">Envoyer le message</button>
        {searchParams.sent && <p className="okmsg">Message envoyé. Merci !</p>}
        {searchParams.error && <p className="errmsg">Vérifiez les champs et réessayez.</p>}
      </form>
    </main>
  );
}
