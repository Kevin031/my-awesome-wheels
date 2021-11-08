import React from 'react'
import FormStore from './FormStore'

export default function useForm () {
  const formRef = React.useRef()
  if (!formRef.current) {
    formRef.current = new FormStore()
  }
  return [formRef.current]
}
