interface Node {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  [key: string]: unknown;
}

interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
  [key: string]: unknown;
}

interface Viewport {
  x: number;
  y: number;
  zoom: number;
  [key: string]: unknown;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  lastModified: string;
  thumbnail?: string;
  isDemo: boolean;
  data?: {
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
  };
  tags: string[];
  category: string;
}

const PROJECTS_STORAGE_KEY = 'nexflow-projects';
const DEMO_PROJECT_ID = 'demo';

// Default demo project
const createDemoProject = (): Project => ({
  id: DEMO_PROJECT_ID,
  name: 'Demo Architecture',
  description: 'Interactive demo showing NexFlow capabilities',
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  thumbnail: '/api/placeholder/300/200',
  isDemo: true,
  tags: ['demo', 'interactive'],
  category: 'demo',
  data: {
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 }
  }
});

// Get all projects from localStorage
export const getProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const projects = stored ? JSON.parse(stored) : [];

    // Always ensure demo project exists
    const hasDemo = projects.find((p: Project) => p.id === DEMO_PROJECT_ID);
    if (!hasDemo) {
      projects.unshift(createDemoProject());
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    }

    return projects;
  } catch (error) {
    console.error('Error loading projects:', error);
    return [createDemoProject()];
  }
};

// Save projects to localStorage
export const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
};

// Get a single project by ID
export const getProject = (id: string): Project | null => {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
};

// Create a new project
export const createProject = (
  name: string,
  description: string,
  category: string = 'general',
  tags: string[] = []
): Project => {
  const newProject: Project = {
    id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    thumbnail: '/api/placeholder/300/200',
    isDemo: false,
    tags,
    category,
    data: {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 }
    }
  };

  const projects = getProjects();
  projects.push(newProject);
  saveProjects(projects);

  return newProject;
};

// Update an existing project
export const updateProject = (id: string, updates: Partial<Project>): Project | null => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);

  if (index === -1) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
    lastModified: new Date().toISOString()
  };

  saveProjects(projects);
  return projects[index];
};

// Delete a project
export const deleteProject = (id: string): boolean => {
  if (id === DEMO_PROJECT_ID) return false; // Cannot delete demo project

  const projects = getProjects();
  const filteredProjects = projects.filter(p => p.id !== id);

  if (filteredProjects.length === projects.length) return false; // Project not found

  saveProjects(filteredProjects);
  return true;
};

// Duplicate a project
export const duplicateProject = (id: string, newName?: string): Project | null => {
  const originalProject = getProject(id);
  if (!originalProject) return null;

  const duplicatedProject: Project = {
    ...originalProject,
    id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: newName || `${originalProject.name} (Copy)`,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    isDemo: false // Duplicated projects are never demo projects
  };

  const projects = getProjects();
  projects.push(duplicatedProject);
  saveProjects(projects);

  return duplicatedProject;
};

// Save project data (nodes, edges, viewport)
export const saveProjectData = (
  id: string,
  data: { nodes: Node[]; edges: Edge[]; viewport: Viewport }
): boolean => {
  const project = updateProject(id, { data });
  return project !== null;
};

// Get project statistics
export const getProjectStats = () => {
  const projects = getProjects();
  const realProjects = projects.filter(p => !p.isDemo);

  return {
    total: realProjects.length,
    categories: [...new Set(realProjects.map(p => p.category))].length,
    tags: [...new Set(realProjects.flatMap(p => p.tags))].length,
    lastModified: realProjects.length > 0
      ? new Date(Math.max(...realProjects.map(p => new Date(p.lastModified).getTime())))
      : null
  };
};