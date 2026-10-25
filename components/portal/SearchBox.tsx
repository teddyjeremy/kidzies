export function SearchBox({ q, placeholder }: { q: string; placeholder: string }) {
  return (
    <form className="mb-4 flex gap-2" role="search">
      <input name="q" defaultValue={q} placeholder={placeholder} aria-label={placeholder} className="input max-w-xs" />
      <button className="btn btn-secondary">Search</button>
    </form>
  );
}
