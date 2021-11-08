class FormStore {
  constructor () {
    this.store = {}
    this.fieldEntities = []
    this.callback = {}
  }

  registerEntity = (entity) => {
    this.fieldEntities.push(entity)
    return () => {
      this.fieldEntities = this.fieldEntities.filter(item => item !== entity)
      delete this.store[entity.props.name]
    }
  }

  resetFields () {
    this.store = {}
    this.fieldEntities.forEach(entity => entity.onStoreChange())
  }

  getFieldValue = (key) => {
    return this.store[key]
  }

  getFieldsValue = () => {
    return this.store
  }

  setFieldValue = (key, value) => {
    this.store[key] = value
  }

  setFieldsValue = (newStore) => {
    this.store = {
      ...this.store,
      ...newStore
    }
    this.fieldEntities.forEach(entity => {
      const { name } = entity.props
      Object.keys(newStore).forEach(key => {
        if (key === name) {
          entity.onStoreChange()
        }
      })
    })
  }

  setCallback = (data) => {
    this.callback = {
      ...this.callback,
      ...data
    }
  }

  validate () {
    this.fieldEntities.forEach(entity => {
      const { name, rules = [] } = entity.props
      rules.forEach(rule => {
        if (rule.required && !this.store[name]) {
          throw new Error(name + ' is required!')
        }
      })
    })
    return true
  }

  submit () {
    try {
      if (this.validate()) {
        console.log('提交数据', this.getFieldsValue())
        if (this.callback.onFinish) {
          this.callback.onFinish()
        }
      }
    } catch (err) {
      console.error(err)
      if (this.callback.onFinishFailed) {
        this.callback.onFinishFailed()
      }
    }
  }
}

export default FormStore
