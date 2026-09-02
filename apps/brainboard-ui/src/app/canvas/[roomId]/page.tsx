import Whiteboard from "@/components/whiteboard/Whiteboard";

interface CanvasPageProps {
  params: Promise<{ roomId: string }>;
}

const CanvasPage = async ({ params }: CanvasPageProps) => {
  const { roomId } = await params;
  return (
    <div>
      <Whiteboard roomId={roomId} />
    </div>
  );
};

export default CanvasPage;
