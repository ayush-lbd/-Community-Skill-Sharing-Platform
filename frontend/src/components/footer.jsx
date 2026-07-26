export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm">© {new Date().getFullYear()} SkillCraft Community. Built for peer-to-peer knowledge exchange.</p>
      </div>
    </footer>
  );
}