import React from 'react'
import FieldContext from './FieldContext'

export default class Field extends React.Component {
  static contextType = FieldContext

  componentDidMount () {
    const { registerEntity } = this.context
    this.cancelRegister = registerEntity(this)
  }

  componentWillUnmount () {
    if (this.cancelRegister) {
      this.cancelRegister()
    }
  }

  onStoreChange = () => {
    this.forceUpdate()
  }

  getControlled = () => {
    const { name } = this.props
    const { setFieldsValue, getFieldValue } = this.context
    return {
      value: getFieldValue(name),
      onChange: evt => {
        setFieldsValue({
          [name]: evt.target.value
        })
      }
    }
  }

  render () {
    const { children, label } = this.props
    const returnChildNode = React.cloneElement(children, this.getControlled())
    return <div className="d-flex mb-20">
      {
        label && <label className="mr-20">{label}</label>
      }
      <div className="flex">
        {returnChildNode}
      </div>
    </div>
  }
}
