export default function Footer() {
  const links = ['Models', 'Research', 'API', 'Privacy', 'Terms'];
  return (
    <footer
      style={{ background: 'linear-gradient(135deg, #1C1A16 0%, #2D2A24 100%)' }}
      className="py-10 px-6 mt-20"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span
          className="text-white text-xl font-bold"
          style={{ fontFamily: 'Syne, sans-serif' }}
        >
          NexusAI Model Marketplace
        </span>
        <nav className="flex flex-wrap gap-6 text-sm" style={{ color: '#9E9B93' }}>
          {links.map((item) => (
            <a
              key={item}
              href="#"
              className="hover:text-white transition-colors"
              aria-label={item}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
