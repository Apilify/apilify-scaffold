import * as yaml from 'js-yaml'
import * as fs from 'fs'
import * as path from 'path'
import * as chalk from 'chalk'

type StringDictionary = { [key: string]: string }
type Dictionary = { [key: string]: any }
interface Definitions {
  Project?:string
  Types?:Dictionary,
  Resources?:Dictionary,
  APIs?:Dictionary,
}

const invariantKey = (keys: string[], json: any): string | void => {
  if (typeof json !== 'object') {
    return undefined
  }
  let obj = <object>json
  let objkeys = Object.keys(obj)
  let invariantKeys = keys.map(x=>x.toLowerCase()) 
  for (let i = 0; i < objkeys.length; ++i) {
    if (invariantKeys.indexOf(objkeys[i].toLowerCase()) !== -1) {
      return objkeys[i]
    }
  }
}
class Scaffold {
  _project: string
  _types: Dictionary
  _resources: StringDictionary
  _apis: StringDictionary

  constructor(definitions: any) {
    let projectKey = invariantKey(['Project','Type'],definitions)
    this._project = projectKey ? definitions[projectKey] : {}

    let typeKey = invariantKey(['Types','Type'],definitions)
    this._types = typeKey ? definitions[typeKey] : {}

    let resourcesKey = invariantKey(['Resources','Resource','Res'],definitions)
    this._resources = resourcesKey ? definitions[resourcesKey] : {}

    let APIsKey = invariantKey(['APIs','API'],definitions)
    this._apis = APIsKey ? definitions[APIsKey] : {}
  }
  exec() {
    console.log(this.buildTypes())
    this.buildAPITypes()
    this.buildAPIs()
    this.writeNewFile()
    this.replaceDefinitions()
  }
  buildTypes():string[] {
    let buildOut:string[] = []
    let indent = 0;
    for (let item in this._types) {
      let itemStr = ''
      const addToString = (str:string) => {
        itemStr += `${' '.repeat(indent)}${str};\n`
      }
      addToString(`type ${item} = {`)
      let typesDict = this._types[item]
      for (let typeName in typesDict) {
        addToString(`${typeName}: ${typesDict[typeName]}`)
      }
      addToString(`}`)
      buildOut.push(itemStr)
    }
    return buildOut
  }
  buildAPITypes() { }
  buildAPIs() { }
  writeNewFile() { }
  replaceDefinitions() { }
}
(async () => {
  console.log(`reading apilify.yml`)
  let file: string
  let definitions: JSON
  console.log(path.join(process.cwd(), "apilify.yml"))
  try {
    file = fs.readFileSync(path.join(process.cwd(), "apilify.yml"), 'utf8')
  }
  catch {
    console.log(chalk.redBright(`cannot read apilify.yml - try running "apilify init"`))
    return
  }

  try {
    definitions = yaml.safeLoad(file);
  }
  catch (e) {
    console.log(e)
    return
  }

  try {
    let scaffold = new Scaffold(definitions)
    scaffold.exec()
  }
  catch (e) {
    console.log(e)
    return
  }

  console.log('handlers created/updated')
})()