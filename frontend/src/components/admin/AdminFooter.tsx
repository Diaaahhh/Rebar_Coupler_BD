export default function AdminFooter() {
  return (
    <footer
      className="py-4 text-center"
      style={{
        background: "var(--primary-dark)",
        color: "var(--text-light)",
      }}
    >
      Copyright © {new Date().getFullYear()}
    </footer>
  );
}