"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import NewProjectModal from "@/components/NewProjectModal";
import TemplateBrowser from "@/components/TemplateBrowser";
import { getFirebaseAuth } from "@/lib/firestoreClient";
import { signOut } from "firebase/auth";
import { LogOut, Plus, Clock, Users, Star, Folder, Search, Filter, Grid, List, Trash2, Copy } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-20 h-20">
                  <Image
                    src="/canvas-logo.png"
                    alt="NexFlow Logo"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">NexFlow</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>All systems operational</span>
                </div>
                <button
                  onClick={() => {
                    const auth = getFirebaseAuth();
                    if (auth) signOut(auth);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
            <p className="text-gray-600">Create, collaborate, and visualize your system architecture.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/app/demo"
              className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">Try Demo</h3>
                  <p className="text-blue-100 text-sm">Interactive playground</p>
                </div>
              </div>
              <p className="text-blue-100 text-sm">
                Explore NexFlow features with our interactive demo scene
              </p>
            </Link>

            <button
              onClick={handleNewProject}
              className="p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">New Project</h3>
                  <p className="text-gray-500 text-sm">Start from scratch</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm group-hover:text-blue-600">
                Create a new architecture diagram
              </p>
            </button>

            <button
              onClick={handleUseTemplate}
              className="p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
            >
              <div className="flex items-center gap-3 mb-3">
                <Folder className="w-8 h-8 text-gray-400 group-hover:text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Use Template</h3>
                  <p className="text-gray-500 text-sm">Quick start</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm group-hover:text-purple-600">
                Browse pre-built architecture patterns
              </p>
            </button>
          </div>

          {/* Projects Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Projects Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Recent Projects</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
                    <div key={project.id} className="group border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all relative">
                      <Link
                        href={project.isDemo ? "/app/demo" : `/app/${project.id}`}
                        className="block"
                      >
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Folder className="w-12 h-12 text-gray-400" />
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {project.name}
                            </h4>
                            {project.isDemo && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Demo</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatLastModified(project.lastModified)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              {project.category}
                            </div>
                          </div>
                          {project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                              {project.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{project.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Project Actions */}
                      {!project.isDemo && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDuplicateProject(project.id);
                              }}
                              className="p-2 bg-white/90 hover:bg-blue-50 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
                              title="Duplicate project"
                            >
                              <Copy className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteProject(project.id, project.name);
                              }}
                              className="p-2 bg-white/90 hover:bg-red-50 rounded-lg shadow-sm border border-gray-200 hover:border-red-300 transition-colors"
                              title="Delete project"
                            >
                              <Trash2 className="w-3 h-3 text-gray-600 hover:text-red-600" />
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
                  <Folder className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No projects found</h4>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? 'Try adjusting your search terms' : 'Create your first project to get started'}
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    New Project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Folder className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{projectStats.total}</span>
              </div>
              <p className="text-sm text-gray-600">Total Projects</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{projectStats.categories}</span>
              </div>
              <p className="text-sm text-gray-600">Categories</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{projectStats.tags}</span>
              </div>
              <p className="text-sm text-gray-600">Unique Tags</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {projectStats.lastModified ? formatLastModified(projectStats.lastModified.toISOString()) : 'None'}
                </span>
              </div>
              <p className="text-sm text-gray-600">Last Activity</p>
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
