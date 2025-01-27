import { Loader } from "lucide-react";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <main className="flex-1 self-stretch flex items-center justify-center">
      <div>
        <Loader className="text-primary animate-spin" />
      </div>
    </main>
  );
}
