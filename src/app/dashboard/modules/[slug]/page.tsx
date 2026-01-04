import { notFound } from 'next/navigation';
import { QuestionManagement } from '@/components/dashboard/questions/question-management';
import { getModuleQuestionsBySlugAction } from '@/actions/modules';

type ModuleEditPageProps = {
  params: {
    slug: string;
  };
};

export default async function ModuleEditPage({ params }: ModuleEditPageProps) {
  try {
    const { slug } = await params;
    const module = await getModuleQuestionsBySlugAction(slug);

    return <QuestionManagement module={module} />;
  } catch (error) {
    notFound();
  }
}
