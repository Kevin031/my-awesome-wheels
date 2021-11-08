import React from 'react'
import { Input, Button } from 'antd'
import Form, { Field } from './components/my-rc-field-form'

const { TextArea } = Input

function RcForm (props) {
  const [form] = Form.useForm()

  React.useEffect(() => {
    form.setFieldsValue({
      name: 'default',
      email: 'default@example.com'
    })
  }, [])

  const reset = () => {
    form.resetFields()
  }

  const onFinish = () => {
    console.log('提交成功', form.getFieldsValue())
  }

  const onFinishFailed = () => {
    console.log('提交失败')
  }

  return <div style={{
    width: '300px',
    margin: '50px auto'
  }}>
    <Form
      form={form}
      // ref={this.formRef}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Field label="用户名" name="name" rules={[
        { required: true }
      ]}>
        <Input />
      </Field>
      <Field label="邮箱" name="email">
        <Input />
      </Field>
      <div>
        <Button style={{ marginRight: 6 }} onClick={() => reset()}>重置</Button>
        <Button htmlType="submit" type="primary">提交</Button>
      </div>
    </Form>
  </div>
}

export default RcForm
