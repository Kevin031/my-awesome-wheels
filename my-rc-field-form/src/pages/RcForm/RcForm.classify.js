import React from 'react'
import { Input, Button } from 'antd'
import Form, { Field } from './components/my-rc-field-form'

const { TextArea } = Input

class RcFrom extends React.Component {
  formRef = React.createRef(null)

  componentDidMount () {
    console.log('formRef', this.formRef.current)
    // this.formRef.current.setFieldsValue({
    //   name: 'default',
    //   email: 'default@example.com'
    // })
  }

  reset = () => {
    // this.formRef.current.resetFields()
  }

  finish = () => {
    // const data = this.formRef.current.getFieldsValue()
    // console.log('data', data)
  }
  
  render () {
    return <div style={{
      width: '300px',
      margin: '50px auto'
    }}>
      <Form
        // ref={this.formRef}
      >
        <Field label="用户名" name="name">
          <Input />
        </Field>
        <Field label="邮箱" name="email">
          <Input />
        </Field>
        <Field>
          <Button style={{ marginRight: 6 }} onClick={this.reset}>重置</Button>
          <Button type="primary" onClick={this.finish}>提交</Button>
        </Field>
      </Form>
    </div>
  }
}

export default RcFrom
