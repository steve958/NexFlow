"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import NewProjectModal from "@/components/NewProjectModal";
import TemplateBrowser from "@/components/TemplateBrowser";
import { getFirebaseAuth } from "@/lib/firestoreClient";
import { signOut, User, onAuthStateChanged } from "firebase/auth";
import { LogOut, Plus, Clock, Star, Folder, Search, Grid, List, Trash2, Copy, User as UserIcon, Settings, Activity, BarChart3, Edit, Download, LogIn } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";
import { CanvasThemeProvider } from "@/components/CanvasThemeProvider";
import { useCanvasTheme } from "@/components/CanvasThemeProvider";
import { CanvasThemeToggle } from "@/components/CanvasThemeToggle";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getProjects, deleteProject, duplicateProject, getProjectStats, type Project } from "@/lib/projectStorage";
import { createOrUpdateUserProfile, updateUserDisplayName, updateUserBio, getUserStats, UserProfile, UserStats } from "@/lib/userStorage";
import { getUserActivities, formatActivityTime, logUserActivity } from "@/lib/activityStorage";
import { ACTIVITY_DISPLAY_CONFIG, UserActivity } from "@/lib/activityTypes";

function Dashboard() {
  const { isDark } = useCanvasTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'projects' | 'profile' | 'activity'>('projects');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<{ total: number; categories: number; tags: number; lastModified: Date | null }>({ total: 0, categories: 0, tags: 0, lastModified: null });
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isTemplateBrowserOpen, setIsTemplateBrowserOpen] = useState(false);

  // User state management
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Load projects from storage
  useEffect(() => {
    loadProjects();
  }, []);

  // Authentication and user profile loading
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Load or create user profile
        try {
          const profile = await createOrUpdateUserProfile(currentUser);
          setUserProfile(profile);
          setNewDisplayName(profile.displayName);
          setNewBio(profile.bio || '');

          // Load user stats
          const stats = await getUserStats(currentUser.uid);
          setUserStats(stats);

          // Load user activities
          const activities = await getUserActivities(currentUser.uid);
          setUserActivities(activities);

          // Log sign-in activity (only if this is a new session)
          const lastActivity = activities[0];
          const now = new Date();
          const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));

          if (!lastActivity ||
              lastActivity.action !== 'signed_in' ||
              new Date(lastActivity.timestamp) < oneHourAgo) {
            await logUserActivity(currentUser.uid, 'signed_in', 'Signed in to NexFlow');
            // Refresh activities after logging sign-in
            const updatedActivities = await getUserActivities(currentUser.uid);
            setUserActivities(updatedActivities);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
        setUserStats(null);
        setUserActivities([]);
        setNewDisplayName('');
        setNewBio('');
      }
    });

    return () => unsubscribe();
  }, []);

  const loadProjects = async () => {
    try {
      const loadedProjects = await getProjects();
      setProjects(loadedProjects);
      const stats = await getProjectStats();
      setProjectStats(stats);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  };

  const refreshActivities = async () => {
    if (user) {
      try {
        const activities = await getUserActivities(user.uid);
        setUserActivities(activities);
      } catch (error) {
        console.error('Error refreshing activities:', error);
      }
    }
  };

  const handleNewProject = () => {
    setIsNewProjectModalOpen(true);
  };

  const handleUseTemplate = () => {
    setIsTemplateBrowserOpen(true);
  };

  const handleProjectCreated = async (projectId: string, projectName?: string) => {
    loadProjects(); // Refresh project list

    // Log activity
    if (user && projectName) {
      await logUserActivity(user.uid, 'created_project', projectName);
      refreshActivities();
    }

    router.push(`/app/${projectId}`); // Navigate to new project
  };

  const handleTemplateSelected = async (projectId: string, templateName?: string) => {
    loadProjects(); // Refresh project list

    // Log activity
    if (user && templateName) {
      await logUserActivity(user.uid, 'used_template', templateName);
      refreshActivities();
    }

    router.push(`/app/${projectId}`); // Navigate to project created from template
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Project',
      message: `Are you sure you want to delete "${projectName}"? This action cannot be undone and all your work will be permanently lost.`,
      variant: 'danger',
      confirmText: 'Delete Project',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));

        try {
          const success = await deleteProject(projectId);
          if (success) {
            loadProjects(); // Refresh project list

            // Log activity
            if (user) {
              await logUserActivity(user.uid, 'deleted_project', projectName);
              refreshActivities();
            }
          }
        } catch (error) {
          console.error('Error deleting project:', error);
        } finally {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
      }
    });
  };

  const handleDuplicateProject = async (projectId: string) => {
    try {
      const duplicatedProject = await duplicateProject(projectId);
      if (duplicatedProject) {
        loadProjects(); // Refresh project list

        // Log activity
        if (user) {
          await logUserActivity(user.uid, 'duplicated_project', duplicatedProject.name);
          refreshActivities();
        }

        router.push(`/app/${duplicatedProject.id}`); // Navigate to duplicated project
      }
    } catch (error) {
      console.error('Error duplicating project:', error);
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

  // Helper function to convert Firestore timestamp to string
  const timestampToString = (timestamp: unknown): string => {
    if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
      return (timestamp.toDate as () => Date)().toISOString();
    }
    return (timestamp as string) || new Date().toISOString();
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const displayNameChanged = newDisplayName.trim() && newDisplayName !== userProfile?.displayName;
    const bioChanged = newBio !== (userProfile?.bio || '');

    if (!displayNameChanged && !bioChanged) {
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const updates: string[] = [];

      // Update display name if changed
      if (displayNameChanged) {
        await updateUserDisplayName(user.uid, newDisplayName.trim());
        updates.push('display name');
      }

      // Update bio if changed
      if (bioChanged) {
        await updateUserBio(user.uid, newBio);
        updates.push('bio');
      }

      // Update local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          ...(displayNameChanged ? { displayName: newDisplayName.trim() } : {}),
          ...(bioChanged ? { bio: newBio.trim() } : {})
        });
      }

      // Log activity
      const updateDescription = updates.length > 1
        ? `Updated ${updates.join(' and ')}`
        : `Updated ${updates[0]}`;
      await logUserActivity(user.uid, 'updated_profile', updateDescription);
      refreshActivities();
    } catch (error) {
      console.error('Error updating profile:', error);
      // Reset to original values on error
      setNewDisplayName(userProfile?.displayName || '');
      setNewBio(userProfile?.bio || '');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper function to get icon component for activity
  const getActivityIcon = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      Plus,
      Edit,
      Trash2,
      Copy,
      Settings,
      LogIn,
      Star,
      Download,
      Folder
    };
    return iconMap[iconName] || Activity;
  };

  const handleDemoClick = async () => {
    if (user) {
      await logUserActivity(user.uid, 'tried_demo', 'Interactive Demo Scene');
      refreshActivities();
    }
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Left Sidebar - Navigation & Branding */}
      <div className={`w-full lg:w-80 flex flex-col ${
        isDark
          ? 'bg-gradient-to-b from-slate-900 via-blue-900 to-indigo-900'
          : 'bg-gradient-to-b from-white via-blue-50 to-indigo-100'
      } border-b lg:border-b-0 lg:border-r ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      } shadow-xl relative`}>
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <CanvasThemeToggle />
        </div>

        {/* Header */}
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
            <div className="w-12 h-12 lg:w-16 lg:h-16 relative flex-shrink-0">
              <div className={`absolute inset-0 rounded-2xl blur-xl ${
                isDark ? 'bg-blue-500/30' : 'bg-blue-400/40'
              }`}></div>
              <Image
                src="/canvas-logo.png"
                alt="NexFlow Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain rounded-2xl drop-shadow-2xl relative z-10"
              />
            </div>
            <div className="min-w-0">
              <h1 className={`text-xl lg:text-2xl font-bold truncate ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                NexFlow
              </h1>
              <p className={`text-sm ${
                isDark ? 'text-blue-200' : 'text-blue-600'
              }`}>
                Dashboard
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="space-y-2">
            {[
              { id: 'projects', label: 'Projects', icon: Folder, count: projects.length },
              { id: 'profile', label: 'Profile', icon: UserIcon },
              { id: 'activity', label: 'Activity', icon: Activity },
            ].map(({ id, label, icon: Icon, count }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as 'projects' | 'profile' | 'activity')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  activeTab === id
                    ? isDark
                      ? 'bg-blue-500/20 text-blue-300 shadow-lg'
                      : 'bg-blue-100 text-blue-700 shadow-md'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
                {count !== undefined && (
                  <span className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold ${
                    activeTab === id
                      ? isDark
                        ? 'bg-blue-400 text-blue-900'
                        : 'bg-blue-200 text-blue-800'
                      : isDark
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Quick Stats */}
        <div className="flex-1 p-6 lg:p-8">
          <div className={`p-4 lg:p-6 rounded-2xl ${
            isDark
              ? 'bg-gradient-to-br from-gray-800/50 to-slate-800/50 border border-gray-700'
              : 'bg-white/80 border border-gray-200 shadow-lg'
          } backdrop-blur-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Quick Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}>
                    <Folder className={`w-5 h-5 ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <span className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Total Projects
                  </span>
                </div>
                <span className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {projectStats.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'
                  }`}>
                    <BarChart3 className={`w-5 h-5 ${
                      isDark ? 'text-indigo-400' : 'text-indigo-600'
                    }`} />
                  </div>
                  <span className={`text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Categories
                  </span>
                </div>
                <span className={`text-lg font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {projectStats.categories}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="p-6 lg:p-8">
          <button
            onClick={() => {
              const auth = getFirebaseAuth();
              if (auth) signOut(auth);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isDark
                ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                : 'text-red-600 hover:text-red-700 hover:bg-red-100'
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Right Side - Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8">
          {activeTab === 'projects' && (
            <div className="h-full">
              {/* Projects Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-3xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Welcome back!
                  </h2>
                  <p className={`text-lg mt-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Create, collaborate, and visualize your architecture
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <Link
                  href="/app/demo"
                  onClick={handleDemoClick}
                  className={`p-6 rounded-2xl transition-all transform hover:scale-105 group shadow-xl hover:shadow-2xl ${
                    isDark
                      ? 'bg-gradient-to-br from-teal-500 to-blue-600 text-white hover:from-teal-600 hover:to-blue-700'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Try Demo</h3>
                      <p className="text-blue-100 text-sm">Interactive playground</p>
                    </div>
                  </div>
                  <p className="text-white text-sm">
                    Explore NexFlow features with our interactive demo scene
                  </p>
                </Link>

                <button
                  onClick={handleNewProject}
                  className={`p-6 rounded-2xl transition-all text-left group shadow-xl border-2 border-dashed ${
                    isDark
                      ? 'bg-gray-800/50 border-gray-600 hover:border-gray-500 hover:bg-gray-800/70'
                      : 'bg-white/80 border-gray-300 hover:border-gray-400 hover:bg-white'
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Plus className={`w-8 h-8 group-hover:rotate-90 transition-all ${
                      isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-900'
                    }`} />
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        New Project
                      </h3>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Start from scratch
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm transition-colors ${
                    isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    Create a new architecture diagram
                  </p>
                </button>

                <button
                  onClick={handleUseTemplate}
                  className={`p-6 rounded-2xl transition-all text-left group shadow-xl border ${
                    isDark
                      ? 'bg-gray-800/50 border-gray-600 hover:border-indigo-500/50 hover:bg-gray-800/70'
                      : 'bg-white/80 border-gray-200 hover:border-indigo-400 hover:bg-white'
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Folder className={`w-8 h-8 transition-colors ${
                      isDark ? 'text-gray-400 group-hover:text-indigo-400' : 'text-gray-600 group-hover:text-indigo-600'
                    }`} />
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        Use Template
                      </h3>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Quick start
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm transition-colors ${
                    isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    Browse pre-built architecture patterns
                  </p>
                </button>
              </div>

              {/* Projects Section */}
              <div className={`rounded-3xl border shadow-2xl ${
                isDark
                  ? 'bg-gray-900/50 border-gray-700 backdrop-blur-xl'
                  : 'bg-white/80 border-gray-200 backdrop-blur-sm'
              }`}>
                {/* Projects Header */}
                <div className={`p-6 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      My Projects
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === 'grid'
                            ? isDark ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                            : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === 'list'
                            ? isDark ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                            : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>
                </div>

                {/* Projects Grid/List */}
                <div className="p-6">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                      {filteredProjects.map((project) => (
                        <div key={project.id} className={`group rounded-2xl overflow-hidden border shadow-lg hover:shadow-xl transition-all duration-300 relative backdrop-blur-md hover:-translate-y-1 ${
                          isDark
                            ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-teal-400/60'
                            : 'bg-white border-gray-200 hover:border-blue-300/60'
                        }`}>
                          <Link
                            href={project.isDemo ? "/app/demo" : `/app/${project.id}`}
                            className="block"
                          >
                            <div className={`aspect-video flex items-center justify-center relative overflow-hidden ${
                              isDark ? 'bg-gradient-to-br from-teal-600/20 via-blue-600/20 to-indigo-600/20' : 'bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100'
                            }`}>
                              {/* Simple preview or placeholder */}
                              <div className="relative z-10 flex flex-col items-center gap-3">
                                <div className="relative">
                                  <div className={`absolute inset-0 blur-xl ${isDark ? 'bg-blue-400/20' : 'bg-blue-400/40'}`}></div>
                                  <Folder className={`w-16 h-16 relative ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                </div>
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {project.data?.nodes ? `${project.data.nodes.length} nodes` : 'Empty Project'}
                                </span>
                              </div>
                            </div>

                            <div className="p-5">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className={`text-lg font-bold transition-colors duration-300 tracking-tight ${
                                  isDark ? 'text-white group-hover:text-teal-200' : 'text-gray-900 group-hover:text-blue-600'
                                }`}>
                                  {project.name}
                                </h4>
                                {project.isDemo && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${
                                    isDark ? 'bg-teal-500/40 text-teal-200 border-teal-400/30' : 'bg-blue-100 text-blue-700 border-blue-200'
                                  }`}>
                                    Demo
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm mb-4 line-clamp-2 leading-relaxed ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {project.description}
                              </p>
                              <div className={`flex items-center justify-between text-xs ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                                }`}>
                                  <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-teal-400' : 'text-blue-500'}`} />
                                  <span className="font-medium">{formatLastModified(project.lastModified)}</span>
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
                                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                                }`}>
                                  <Folder className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-indigo-500'}`} />
                                  <span className="font-medium">{project.category}</span>
                                </div>
                              </div>
                              {project.tags.length > 0 && (
                                <div className={`flex flex-wrap gap-1.5 mt-3 pt-3 border-t ${
                                  isDark ? 'border-gray-700' : 'border-gray-200'
                                }`}>
                                  {project.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                                      isDark
                                        ? 'bg-gray-800 text-gray-300 border-gray-600 hover:border-teal-500/40'
                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-blue-400/40'
                                    }`}>
                                      #{tag}
                                    </span>
                                  ))}
                                  {project.tags.length > 3 && (
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                                      isDark
                                        ? 'bg-teal-500/20 text-teal-300 border border-teal-400/30'
                                        : 'bg-blue-100 text-blue-700 border border-blue-300'
                                    }`}>
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
                                  className={`p-2.5 rounded-lg shadow-lg border transition-all backdrop-blur-sm hover:scale-110 ${
                                    isDark
                                      ? 'bg-gray-800/90 hover:bg-blue-500/20 border-gray-600 hover:border-blue-400 text-gray-400 hover:text-blue-300'
                                      : 'bg-white/95 hover:bg-blue-50 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600'
                                  }`}
                                  title="Duplicate project"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteProject(project.id, project.name);
                                  }}
                                  className={`p-2.5 rounded-lg shadow-lg border transition-all backdrop-blur-sm hover:scale-110 ${
                                    isDark
                                      ? 'bg-gray-800/90 hover:bg-red-500/20 border-gray-600 hover:border-red-400 text-gray-400 hover:text-red-300'
                                      : 'bg-white/95 hover:bg-red-50 border-gray-300 hover:border-red-400 text-gray-700 hover:text-red-600'
                                  }`}
                                  title="Delete project"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
                          className={`flex items-center gap-4 p-4 border rounded-lg transition-all group ${
                            isDark
                              ? 'border-gray-700 hover:border-teal-400/60 hover:bg-gray-800/50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className={`w-16 h-12 rounded flex items-center justify-center flex-shrink-0 ${
                            isDark ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-gray-100 to-gray-200'
                          }`}>
                            <Folder className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold transition-colors ${
                                isDark ? 'text-white group-hover:text-teal-300' : 'text-gray-900 group-hover:text-blue-600'
                              }`}>
                                {project.name}
                              </h4>
                              {project.isDemo && (
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  isDark ? 'bg-teal-500/20 text-teal-300' : 'bg-blue-100 text-blue-600'
                                }`}>
                                  Demo
                                </span>
                              )}
                            </div>
                            <p className={`text-sm truncate ${
                              isDark ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {project.description}
                            </p>
                          </div>
                          <div className={`flex items-center gap-6 text-xs ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
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
                      <Folder className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <h4 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        No projects found
                      </h4>
                      <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {searchQuery ? 'Try adjusting your search terms' : 'Create your first project to get started'}
                      </p>
                      <button
                        onClick={handleNewProject}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isDark
                            ? 'bg-teal-600 text-white hover:bg-teal-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        New Project
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="h-full max-w-4xl">
              <div className="mb-8">
                <h2 className={`text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Profile Settings
                </h2>
                <p className={`text-lg mt-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Manage your account and preferences
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Profile Info */}
                <div className={`lg:col-span-2 rounded-3xl border shadow-2xl ${
                  isDark
                    ? 'bg-gray-900/50 border-gray-700 backdrop-blur-xl'
                    : 'bg-white/80 border-gray-200 backdrop-blur-sm'
                }`}>
                  <div className={`p-6 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                    <h3 className={`text-xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Personal Information
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-6">
                      {userProfile?.photoURL ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden relative bg-gray-200">
                          <img
                            src={userProfile.photoURL}
                            alt={userProfile.displayName}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ${
                          isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {userProfile ?
                            userProfile.displayName
                              .split(' ')
                              .map(name => name[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)
                            : 'U'
                          }
                        </div>
                      )}
                      <div>
                        <h4 className={`text-2xl font-bold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {userProfile?.displayName || 'Loading...'}
                        </h4>
                        <p className={`text-lg ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {userProfile?.email || 'Loading...'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          disabled={isUpdatingProfile}
                          className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                            isDark
                              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          } focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={userProfile?.email || ''}
                          disabled
                          className={`w-full px-3 py-2 rounded-lg border transition-colors opacity-60 cursor-not-allowed ${
                            isDark
                              ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                              : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about yourself..."
                        value={newBio}
                        onChange={(e) => setNewBio(e.target.value)}
                        disabled={isUpdatingProfile}
                        className={`w-full px-3 py-2 rounded-lg border transition-colors resize-none ${
                          isDark
                            ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                        } focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50`}
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile || (
                          (!newDisplayName.trim() || newDisplayName === userProfile?.displayName) &&
                          newBio === (userProfile?.bio || '')
                        )}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          isDark
                            ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600'
                        }`}
                      >
                        {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <div className={`p-6 rounded-2xl ${
                    isDark
                      ? 'bg-gradient-to-br from-gray-800/50 to-slate-800/50 border border-gray-700'
                      : 'bg-white/80 border border-gray-200 shadow-lg'
                  } backdrop-blur-sm`}>
                    <h4 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Account Stats
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Member since
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {userStats?.memberSince ?
                            (typeof userStats.memberSince === 'string' ?
                              userStats.memberSince :
                              new Date(timestampToString(userStats.memberSince)).toLocaleDateString()
                            ) :
                            'September 2025'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Total projects
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {projectStats.total}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Last active
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {userStats?.lastActive ?
                            new Date(typeof userStats.lastActive === 'string' ?
                              userStats.lastActive :
                              timestampToString(userStats.lastActive)
                            ).toLocaleDateString() :
                            'Today'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl ${
                    isDark
                      ? 'bg-gradient-to-br from-gray-800/50 to-slate-800/50 border border-gray-700'
                      : 'bg-white/80 border border-gray-200 shadow-lg'
                  } backdrop-blur-sm`}>
                    <h4 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Preferences
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Theme
                        </span>
                        <CanvasThemeToggle />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Auto-save
                        </span>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="h-full max-w-4xl">
              <div className="mb-8">
                <h2 className={`text-3xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Recent Activity
                </h2>
                <p className={`text-lg mt-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Your latest actions and updates
                </p>
              </div>

              <div className={`rounded-3xl border shadow-2xl ${
                isDark
                  ? 'bg-gray-900/50 border-gray-700 backdrop-blur-xl'
                  : 'bg-white/80 border-gray-200 backdrop-blur-sm'
              }`}>
                <div className="p-6">
                  {userActivities.length > 0 ? (
                    <div className="space-y-6">
                      {userActivities.map((activity) => {
                        const config = ACTIVITY_DISPLAY_CONFIG[activity.action];
                        const IconComponent = getActivityIcon(config.icon);

                        return (
                          <div key={activity.id} className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                            }`}>
                              <IconComponent className={`w-5 h-5 ${
                                isDark ? 'text-blue-400' : 'text-blue-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start gap-2">
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {config.displayText(activity.details)}
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                {formatActivityTime(activity.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                      <h4 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        No recent activity
                      </h4>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Your recent actions will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}

export default function Home() {
  return (
    <CanvasThemeProvider>
      <AuthGate>
        <Dashboard />
      </AuthGate>
    </CanvasThemeProvider>
  );
}