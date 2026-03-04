import React from 'react'
import BrandChart from '@/src/components/Charts/BrandChart'
import ModelChart from '@/src/components/Charts/ModelChart'
import TotalSaleChart from '@/src/components/Charts/TotalSaleChart'

function Dashboard() {
  return (
    <div className="flex flex-col w-full items-center mt-5 px-6">
      <div className="w-full max-w-250 flex flex-col gap-6">
        <BrandChart />
        <ModelChart />
        <TotalSaleChart />
      </div>
    </div>
  )
}

export default Dashboard
