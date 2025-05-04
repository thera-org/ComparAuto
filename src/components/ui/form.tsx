// src/components/ui/form.tsx
'use client'

import * as React from 'react'
import {
  useForm as useReactHookForm,
  FormProvider,
  useFormContext,
  Controller,
  type UseFormReturn,
  type FieldValues,
  type SubmitHandler,
  type ControllerProps,
  type ControllerRenderProps,
  type ControllerFieldState,
  type UseFormStateReturn
} from 'react-hook-form'
import { cn } from '@/lib/utils'

// 1. Tipagem principal
interface FormProps<T extends FieldValues> {
    form: UseFormReturn<T>
    onSubmit: SubmitHandler<T>
    children: React.ReactNode
    className?: string
  }

// 2. Componente Form principal
const Form = <T extends FieldValues>({
    form,
    onSubmit,
    children,
    className,
    ...props
  }: FormProps<T>) => {
    if (!form?.handleSubmit) {
      console.error("Invalid form object provided")
      return <div className="p-4 text-red-600">Erro: Configuração do formulário inválida</div>
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-4', className)}
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  )
}

const useForm = useReactHookForm

// 3. Tipagem para FormField
interface FormFieldProps<T extends FieldValues> {
  name: ControllerProps<T>['name']
  render: ({
    field,
    fieldState,
    formState
  }: {
    field: ControllerRenderProps<T>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<T>
  }) => React.ReactNode
}

// 4. Componente FormField
const FormField = <T extends FieldValues>({
  name,
  render
}: FormFieldProps<T>) => {
  const { control, formState } = useFormContext<T>()
  
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          {render({
            field,
            fieldState,
            formState
          })}
        </>
      )}
    />
  )
}

// 5. Componente FormItem
const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('space-y-2', className)}
    {...props}
  />
))
FormItem.displayName = 'FormItem'

// 6. Componente FormLabel
const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'block text-sm font-medium text-gray-700 dark:text-gray-300',
      className
    )}
    {...props}
  />
))
FormLabel.displayName = 'FormLabel'

// 7. Componente FormControl
const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
  <div ref={ref} {...props} />
))
FormControl.displayName = 'FormControl'

// 8. Componente FormMessage
const FormMessage = ({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) => {
  return children ? (
    <p className={cn('text-sm text-red-600 dark:text-red-500', className)}>
      {children}
    </p>
  ) : null
}

// 9. Exportações completas e corretas
export {
    Form,
    useForm, // Agora exportando a constante já renomeada
    useFormContext,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage
  }