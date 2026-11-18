import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto box-content max-w-content px-4 py-section lg:px-6">
      <h1 className="text-title">We can&apos;t find that page</h1>
      <Link href="/" className="mt-stack inline-block">
        Back to home
      </Link>
    </div>
  );
}
