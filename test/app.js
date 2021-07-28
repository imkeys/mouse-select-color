class person {
  constructor(params) {
    this.name = params.name
    this.age = params.age
    this.county = params.county
  }
  ask () {
    console.log(`Hello, my name is ${this.name}, ${this.age} years, come form ${this.county}.`)
  }
  
}