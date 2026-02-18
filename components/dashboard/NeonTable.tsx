type NeonTableProps = {
  headers: string[];
  children: React.ReactNode;
  dense?: boolean;
};

export function NeonTable({ headers, children, dense }: NeonTableProps) {
  return (
    <div className="gt-card overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/60 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-900/70 text-[12px] uppercase tracking-[0.08em] text-slate-400">
            <tr>
              {headers.map((header) => (
                <th key={header} className={`px-4 text-left ${dense ? "py-2.5" : "py-3"}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-sm text-slate-100">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
