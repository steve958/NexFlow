"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import NewProjectModal from "@/components/NewProjectModal";
import TemplateBrowser from "@/components/TemplateBrowser";
import { getFirebaseAuth } from "@/lib/firestoreClient";
import { signOut } from "firebase/auth";
import { LogOut, Plus, Clock, Star, Folder, Search, Filter, Grid, List, Trash2, Copy, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getProjects, deleteProject, duplicateProject, getProjectStats, type Project } from "@/lib/projectStorage";

export default function Home() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<{ total: number; categories: number; tags: number; lastModified: Date | null }>({ total: 0, categories: 0, tags: 0, lastModified: null });
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);

  // Load projects from storage
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const loadedProjects = getProjects();
    setProjects(loadedProjects);
    setProjectStats(getProjectStats());
  };

  const handleNewProject = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleUseTemplate = () => {
    setIsTemplateBrowserOpen(true);
  };

  const handleProjectCreated = (projectId: string) => {
    loadProjects(); // Refresh project list
    router.push(`/app/${projectId}`); // Navigate to new project
  };

  const handleTemplateSelected = (projectId: string) => {
    loadProjects(); // Refresh project list
    router.push(`/app/${projectId}`); // Navigate to project created from template
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      const success = deleteProject(projectId);
      if (success) {
        loadProjects(); // Refresh project list
      }
    }
  };

  const handleDuplicateProject = (projectId: string) => {
    const duplicatedProject = duplicateProject(projectId);
    if (duplicatedProject) {
      loadProjects(); // Refresh project list
      router.push(`/app/${duplicatedProject.id}`); // Navigate to duplicated project
    }
  };

  const formatLastModified = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AuthGate>
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        {/* Header */}
        <header className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16">
                  <Image
                    src="/canvas-logo.png"
                    alt="NexFlow Logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain rounded-xl drop-shadow-lg"
                  />
                </div>
                <h1 className="text-2xl font-bold text-white">NexFlow</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                  <span>All systems operational</span>
                </div>
                <button
                  onClick={() => {
                    const auth = getFirebaseAuth();
                    if (auth) signOut(auth);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-2">Welcome back!</h2>
            <p className="text-white/90 text-lg drop-shadow-md">Create, collaborate, and visualize your system architecture.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/app/demo"
              className="p-6 bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-2xl hover:from-teal-600 hover:to-blue-700 transition-all transform hover:scale-105 group shadow-xl hover:shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Try Demo</h3>
                  <p className="text-teal-50 text-sm">Interactive playground</p>
                </div>
              </div>
              <p className="text-white text-sm">
                Explore NexFlow features with our interactive demo scene
              </p>
            </Link>

            <button
              onClick={handleNewProject}
              className="p-6 bg-white/10 backdrop-blur-md border-2 border-white/20 border-dashed rounded-2xl hover:border-white/40 hover:bg-white/15 transition-all text-left group shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <Plus className="w-8 h-8 text-white/70 group-hover:text-white group-hover:rotate-90 transition-all" />
                <div>
                  <h3 className="text-lg font-semibold text-white">New Project</h3>
                  <p className="text-white/50 text-sm">Start from scratch</p>
                </div>
              </div>
              <p className="text-white/80 text-sm group-hover:text-white transition-colors">
                Create a new architecture diagram
              </p>
            </button>

            <button
              onClick={handleUseTemplate}
              className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl hover:border-indigo-400/50 hover:bg-white/15 transition-all text-left group shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <Folder className="w-8 h-8 text-white/70 group-hover:text-indigo-300 transition-colors" />
                <div>
                  <h3 className="text-lg font-semibold text-white">Use Template</h3>
                  <p className="text-white/50 text-sm">Quick start</p>
                </div>
              </div>
              <p className="text-white/80 text-sm group-hover:text-white transition-colors">
                Browse pre-built architecture patterns
              </p>
            </button>
          </div>

          {/* Projects Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
            {/* Projects Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white drop-shadow-md">Recent Projects</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-teal-500/30 text-teal-300' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-teal-500/30 text-teal-300' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-white placeholder-white/60"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 transition-colors text-white">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            {/* Projects Grid/List */}
            <div className="p-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="group bg-gradient-to-br from-white/5 to-white/10 border border-white/20 rounded-2xl overflow-hidden hover:border-teal-400/60 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 relative backdrop-blur-md hover:-translate-y-1">
                      <Link
                        href={project.isDemo ? "/app/demo" : `/app/${project.id}`}
                        className="block"
                      >
                        <div className="aspect-video bg-gradient-to-br from-teal-600/20 via-blue-600/20 to-indigo-600/20 flex items-center justify-center relative overflow-hidden group/preview">
                          {/* Animated gradient background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/10 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500"></div>

                          {/* Grid background pattern */}
                          <div className="absolute inset-0 opacity-30 group-hover/preview:opacity-40 transition-opacity duration-300" style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
                            backgroundSize: '24px 24px'
                          }}></div>

                          {/* Mini canvas preview */}
                          {project.data?.nodes && project.data.nodes.length > 0 ? (
                            <svg className="w-full h-full relative z-10 transition-all duration-700 ease-out" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid meet">
                              {/* Enhanced glow effect definitions */}
                              <defs>
                                <filter id={`glow-${project.id}`} x="-50%" y="-50%" width="200%" height="200%">
                                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                  <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                  </feMerge>
                                </filter>
                                <linearGradient id={`nodeGrad-${project.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                              </defs>

                              {/* Draw edges first (behind nodes) */}
                              {project.data?.edges?.slice(0, 10).map((edge: { id: string; sourceId: string; targetId: string }, idx: number) => {
                                const sourceNode = project.data?.nodes.find((n: { id: string; x: number; y: number; width: number; height: number }) => n.id === edge.sourceId);
                                const targetNode = project.data?.nodes.find((n: { id: string; x: number; y: number; width: number; height: number }) => n.id === edge.targetId);
                                if (!sourceNode || !targetNode) return null;

                                const scale = 0.3;
                                const x1 = (sourceNode.x + sourceNode.width / 2) * scale + 50;
                                const y1 = (sourceNode.y + sourceNode.height / 2) * scale + 30;
                                const x2 = (targetNode.x + targetNode.width / 2) * scale + 50;
                                const y2 = (targetNode.y + targetNode.height / 2) * scale + 30;

                                // Calculate control points for bezier curve
                                const midX = (x1 + x2) / 2;
                                const midY = (y1 + y2) / 2;
                                const dx = x2 - x1;
                                const dy = y2 - y1;
                                const offsetX = -dy * 0.2;
                                const offsetY = dx * 0.2;

                                return (
                                  <g key={`edge-${idx}`}>
                                    {/* Edge glow shadow */}
                                    <path
                                      d={`M ${x1} ${y1} Q ${midX + offsetX} ${midY + offsetY} ${x2} ${y2}`}
                                      stroke="rgba(20, 184, 166, 0.3)"
                                      strokeWidth="4"
                                      fill="none"
                                      className="blur-sm"
                                    />
                                    {/* Main edge */}
                                    <path
                                      d={`M ${x1} ${y1} Q ${midX + offsetX} ${midY + offsetY} ${x2} ${y2}`}
                                      stroke="rgba(45, 212, 191, 0.7)"
                                      strokeWidth="2.5"
                                      fill="none"
                                      strokeDasharray="5,3"
                                      className="group-hover/preview:stroke-teal-300 group-hover/preview:stroke-[3] transition-all duration-500"
                                    />
                                    {/* Arrow head */}
                                    <circle cx={x2} cy={y2} r="3" fill="rgba(45, 212, 191, 0.8)" className="group-hover/preview:r-[4] transition-all" />
                                  </g>
                                );
                              })}

                              {/* Draw nodes */}
                              {project.data?.nodes.slice(0, 8).map((node: { x?: number; y?: number; width?: number; height?: number; color?: string; borderColor?: string }, idx: number) => {
                                const scale = 0.3;
                                const x = (node.x || 0) * scale + 50;
                                const y = (node.y || 0) * scale + 30;
                                const w = (node.width || 100) * scale;
                                const h = (node.height || 60) * scale;

                                return (
                                  <g key={idx} className="group/node">
                                    {/* Node outer glow */}
                                    <rect
                                      x={x - 2}
                                      y={y - 2}
                                      width={w + 4}
                                      height={h + 4}
                                      rx="8"
                                      fill={node.color || '#3b82f6'}
                                      fillOpacity="0.2"
                                      className="blur-sm group-hover/preview:fill-opacity-40 transition-all duration-500"
                                    />
                                    {/* Node background */}
                                    <rect
                                      x={x}
                                      y={y}
                                      width={w}
                                      height={h}
                                      rx="6"
                                      fill={node.color || '#3b82f6'}
                                      fillOpacity="0.85"
                                      stroke={node.borderColor || '#1e40af'}
                                      strokeWidth="2.5"
                                      filter={`url(#glow-${project.id})`}
                                      className="group-hover/preview:fill-opacity-100 group-hover/preview:stroke-[3] transition-all duration-500"
                                    />
                                    {/* Node gradient overlay */}
                                    <rect
                                      x={x}
                                      y={y}
                                      width={w}
                                      height={h}
                                      rx="6"
                                      fill={`url(#nodeGrad-${project.id})`}
                                    />
                                    {/* Node shine effect */}
                                    <rect
                                      x={x + 2}
                                      y={y + 2}
                                      width={w - 4}
                                      height={h * 0.35}
                                      rx="4"
                                      fill="rgba(255,255,255,0.25)"
                                      className="group-hover/preview:fill-white/35 transition-all duration-300"
                                    />
                                  </g>
                                );
                              })}
                            </svg>
                          ) : (
                            <div className="relative z-10 flex flex-col items-center gap-3">
                              <div className="relative">
                                <div className="absolute inset-0 bg-teal-400/20 blur-xl group-hover/preview:bg-teal-400/40 transition-all duration-500"></div>
                                <Folder className="w-20 h-20 text-white/40 group-hover/preview:text-teal-300 transition-all duration-500 relative" />
                              </div>
                              <span className="text-xs text-white/50 group-hover/preview:text-white/70 transition-colors">Empty Project</span>
                            </div>
                          )}

                          {/* Stats overlay */}
                          {project.data?.nodes && project.data.nodes.length > 0 && (
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-4 text-white">
                                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                                    <Layers className="w-3.5 h-3.5 text-teal-300" />
                                    <span className="font-medium">{project.data.nodes.length}</span>
                                  </div>
                                  {project.data.edges && project.data.edges.length > 0 && (
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                                      <svg className="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                      <span className="font-medium">{project.data.edges.length}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Hover overlay effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/0 via-blue-500/0 to-indigo-500/0 group-hover/preview:from-teal-500/20 group-hover/preview:via-blue-500/20 group-hover/preview:to-indigo-500/20 transition-all duration-700"></div>

                          {/* Corner accent */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-400/0 group-hover/preview:from-teal-400/30 transition-all duration-500 blur-2xl"></div>
                        </div>
                        <div className="p-5 bg-gradient-to-b from-transparent to-black/10">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-bold text-white drop-shadow-md group-hover:text-teal-200 transition-colors duration-300 tracking-tight">
                              {project.name}
                            </h4>
                            {project.isDemo && (
                              <span className="px-3 py-1 bg-gradient-to-r from-teal-500/40 to-blue-500/40 text-teal-200 text-xs font-semibold rounded-full border border-teal-400/30 backdrop-blur-sm">Demo</span>
                            )}
                          </div>
                          <p className="text-sm text-white/90 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                          <div className="flex items-center justify-between text-xs text-white/80">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-md">
                              <Clock className="w-3.5 h-3.5 text-teal-300" />
                              <span className="font-medium">{formatLastModified(project.lastModified)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-md">
                              <Folder className="w-3.5 h-3.5 text-blue-300" />
                              <span className="font-medium">{project.category}</span>
                            </div>
                          </div>
                          {project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/10">
                              {project.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2.5 py-1 bg-gradient-to-r from-white/15 to-white/10 text-white text-xs rounded-md border border-white/30 hover:border-teal-400/40 transition-colors font-medium">
                                  #{tag}
                                </span>
                              ))}
                              {project.tags.length > 3 && (
                                <span className="px-2.5 py-1 bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-300 text-xs rounded-md border border-teal-400/30 font-semibold">
                                  +{project.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Project Actions */}
                      {!project.isDemo && (
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDuplicateProject(project.id);
                              }}
                              className="p-2.5 bg-white/95 hover:bg-blue-50 rounded-lg shadow-lg border border-white/40 hover:border-blue-400 transition-all backdrop-blur-sm hover:scale-110"
                              title="Duplicate project"
                            >
                              <Copy className="w-3.5 h-3.5 text-gray-700 hover:text-blue-600 transition-colors" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteProject(project.id, project.name);
                              }}
                              className="p-2.5 bg-white/95 hover:bg-red-50 rounded-lg shadow-lg border border-white/40 hover:border-red-400 transition-all backdrop-blur-sm hover:scale-110"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-gray-700 hover:text-red-600 transition-colors" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={project.isDemo ? "/app/demo" : `/app/${project.id}`}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <div className="w-16 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center flex-shrink-0">
                        <Folder className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {project.name}
                          </h4>
                          {project.isDemo && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Demo</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{project.description}</p>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatLastModified(project.lastModified)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Folder className="w-3 h-3" />
                          {project.category}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <Folder className="w-12 h-12 text-white/40 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-white drop-shadow-md mb-2">No projects found</h4>
                  <p className="text-white/80 mb-4">
                    {searchQuery ? 'Try adjusting your search terms' : 'Create your first project to get started'}
                  </p>
                  <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                    New Project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-teal-500/30 rounded-lg flex items-center justify-center">
                  <Folder className="w-4 h-4 text-teal-300" />
                </div>
                <span className="text-2xl font-bold text-white">{projectStats.total}</span>
              </div>
              <p className="text-sm text-white/90 font-medium">Total Projects</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-blue-300" />
                </div>
                <span className="text-2xl font-bold text-white">{projectStats.categories}</span>
              </div>
              <p className="text-sm text-white/90 font-medium">Categories</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-indigo-500/30 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-indigo-300" />
                </div>
                <span className="text-2xl font-bold text-white">{projectStats.tags}</span>
              </div>
              <p className="text-sm text-white/90 font-medium">Unique Tags</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-purple-300" />
                </div>
                <span className="text-2xl font-bold text-white">
                  {projectStats.lastModified ? formatLastModified(projectStats.lastModified.toISOString()) : 'None'}
                </span>
              </div>
              <p className="text-sm text-white/90 font-medium">Last Activity</p>
            </div>
          </div>
        </main>

        {/* New Project Modal */}
        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onProjectCreated={handleProjectCreated}
        />

        {/* Template Browser Modal */}
        <TemplateBrowser
          isOpen={isTemplateBrowserOpen}
          onClose={() => setIsTemplateBrowserOpen(false)}
          onTemplateSelected={handleTemplateSelected}
        />
      </div>
    </AuthGate>
  );
}
