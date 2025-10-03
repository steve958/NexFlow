import ModernDiagramCanvas from "@/components/ModernDiagramCanvas";
import ClientOnly from "@/components/ClientOnly";
import AuthGate from "@/components/AuthGate";
import { CanvasThemeProvider } from "@/components/CanvasThemeProvider";
import { FadeTransition } from "@/components/PageTransition";

interface ScenePageProps {
  params: Promise<{
    scene: string;
  }>;
}

export default async function ScenePage({ params }: ScenePageProps) {
  const { scene } = await params;

  return (
    <CanvasThemeProvider>
      <ClientOnly
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-blue-600 font-medium text-lg">Loading NexFlow...</p>
            </div>
          </div>
        }
      >
        <FadeTransition>
          <AuthGate>
            <ModernDiagramCanvas projectId={scene} />
          </AuthGate>
        </FadeTransition>
      </ClientOnly>
    </CanvasThemeProvider>
  );
}
