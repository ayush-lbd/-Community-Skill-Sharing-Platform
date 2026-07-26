import { Link } from 'react-router-dom';
import { ArrowRight, Users, Award, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          Exchange Knowledge, <br />
          <span className="text-indigo-600">Grow Together.</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Connect with peers to trade skills in web development, design, languages, and technical disciplines without financial barriers.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/skills"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            Explore Skills <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/register"
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold px-6 py-3 rounded-lg transition"
          >
            Join Community
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <Zap className="w-8 h-8 text-indigo-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Direct Peer Matching</h3>
          <p className="text-slate-600 text-sm">Find community members offering the exact expertise you are seeking.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <Award className="w-8 h-8 text-indigo-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Verified Skill Ratings</h3>
          <p className="text-slate-600 text-sm">Rate sessions and review instructors based on hands-on learning experiences.</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <Users className="w-8 h-8 text-indigo-600 mb-4" />
          <h3 className="font-bold text-lg mb-2">Collaborative Hub</h3>
          <p className="text-slate-600 text-sm">Manage teaching schedules, learning sessions, and profile updates easily.</p>
        </div>
      </section>
    </div>
  );
}