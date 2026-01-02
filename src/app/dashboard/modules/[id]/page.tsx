import { getModuleById } from '@/lib/data-actions';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { QuestionManagement } from '@/components/dashboard/questions/question-management';

type ModuleEditPageProps = {
  params: {
    id: string;
  };
};

export default async function ModuleEditPage({ params }: ModuleEditPageProps) {
  const module = await getModuleById(params.id);

  if (!module) {
    notFound();
  }

  return (
      <QuestionManagement module={module} />
  );
}
