// Create: frontend/app/components/AdForm/hooks/useProgressModal.ts
import { useState, useCallback } from 'react'

interface ProgressStep {
  id: string
  title: string
  completed: boolean
}

interface ProgressState {
  isOpen: boolean
  title: string
  message: string
  progress: number | null
  currentStep: string
  steps: ProgressStep[]
  currentStepNumber: number
  totalSteps: number
  imageProgress: {
    current: number
    total: number
    currentImageName?: string
  } | null
}

export const useProgressModal = () => {
  const [progressState, setProgressState] = useState<ProgressState>({
    isOpen: false,
    title: '',
    message: '',
    progress: null,
    currentStep: '',
    steps: [],
    currentStepNumber: 0,
    totalSteps: 0,
    imageProgress: null
  })

  const openModal = useCallback((title: string, message: string) => {
    setProgressState(prev => ({
      ...prev,
      isOpen: true,
      title,
      message,
      progress: null,
      currentStep: '',
      steps: [],
      currentStepNumber: 0,
      totalSteps: 0,
      imageProgress: null
    }))
  }, [])

  const closeModal = useCallback(() => {
    setProgressState(prev => ({
      ...prev,
      isOpen: false
    }))
  }, [])

  const updateProgress = useCallback((progress: number) => {
    setProgressState(prev => ({
      ...prev,
      progress
    }))
  }, [])

  const updateCurrentStep = useCallback((stepText: string) => {
    setProgressState(prev => ({
      ...prev,
      currentStep: stepText
    }))
  }, [])

  const initializeSteps = useCallback((steps: string[]) => {
    const stepObjects: ProgressStep[] = steps.map((title, index) => ({
      id: `step-${index}`,
      title,
      completed: false
    }))
    
    setProgressState(prev => ({
      ...prev,
      steps: stepObjects,
      totalSteps: steps.length,
      currentStepNumber: 1
    }))
  }, [])

  const completeStep = useCallback((stepNumber: number) => {
    setProgressState(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index + 1 === stepNumber 
          ? { ...step, completed: true }
          : step
      ),
      currentStepNumber: Math.min(stepNumber + 1, prev.totalSteps)
    }))
  }, [])

  const setImageProgress = useCallback((current: number, total: number, currentImageName?: string) => {
    setProgressState(prev => ({
      ...prev,
      imageProgress: {
        current,
        total,
        currentImageName
      }
    }))
  }, [])

  const clearImageProgress = useCallback(() => {
    setProgressState(prev => ({
      ...prev,
      imageProgress: null
    }))
  }, [])

  const updateMessage = useCallback((message: string) => {
    setProgressState(prev => ({
      ...prev,
      message
    }))
  }, [])

  const resetProgress = useCallback(() => {
    setProgressState(prev => ({
      ...prev,
      progress: null,
      currentStep: '',
      steps: [],
      currentStepNumber: 0,
      totalSteps: 0,
      imageProgress: null
    }))
  }, [])

  return {
    progressState,
    openModal,
    closeModal,
    updateProgress,
    updateCurrentStep,
    initializeSteps,
    completeStep,
    setImageProgress,
    clearImageProgress,
    updateMessage,
    resetProgress
  }
}