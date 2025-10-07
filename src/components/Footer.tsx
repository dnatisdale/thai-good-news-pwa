export default function Footer() {
  return (
    <footer className="py-8 text-center opacity-70">
      © {new Date().getFullYear()} Thai Good News
      <span className="mx-2">•</span>
      v{(globalThis as any).__APP_VERSION__}
    </footer>
  );
}
