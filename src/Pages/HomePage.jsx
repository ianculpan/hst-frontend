export default function HomePage() {
  return (
    <div>
      <h1 className="text-foreground">HS Incident Tracker</h1>
      <h2 className="text-foreground">Authorised logons only</h2>
      <a className="" href="/login">
        <button className="bg-theme-500 text-light px-4 py-2 rounded-lg hover:bg-theme-600">
          Login Here
        </button>
      </a>
    </div>
  );
}
