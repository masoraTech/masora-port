import { login } from "../actions";

export default function Login({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="page">
      <h1>Connexion</h1>
      <form action={login} className="stack" style={{ maxWidth: 360 }}>
        <input name="email" type="email" autoComplete="username" required placeholder="Adresse e-mail" aria-label="Adresse e-mail" autoFocus />
        <input name="password" type="password" autoComplete="current-password" required placeholder="Mot de passe" aria-label="Mot de passe" />
        <button className="btn" type="submit">Se connecter</button>
        {searchParams.error && <p className="errmsg">E-mail ou mot de passe incorrect.</p>}
      </form>
    </main>
  );
}
