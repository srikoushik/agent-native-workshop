import { IconArrowLeft } from "@tabler/icons-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="flex min-h-full w-full items-center justify-center px-4 py-12">
      <div className="text-center">
        <h1 className="mb-2 text-6xl font-bold text-foreground/10">404</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          This page does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground transition-colors hover:bg-accent/80"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back home
        </Link>
      </div>
    </div>
  );
}
