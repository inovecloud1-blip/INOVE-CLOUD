import React, { useState } from 'react';
import {
  FolderKanban,
  Paperclip,
  CheckCircle2,
  Send,
  ExternalLink,
  Plus,
  Mail,
  Sparkles,
  Users,
  FileCheck
} from 'lucide-react';

export const ProjectsApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stories' | 'outreach'>('stories');

  const outreachList = [
    { name: 'Priya Natarajan', role: 'Head of Infrastructure @ CloudScale', status: 'Draft', avatar: 'PN' },
    { name: 'Marcus Webb', role: 'VP of Engineering @ FintechNode', status: 'Draft', avatar: 'MW' },
    { name: 'Elena Sørensen', role: 'Lead DevOps Architect @ NordicTech', status: 'Draft', avatar: 'ES' },
    { name: 'Daniel Alvarez', role: 'CTO @ InoveData Solutions', status: 'Draft', avatar: 'DA' },
    { name: 'Camila Rodriguez', role: 'Cloud Security Director @ CyberCore', status: 'Draft', avatar: 'CR' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Bar */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-b border-white/10 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <FolderKanban className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Projetos & Workspace InoveCloud
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cards de projetos visuais e fila de outreach inspirados na experiência InoveCloud OS.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'stories' ? 'bg-amber-600 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Projetos & Portfólio
          </button>
          <button
            onClick={() => setActiveTab('outreach')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
              activeTab === 'outreach' ? 'bg-amber-600 text-white shadow-md' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Fila de Outreach (Queue)</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 flex-1">
        {activeTab === 'stories' ? (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>InoveCloud Creative Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Projects That Tell Stories
              </h1>
              <p className="text-xs text-slate-400">
                Aplicações, marcas e infraestruturas concebidas e implantadas na nuvem InoveCloud.
              </p>
            </div>

            {/* Pinned polaroid style cards with paperclips (Matching Screenshot 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-4xl mx-auto">
              {/* Card 1: WaxyWeb */}
              <div className="relative group bg-white rounded-2xl p-4 shadow-2xl text-slate-900 border border-slate-200 transform -rotate-1 hover:rotate-0 transition duration-300">
                {/* Simulated Blue Paperclip on top right */}
                <div className="absolute -top-3.5 right-6 z-10 w-6 h-8 text-blue-600 drop-shadow">
                  <Paperclip className="w-7 h-7 transform rotate-45" />
                </div>

                {/* Simulated browser window top dots */}
                <div className="flex items-center space-x-1.5 pb-3 mb-2 border-b border-slate-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-slate-400 font-mono ml-2">waxyweb.design</span>
                </div>

                <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 mb-3 shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80"
                    alt="WaxyWeb Branding"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">WaxyWeb</h3>
                    <p className="text-xs text-slate-500">Branding, UI/UX & Cloud Hosting</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                    Projects
                  </span>
                </div>
              </div>

              {/* Card 2: Website Design */}
              <div className="relative group bg-white rounded-2xl p-4 shadow-2xl text-slate-900 border border-slate-200 transform rotate-1 hover:rotate-0 transition duration-300">
                {/* Simulated Blue Paperclip */}
                <div className="absolute -top-3.5 right-6 z-10 w-6 h-8 text-blue-600 drop-shadow">
                  <Paperclip className="w-7 h-7 transform rotate-45" />
                </div>

                {/* Browser top dots */}
                <div className="flex items-center space-x-1.5 pb-3 mb-2 border-b border-slate-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-slate-400 font-mono ml-2">figma-preview-2026</span>
                </div>

                <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-100 mb-3 shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80"
                    alt="Figma Design"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">InoveCloud UI System</h3>
                    <p className="text-xs text-slate-500">Website Design • Figma 2026</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                    Case Study
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Outreach Queue View (Matching Screenshot 2) */
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Outreach Queue</h3>
                <p className="text-xs text-slate-500">Fila de contatos de leads B2B e integração cloud</p>
              </div>
              <div className="text-xs text-slate-500">
                <strong>52</strong> accounts • <strong>36</strong> drafts queued
              </div>
            </div>

            <div className="space-y-2">
              {outreachList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-300 transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {item.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.role}</div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition text-slate-600 text-xs font-medium cursor-pointer">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
