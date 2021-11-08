import React from 'react'
import { Input, Button } from 'antd'
import Form, { Field } from './components/my-rc-field-form'

const { TextArea } = Input

class RcForm extends React.Component {
  componentDidMount () {
    console.log('this.props', this.props)
    this.props.form.setFieldsValue({
      name: 'default',
      email: 'default@example.com'
    })
  }

  reset = () => {
    this.props.form.resetFields()
  }

  finish = () => {
    const data = this.props.form.getFieldsValue()
    console.log('data', data)
  }
  
  render () {
    return <div style={{
      width: '300px',
      margin: '50px auto'
    }}>
      <Form form={this.props.form}>
        <Field label="用户名" name="name">
          <Input />
        </Field>
        <Field label="邮箱" name="email">
          <Input />
        </Field>
        <div>
          <Button style={{ marginRight: 6 }} onClick={this.reset}>重置</Button>
          <Button type="primary" onClick={this.finish}>提交</Button>
        </div>
      </Form>
    </div>
  }
}

export default Form.create()(RcForm)
