import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { infoPages } from "@/lib/infoPages";
import { InfoRenderer } from "@/components/public/InfoRenderer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ slug?: string[] }>;
};

function findPage(slugSegments: string[] = []) {
  const path = `/${slugSegments.join("/")}`;
  return infoPages.find((page) => page.path === path);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const slugSegments = Array.isArray(resolved?.slug) ? resolved.slug : [];
  const page = findPage(slugSegments);
  if (!page) return {};
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription
  };
}

export default async function InfoPage({ params }: Props) {
  const resolved = await params;
  const slugSegments = Array.isArray(resolved?.slug) ? resolved.slug : [];
  const page = findPage(slugSegments);
  if (!page) {
    notFound();
  }

  return (
    <div className="bg-slate-50 pb-16">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <InfoRenderer page={page} />
      </div>
    </div>
  );
}
