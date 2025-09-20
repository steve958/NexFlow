import AuthGate from "@/components/AuthGate";
import EditorCanvas from "@/components/EditorCanvas";
import PresenceClient from "@/components/PresenceClient";
import Sidebar from "@/components/Sidebar";

export default function ScenePage({ params }: { params: { scene: string } }) {
  return (
    <AuthGate>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Scene: {params.scene}</h2>
          <PresenceClient sceneId={params.scene} />
        </div>

        {/* The key is flex-1 + min-w-0 on the canvas container */}
        <div className="flex gap-4">
          <Sidebar />
          <div className="flex-1 min-w-0">
            <EditorCanvas />
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
