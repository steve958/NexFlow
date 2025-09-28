import { getFirebaseDb, getFirebaseAuth } from './firestoreClient';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { User } from 'firebase/auth';

interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  description?: string;
  type: 'service' | 'database' | 'queue' | 'gateway' | 'custom' | 'cloud' | 'api' | 'security' | 'storage' | 'compute' | 'network' | 'frontend' | 'mobile' | 'monitor' | 'cache' | 'auth' | 'email' | 'search' | 'analytics' | 'config' | 'cicd' | 'docs' | 'scheduler' | 'users' | 'chat' | 'workflow' | 'container' | 'router' | 'streaming' | 'timer' | 'notification' | 'secrets' | 'code';
  color: string;
  borderColor: string;
  textColor: string;
  shape: 'rectangle' | 'rounded' | 'circle' | 'diamond';
  isVisible: boolean;
  shadow: boolean;
  borderWidth: number;
  fontSize: number;
}

interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle: string;
  targetHandle: string;
  label: string;
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  animated: boolean;
  curvature: number;
  isVisible: boolean;
}

interface Viewport {
  x: number;
  y: number;
  zoom: number;
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
  userId?: string; // Add user ownership
}

const DEMO_PROJECT_ID = 'demo';

// Helper function to convert Firestore timestamp to ISO string
const timestampToString = (timestamp: unknown): string => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return (timestamp.toDate as () => Date)().toISOString();
  }
  return (timestamp as string) || new Date().toISOString();
};

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

// Get current user
const getCurrentUser = (): User | null => {
  const auth = getFirebaseAuth();
  return auth?.currentUser || null;
};

// Get all projects for current user
export const getProjects = async (): Promise<Project[]> => {
  try {
    const db = getFirebaseDb();
    const user = getCurrentUser();

    if (!db || !user) {
      // Return demo project if not authenticated
      return [createDemoProject()];
    }

    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('userId', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    const projects: Project[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      projects.push({
        ...data,
        id: doc.id,
        createdAt: timestampToString(data.createdAt),
        lastModified: timestampToString(data.lastModified),
      } as Project);
    });

    // Sort by lastModified in JavaScript instead of Firestore query
    projects.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    // Always include demo project
    const hasDemo = projects.find(p => p.id === DEMO_PROJECT_ID);
    if (!hasDemo) {
      projects.unshift(createDemoProject());
    }

    return projects;
  } catch (error) {
    console.error('Error loading projects from Firestore:', error);
    return [createDemoProject()];
  }
};

// Get a single project by ID
export const getProject = async (id: string): Promise<Project | null> => {
  try {
    const db = getFirebaseDb();
    const user = getCurrentUser();

    // Return demo project if requesting demo
    if (id === DEMO_PROJECT_ID) {
      return createDemoProject();
    }

    if (!db || !user) {
      return null;
    }

    const projectRef = doc(db, 'projects', id);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists()) {
      return null;
    }

    const data = projectSnap.data();

    // Verify user ownership
    if (data.userId !== user.uid) {
      return null;
    }

    return {
      ...data,
      id: projectSnap.id,
      createdAt: timestampToString(data.createdAt),
      lastModified: timestampToString(data.lastModified),
    } as Project;
  } catch (error) {
    console.error('Error loading project from Firestore:', error);
    return null;
  }
};

// Create a new project
export const createProject = async (
  name: string,
  description: string,
  category: string = 'general',
  tags: string[] = []
): Promise<Project | null> => {
  try {
    const db = getFirebaseDb();
    const user = getCurrentUser();

    if (!db || !user) {
      throw new Error('User not authenticated');
    }

    const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newProject = {
      name,
      description,
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
      thumbnail: '/api/placeholder/300/200',
      isDemo: false,
      tags,
      category,
      userId: user.uid,
      data: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      }
    };

    const projectRef = doc(db, 'projects', projectId);
    await setDoc(projectRef, newProject);

    return {
      ...newProject,
      id: projectId,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    } as Project;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
};

// Update an existing project
export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
  try {
    const db = getFirebaseDb();
    const user = getCurrentUser();

    if (id === DEMO_PROJECT_ID) {
      // Demo project updates are ignored
      return createDemoProject();
    }

    if (!db || !user) {
      throw new Error('User not authenticated');
    }

    const projectRef = doc(db, 'projects', id);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists() || projectSnap.data().userId !== user.uid) {
      return null;
    }

    const updateData = {
      ...updates,
      lastModified: serverTimestamp(),
    };

    await updateDoc(projectRef, updateData);

    const updatedSnap = await getDoc(projectRef);
    const data = updatedSnap.data();

    if (!data) {
      return null;
    }

    return {
      ...data,
      id: updatedSnap.id,
      createdAt: timestampToString(data.createdAt),
      lastModified: timestampToString(data.lastModified),
    } as Project;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
};

// Delete a project
export const deleteProject = async (id: string): Promise<boolean> => {
  try {
    if (id === DEMO_PROJECT_ID) return false; // Cannot delete demo project

    const db = getFirebaseDb();
    const user = getCurrentUser();

    if (!db || !user) {
      return false;
    }

    const projectRef = doc(db, 'projects', id);
    const projectSnap = await getDoc(projectRef);

    if (!projectSnap.exists() || projectSnap.data().userId !== user.uid) {
      return false;
    }

    await deleteDoc(projectRef);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
};

// Duplicate a project
export const duplicateProject = async (id: string, newName?: string): Promise<Project | null> => {
  try {
    const originalProject = await getProject(id);
    if (!originalProject) return null;

    const duplicatedProject = await createProject(
      newName || `${originalProject.name} (Copy)`,
      originalProject.description,
      originalProject.category,
      originalProject.tags
    );

    if (duplicatedProject && originalProject.data) {
      // Copy the diagram data
      await updateProject(duplicatedProject.id, { data: originalProject.data });
    }

    return duplicatedProject;
  } catch (error) {
    console.error('Error duplicating project:', error);
    return null;
  }
};

// Save project data (nodes, edges, viewport)
export const saveProjectData = async (
  id: string,
  data: { nodes: Node[]; edges: Edge[]; viewport: Viewport }
): Promise<boolean> => {
  try {
    const project = await updateProject(id, { data });
    return project !== null;
  } catch (error) {
    console.error('Error saving project data:', error);
    return false;
  }
};

// Get project statistics
export const getProjectStats = async () => {
  try {
    const projects = await getProjects();
    const realProjects = projects.filter(p => !p.isDemo);

    return {
      total: realProjects.length,
      categories: [...new Set(realProjects.map(p => p.category))].length,
      tags: [...new Set(realProjects.flatMap(p => p.tags))].length,
      lastModified: realProjects.length > 0
        ? new Date(Math.max(...realProjects.map(p => new Date(p.lastModified).getTime())))
        : null
    };
  } catch (error) {
    console.error('Error getting project stats:', error);
    return {
      total: 0,
      categories: 0,
      tags: 0,
      lastModified: null
    };
  }
};

// Subscribe to real-time project updates
export const subscribeToProjects = (callback: (projects: Project[]) => void): (() => void) => {
  try {
    const db = getFirebaseDb();
    const user = getCurrentUser();

    if (!db || !user) {
      callback([createDemoProject()]);
      return () => {};
    }

    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('userId', '==', user.uid)
    );

    return onSnapshot(q, (querySnapshot) => {
      const projects: Project[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        projects.push({
          ...data,
          id: doc.id,
          createdAt: timestampToString(data.createdAt),
          lastModified: timestampToString(data.lastModified),
        } as Project);
      });

      // Sort by lastModified in JavaScript instead of Firestore query
      projects.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

      // Always include demo project
      const hasDemo = projects.find(p => p.id === DEMO_PROJECT_ID);
      if (!hasDemo) {
        projects.unshift(createDemoProject());
      }

      callback(projects);
    }, (error) => {
      console.error('Error in project subscription:', error);
      callback([createDemoProject()]);
    });
  } catch (error) {
    console.error('Error setting up project subscription:', error);
    callback([createDemoProject()]);
    return () => {};
  }
};