const COL = ["#df1672", "#0785c8", "#27b765", "#f05a9c", "#45afe0", "#65ce92"];

export default function Donut({ data }: { data: { name: string; count: number }[] }) {
  const total = data.reduce((a, d) => a + d.count, 0);
  const R = 60, C = 2 * Math.PI * R;
  let off = 0;
  return (
    <div className="chart">
      <svg viewBox="0 0 160 160" width="170" role="img" aria-label="Répartition des projets par catégorie">
        {data.map((d, i) => {
          if (!d.count) return null;
          const l = (d.count / total) * C;
          const el = (
            <circle key={d.name} r={R} cx={80} cy={80} fill="none" stroke={COL[i % COL.length]} strokeWidth={30}
              strokeDasharray={`${l} ${C - l}`} strokeDashoffset={-off} transform="rotate(-90 80 80)" />
          );
          off += l;
          return el;
        })}
        <text x="80" y="86" textAnchor="middle" fontSize="18" fontWeight="700" fill="currentColor">{total}</text>
      </svg>
      <div className="leg">
        {data.map((d, i) => (
          <span key={d.name}><i style={{ background: COL[i % COL.length] }} />{d.name} {total ? Math.round((d.count / total) * 100) : 0} %</span>
        ))}
      </div>
    </div>
  );
}
