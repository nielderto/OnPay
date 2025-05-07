import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <h1 className="text-2xl font-bold">Not Found</h1>
      <Link href="/homepage" className="p-2 bg-blue-500 text-white rounded-md">Go Home</Link>
    </div>
  );
}
