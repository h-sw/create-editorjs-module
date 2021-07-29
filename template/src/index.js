class ModuleName {
  constructor({ data }){
    //init module
  }

  static get isReadOnlySupported() {
    return true
  }

  static get toolbox() {
    return {
      title : "",
      icon  : "",
    }
  }

  render(){
    const wrapper = document.createElement('div')
    //something to do
    return wrapper
  }

  save(){
    return {
      type : "",
      text : "",
    }
  }
}

module.exports = ModuleName