import { Card } from '@/components/ui/card';
import { BlockCanvas } from '@/components/custom/BlockCanvas';

export default function TestPage() {
  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Block Canvas Test</h1>
        <BlockCanvas />
      </Card>
    </div>
  );
} 