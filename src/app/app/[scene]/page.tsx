import ModernDiagramCanvas from "@/components/ModernDiagramCanvas";
import ClientOnly from "@/components/ClientOnly";
import AuthGate from "@/components/AuthGate";
import { CanvasThemeProvider } from "@/components/CanvasThemeProvider";
import { LoadingSpinner } from "@/components/LoadingSpinner";
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
      <ClientOnly fallback={<LoadingSpinner message="Loading NexFlow..." />}>
        <FadeTransition>
          <AuthGate>
            <ModernDiagramCanvas projectId={scene} />
          </AuthGate>
        </FadeTransition>
      </ClientOnly>
    </CanvasThemeProvider>
  );
}
