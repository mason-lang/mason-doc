export default class DocInfo {}

export class ModuleInfo extends DocInfo {
	constructor(name, opComment, exports) {
		super()
		/** @type {string} */
		this.name = name
		/** @type {?string} */
		this.opComment = opComment
		/** @type {Array<ExportInfo>} */
		this.exports = exports
	}
}

export class ExportInfo extends DocInfo {
	constructor(name, opComment, opValueInfo) {
		super()
		/** @type {string} */
		this.name = name
		/** @type {?string} */
		this.opComment = opComment
		/** @type {?ValueInfo} */
		this.opValueInfo = opValueInfo
	}
}

export class ValueInfo extends DocInfo {}

export class FunInfo extends ValueInfo {
	constructor(kind, args) {
		super()
		/** @type {string} */
		this.kind = kind
		/** @type {Array<ArgInfo>} */
		this.args = args
	}
}

export class ArgInfo extends DocInfo  {
	// TODO: type should be a Ref
	constructor(name, opType) {
		super()
		/** @type {string} */
		this.name = name
		/** @type {?string} */
		this.opType = opType
	}
}

export class ClassInfo extends ValueInfo {
	constructor(opSuper, statics, opConstructor, methods) {
		super()
		/** @type {?string} */
		this.opSuper = opSuper
		/** @type {Array<MethodInfo>} */
		this.statics = statics
		/** @type {?MethodInfo} */
		this.opConstructor = opConstructor
		/** @type {Array<MethodInfo>} */
		this.methods = methods
	}
}

export class MethodInfo extends DocInfo {
	constructor(name, opComment) {
		super()
		/** @type {string} */
		this.name = name
		/** @type {?string} */
		this.opComment = opComment
	}
}

export class MethodImplInfo extends MethodInfo {
	constructor(name, opComment, fun) {
		super(name, opComment)
		/** @type {FunInfo} */
		this.fun = fun
	}
}

export class MethodGetSetInfo extends MethodInfo {
	constructor(name, opComment, kind) {
		super(name, opComment)
		/** @type {'get' | 'set!'} */
		this.kind = kind
	}
}

export class ConstructorInfo extends DocInfo {
	constructor(opComment, fun) {
		super()
		/** @type {?string} */
		this.opComment = opComment
		/** @type {FunInfo} */
		this.fun = fun
	}
}
