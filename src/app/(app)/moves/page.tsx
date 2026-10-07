import type { Metadata } from "next";
import { MovesGrid } from "@/components/moves/moves-grid";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Moves" };

export default function MovesPage() {
  return (
    <div>
      <PageHeader eyebrow="21 moves · 4 days" title="Moves" />
      <MovesGrid />
    </div>
  );
}
