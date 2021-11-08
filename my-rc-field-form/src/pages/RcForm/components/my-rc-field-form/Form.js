import React from 'react'
import FieldContext from './FieldContext'

export default function Form (props) {
  const {
    form,
    onFinish = () => {},
    onFinishFailed = () => {}
  } = props
  form.setCallback({
    onFinish,
    onFinishFailed
  })
  return <form onSubmit={evt => {
    evt.preventDefault()
    form.submit()
  }}>
    <FieldContext.Provider value={form}>
      {props.children}
    </FieldContext.Provider>
  </form>
}
