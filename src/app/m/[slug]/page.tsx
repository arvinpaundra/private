import { getModuleBySlug } from '@/lib/data-actions';
import { ModuleRunner } from '@/components/module-runner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

type ModulePageProps = {
  params: {
    slug: string;
  };
};

export default async function ModulePage({ params }: ModulePageProps) {
  const module = await getModuleBySlug(params.slug);

  if (!module || !module.isPublished) {
    notFound();
  }

  return (
    <ModuleRunner module={module} />
  );
}

export function generateStaticParams() {
    // This is optional but good for performance.
    // In a real app, you'd fetch all published module slugs.
    return [{ slug: 'photosynthesis-basics' }];
}
