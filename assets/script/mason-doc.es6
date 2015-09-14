import { opIf, opMap } from 'mason-compile/private/util'
import collectInfo from './collect-info'
import { ClassInfo, FunInfo } from './types'
import { elem, setContent, setOrRemove } from './U/dom'

const templates = document.getElementById('link-mason-doc').import

class MyHTMLElement extends HTMLElement {
	static new(opts={}) {
		const _ = document.createElement(this.xmlName)
		Object.assign(_, opts)
		return _
	}

	static register() {
		document.registerElement(this.xmlName, {prototype: this.prototype})
	}

	load(opts={}) {
		this.root = opts.shadow ? this.createShadowRoot() : this
		const template = elem(templates, opts.template || `${this.constructor.xmlName}-template`)
		setContent(this.root, document.importNode(template.content, true))
	}

	elem(name) {
		return elem(this.root, name)
	}
}

export class MasonDocModule extends MyHTMLElement {
	static get xmlName() { return 'mason-doc-module' }

	attachedCallback() {
		const code = this.code
		// TODO: get options from ctr
		const module = collectInfo(code, {
			inFile: 'test.ms',
			builtins: {
				global: [ 'Array', 'Boolean', 'Error', 'Function', 'Number', 'Object', 'String',
					'Symbol' ]
			}
		})

		const { name, opComment, exports } = module
		this.load({shadow: true})
		this.elem('module-name').textContent = name
		setOrRemove(this.elem('module-comment'), opComment)
		setOrRemove(this.elem('module-exports'), exports, _ => MasonDocExport.new({export: _}))
	}
}

class MasonDocExport extends MyHTMLElement {
	static get xmlName() { return 'mason-doc-export' }

	attachedCallback() {
		const { name, opComment, opValueInfo } = this.export

		const template = opValueInfo === null ? null : 'mason-doc-export-with-value-template'
		this.load({template:template})

		const opExtra = opMap(opValueInfo, opValueExtra)
		const opDetail = opMap(opValueInfo, opValueDetail)

		setContent(this.elem('export-name'), name)
		// Don't use setOrRemove because we want to keep the empty space.
		if (opExtra)
			setContent(this.elem('extra'), opExtra)
		setOrRemove(this.elem('brief'), opComment)
		setOrRemove(this.elem('value'), opDetail)
	}
}

// A brief summary, such as arguments.
const opValueExtra = opValueInfo => {
	const _ = opValueInfo
	if (_ instanceof FunInfo)
		return MasonDocArgs.new({fun: _})
	else if (_ instanceof ClassInfo)
		return opMap(_.opSuper, _ => MasonDocSuper.new({super: _}))
	else
		return null
}

class MasonDocSuper extends MyHTMLElement {
	static get xmlName() { return 'mason-doc-super' }

	attachedCallback() {
		this.load()
		this.textContent = this.super
	}
}

const opValueDetail = opValueInfo =>
	opIf(opValueInfo instanceof ClassInfo, () => MasonDocClass.new({class: opValueInfo}))

class MasonDocArgs extends MyHTMLElement {
	static get xmlName() { return 'mason-doc-args' }

	attachedCallback() {
		this.load()
		const { kind, args } = this.fun
		this.elem('fun-kind').textContent = kind
		setContent(this.elem('fun-args'), args.map(arg => MasonDocArg.new({arg})))
	}
}

class MasonDocArg extends MyHTMLElement {
	static get xmlName() { return 'mason-doc-arg' }

	attachedCallback() {
		this.load()
		const { name, opType } = this.arg
		this.elem('arg-name').textContent = name
		setOrRemove(this.elem('arg-type'), opType)
	}
}

class MasonDocClass extends MyHTMLElement {
	static get xmlName() { return 'mason-doc-class' }

	attachedCallback() {
		this.load()
		const { statics, opConstructor, methods } = this.class
		setOrRemove(this.elem('statics'), statics, _ => MasonDocMethod.new({method: _}))
		setOrRemove(this.elem('constructor'), opConstructor, _ => MasonDocConstructor.new({ctr: _}))
		setOrRemove(this.elem('methods'), methods, _ => MasonDocMethod.new({method: _}))
	}
}

class MasonDocConstructor extends MyHTMLElement {
	static get xmlName() { return 'mason-doc-constructor' }

	attachedCallback() {
		this.load()
		const { opComment, fun } = this.ctr
		this.elem('constructor-args').appendChild(MasonDocArgs.new({fun}))
		setOrRemove(this.elem('constructor-comment'), opComment)
	}
}

class MasonDocMethod extends MyHTMLElement {
	static get xmlName() { return 'mason-doc-method' }

	attachedCallback() {
		this.load()
		const { name, opComment, fun } = this.method
		this.elem('method-name').textContent = name
		this.elem('method-args').appendChild(MasonDocArgs.new({fun}))
		setOrRemove(this.elem('method-comment'), opComment)
	}
}

for (const _ of [MasonDocModule, MasonDocExport, MasonDocArgs, MasonDocArg, MasonDocClass,
	MasonDocConstructor, MasonDocMethod, MasonDocSuper])
	_.register()
