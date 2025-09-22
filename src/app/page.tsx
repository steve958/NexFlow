"use client";
import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import { getFirebaseAuth } from "@/lib/firestoreClient";
import { signOut } from "firebase/auth";
import { LogOut, Plus, Clock, Users, Star, Folder, Search, Filter, Grid, List } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for recent projects
  const recentProjects = [
    {
      id: 'demo',
      name: 'Demo Architecture',
      description: 'Interactive demo showing NexFlow capabilities',
      lastModified: '2 hours ago',
      thumbnail: '/api/placeholder/300/200',
      collaborators: 1,
      isDemo: true
    },
    {
      id: 'microservices',
      name: 'E-commerce Microservices',
      description: 'Complete microservices architecture for online retail platform',
      lastModified: '1 day ago',
      thumbnail: '/api/placeholder/300/200',
      collaborators: 3,
      isDemo: false
    },
    {
      id: 'data-pipeline',
      name: 'Data Pipeline Architecture',
      description: 'Real-time data processing and analytics infrastructure',
      lastModified: '3 days ago',
      thumbnail: '/api/placeholder/300/200',
      collaborators: 2,
      isDemo: false
    },
    {
      id: 'cloud-native',
      name: 'Cloud-Native App',
      description: 'Kubernetes-based application deployment architecture',
      lastModified: '1 week ago',
      thumbnail: '/api/placeholder/300/200',
      collaborators: 4,
      isDemo: false
    }
  ];

  const filteredProjects = recentProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthGate>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16">
                  <Image
                    src="/logo.png"
                    alt="NexFlow Logo"
                    width={64}
                    height={64}
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

            <button className="p-6 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group">
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

            <button className="p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all text-left group">
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
                    <Link
                      key={project.id}
                      href={project.isDemo ? "/app/demo" : `/app/${project.id}`}
                      className="group border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all"
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
                            {project.lastModified}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {project.collaborators}
                          </div>
                        </div>
                      </div>
                    </Link>
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
                          {project.lastModified}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.collaborators}
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
                <span className="text-2xl font-bold text-gray-900">4</span>
              </div>
              <p className="text-sm text-gray-600">Total Projects</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">6</span>
              </div>
              <p className="text-sm text-gray-600">Collaborators</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">12</span>
              </div>
              <p className="text-sm text-gray-600">Templates Used</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">24h</span>
              </div>
              <p className="text-sm text-gray-600">This Week</p>
            </div>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
