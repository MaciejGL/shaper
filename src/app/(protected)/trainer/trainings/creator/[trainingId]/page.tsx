import { CreateTrainingPlanForm } from '../components/create-training-plan-form/create-training-plan-form'

export default async function CreateTrainingPlanPage(props: {
  params: Promise<{ trainingId: string }>
}) {
  const { trainingId } = await props.params
  return (
    <div className="container py-6 h-full">
      <CreateTrainingPlanForm trainingId={trainingId} />
    </div>
  )
}
