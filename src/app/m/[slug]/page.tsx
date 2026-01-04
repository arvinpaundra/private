import { ModuleRunner } from '@/components/module-runner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import { getModuleBySlug } from '@/actions/modules';

type ModulePageProps = {
  params: {
    slug: string;
  };
};

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params;

  const module = await getModuleBySlug(slug);

  if (!module || !module.is_published) {
    notFound();
  }

  return <ModuleRunner module={module} />;
}

export function generateStaticParams() {
  // This is optional but good for performance.
  // In a real app, you'd fetch all published module slugs.
  return [{ slug: 'photosynthesis-basics' }];
}
