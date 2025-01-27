import Image from "next/image";
import Logo from "~/components/Logo.png";

export default function Home() {
  return (
    <main className="flex-1 self-stretch flex items-center justify-center">
      <div className="prose dark:prose-invert text-center">
        <Image alt="Twinleaf Wiki Logo" {...Logo} />
        <p>...</p>
        <p>...</p>
      </div>
    </main>
  );
}
