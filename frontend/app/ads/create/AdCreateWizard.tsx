'use client'
import { useState } from 'react'
import Step1 from './steps/Step1'
import Step2 from './steps/Step2'
import Step3 from './steps/Step3'
import StepImages from './steps/StepImages'
import StepSubmit from './steps/StepSubmit'

const steps = [Step1, Step2, Step3, StepImages, StepSubmit]

export default function AdCreateWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>({})

  const CurrentComponent = steps[currentStep]

  function nextStep(newData: any) {
    setFormData((prev: any) => ({ ...prev, ...newData }))
    setCurrentStep((s) => s + 1)
  }

  function prevStep() {
    setCurrentStep((s) => s - 1)
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-green-600 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <CurrentComponent
        data={formData}
        onNext={nextStep}
        onBack={prevStep}
        isFirst={currentStep === 0}
        isLast={currentStep === steps.length - 1}
      />
    </div>
  )
}