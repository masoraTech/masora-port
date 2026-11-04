import { saveProject } from "./actions";

type Props = {
  categories: { id: number; name: string }[];
  project?: { id: number; title: string; description: string; technologies: string; categoryId: number; images: { id: number; url: string }[] };
  children?: React.ReactNode;
};

export default function ProjectForm({ categories, project, children }: Props) {
  return (
    <form action={saveProject} className="form">
      {project && <input type="hidden" name="id" value={project.id} />}
      <div className="drop">
        <b>Ajouter des photos</b>
        <input type="file" name="photos" accept="image/*" multiple aria-label="Photos" />
        {project?.images.length ? (
          <div className="thumbs">
            {project.images.map((im) => (
              <label key={im.id}><img src={im.url} alt="" /><span><input type="checkbox" name="removeIds" value={im.id} /> Retirer</span></label>
            ))}
          </div>
        ) : null}
      </div>
      <div className="stack">
        <input name="title" required defaultValue={project?.title} placeholder="Titre du projet" aria-label="Titre" />
        <select name="categoryId" defaultValue={project?.categoryId} aria-label="Catégorie">
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <textarea name="description" rows={4} defaultValue={project?.description} placeholder="Description" aria-label="Description" />
        <input
          name="technologies"
          defaultValue={project?.technologies ?? ""}
          placeholder="Ex. Next.js, TypeScript, PostgreSQL"
          aria-label="Technologies utilisées"
        />
        <p className="field-hint">Technologies utilisées, séparées par des virgules.</p>
        <div className="form-actions">
          <button className="btn" type="submit">{project ? "Enregistrer les modifications" : "Ajouter le projet"}</button>
          <button className="btn-reset" type="reset">Réinitialiser</button>
        </div>
      </div>
      {children}
    </form>
  );
}
