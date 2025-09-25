import ModernDiagramCanvas from "@/components/ModernDiagramCanvas";
import ClientOnly from "@/components/ClientOnly";
import AuthGate from "@/components/AuthGate";
import { CanvasThemeProvider } from "@/components/CanvasThemeProvider";

interface ScenePageProps {
  params: Promise<{
    scene: string;
  }>;
}

export default async function ScenePage({ params }: ScenePageProps) {
  const { scene } = await params;

  return (
    <CanvasThemeProvider>
      <ClientOnly fallback={
        <div className="h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">Loading NexFlow</h2>
            <p className="text-gray-300">Preparing your diagram canvas...</p>
          </div>
        </div>
      }>
        <AuthGate>
          <ModernDiagramCanvas projectId={scene} />
        </AuthGate>
      </ClientOnly>
    </CanvasThemeProvider>
  );
}
