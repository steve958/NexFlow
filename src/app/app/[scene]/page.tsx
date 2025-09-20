import ModernDiagramCanvas from "@/components/ModernDiagramCanvas";
import ClientOnly from "@/components/ClientOnly";

export default function ScenePage({ params }: { params: { scene: string } }) {
  return (
    <ClientOnly fallback={
      <div className="h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading NexFlow</h2>
          <p className="text-gray-600">Preparing your diagram canvas...</p>
        </div>
      </div>
    }>
      <ModernDiagramCanvas />
    </ClientOnly>
  );
}
