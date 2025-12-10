type metricCardProps = {
    title: string;
    metric: string;
}

const MetricCard = ({title, metric} : metricCardProps) => {
  return (
    <>
      <div className="col-span-3 flex flex-col justify-between bg-[#060606] space-y-6 border border-[#131313] rounded-lg p-4">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="font-bold text-3xl">{metric}</p>
      </div>
    </>
  )
}

export default MetricCard
