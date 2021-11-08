import React from 'react'
import FieldContext from './FieldContext'
import FormStore from './FormStore'

function Form (props) {
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

Form.create = () => (WrappedComponent) => {
  return class extends React.Component {
    constructor () {
      super()
      this.formStore = new FormStore()
    }

    render () {
      return <WrappedComponent {...this.props} form={this.formStore} />
    }
  }
}

export default Form