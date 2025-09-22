"use client";
import { useState, useEffect, useCallback } from "react";
import { X, Search, Filter, Folder, Plus, Clock, User, Layers, GitBranch } from "lucide-react";
import { getTemplates, getTemplateCategories, searchTemplates, type Template } from "@/lib/templateStorage";
import { createProject } from "@/lib/projectStorage";

interface TemplateBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelected: (projectId: string) => void;
}

export default function TemplateBrowser({ isOpen, onClose, onTemplateSelected }: TemplateBrowserProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const categoryLabels: Record<string, { label: string; icon: string }> = {
    microservices: { label: "Microservices", icon: "🔧" },
    cloud: { label: "Cloud Architecture", icon: "☁️" },
    data: { label: "Data & Analytics", icon: "📊" },
    mobile: { label: "Mobile Backend", icon: "📱" },
    network: { label: "Network Topology", icon: "🌐" },
    security: { label: "Security Architecture", icon: "🔒" },
    general: { label: "General", icon: "📋" },
  };

  const loadTemplates = () => {
    const loadedTemplates = getTemplates();
    const loadedCategories = getTemplateCategories();

    setTemplates(loadedTemplates);
    setCategories(loadedCategories);
    setFilteredTemplates(loadedTemplates);
  };

  const filterTemplates = useCallback(() => {
    let result = templates;

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(template => template.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      result = searchTemplates(searchQuery).filter(template =>
        selectedCategory === "all" || template.category === selectedCategory
      );
    }

    setFilteredTemplates(result);
  }, [templates, selectedCategory, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    filterTemplates();
  }, [filterTemplates]);

  const handleCreateFromTemplate = async (template: Template) => {
    setIsCreating(true);
    try {
      console.log('=== TEMPLATE CREATION DEBUG ===');
      console.log('Creating project from template:', template);
      console.log('Template data:', template.data);
      console.log('Template nodes:', template.data?.nodes);
      console.log('Template nodes count:', template.data?.nodes?.length || 0);
      console.log('First template node:', template.data?.nodes?.[0]);

      // Create a new project using the template data
      const newProject = createProject(
        template.name,
        `Created from ${template.name} template`,
        template.category,
        [...template.tags, 'from-template']
      );

      console.log('Created project:', newProject);
      console.log('New project data:', newProject.data);

      // Update the project with template data
      if (newProject.data && template.data) {
        // Generate unique IDs for template nodes and edges
        const nodeIdMap = new Map();
        const uniqueNodes = template.data.nodes.map(node => {
          const uniqueId = `${node.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          nodeIdMap.set(node.id, uniqueId);
          return { ...node, id: uniqueId };
        });

        const uniqueEdges = template.data.edges.map(edge => ({
          ...edge,
          id: `${edge.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sourceId: nodeIdMap.get(edge.sourceId) || edge.sourceId,
          targetId: nodeIdMap.get(edge.targetId) || edge.targetId
        }));

        // Update project data
        newProject.data.nodes = uniqueNodes as unknown as typeof newProject.data.nodes;
        newProject.data.edges = uniqueEdges as unknown as typeof newProject.data.edges;

        // Save updated project data
        const { updateProject } = await import('@/lib/projectStorage');
        const updatedProject = updateProject(newProject.id, { data: newProject.data });

        console.log('Updated project with data:', newProject.data);
        console.log('Final nodes count:', newProject.data?.nodes?.length || 0);
        console.log('Updated project result:', updatedProject);

        // Double-check by retrieving the project again
        const { getProject } = await import('@/lib/projectStorage');
        const savedProject = getProject(newProject.id);
        console.log('Retrieved saved project:', savedProject);
        console.log('Retrieved project nodes:', savedProject?.data?.nodes?.length || 0);
      }

      onClose();
      onTemplateSelected(newProject.id);
    } catch (error) {
      console.error('Error creating project from template:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Folder className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Template Library</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Choose a template to start your project</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Categories
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === "all"
                        ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <span className="mr-2">📚</span>
                    All Templates
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category
                          ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      <span className="mr-2">{categoryLabels[category]?.icon || "📁"}</span>
                      {categoryLabels[category]?.label || category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex min-h-0">
            {/* Template Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all cursor-pointer group ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    {/* Template Preview */}
                    <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center relative">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <span className="text-2xl">{categoryLabels[template.category]?.icon || "📁"}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {template.stats.nodeCount} nodes • {template.stats.edgeCount} connections
                        </div>
                      </div>

                      {template.isBuiltIn && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded-full">
                            Built-in
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(template.updatedAt)}
                        </div>
                        {template.authorName && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {template.authorName}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            +{template.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <Folder className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'Try adjusting your search terms' : 'No templates match the selected category'}
                  </p>
                </div>
              )}
            </div>

            {/* Template Details Panel */}
            {selectedTemplate && (
              <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {selectedTemplate.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedTemplate.stats.nodeCount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Components</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <GitBranch className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedTemplate.stats.edgeCount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Connections</p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</h4>
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                        <span>{categoryLabels[selectedTemplate.category]?.icon || "📁"}</span>
                        {categoryLabels[selectedTemplate.category]?.label || selectedTemplate.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {selectedTemplate.authorName && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{selectedTemplate.authorName}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Updated</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(selectedTemplate.updatedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleCreateFromTemplate(selectedTemplate)}
                      disabled={isCreating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Creating Project...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Use This Template
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}