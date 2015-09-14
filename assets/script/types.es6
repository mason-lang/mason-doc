class DocInfo {
	constructor(data) {
		Object.assign(this, data)
	}
}

export class ModuleInfo extends DocInfo {
	constructor(name, opComment, exports) {
		super({name, opComment, exports})
	}
}

export class ExportInfo extends DocInfo {
	constructor(name /* String */, opComment /* Opt[String] */, opValueInfo /* Opt[ValueInfo] */) {
		super({name, opComment, opValueInfo})
	}
}

export class ValueInfo extends DocInfo { }

export class FunInfo extends ValueInfo {
	constructor(kind /* String */, args /* Array[ArgInfo] */) {
		super({kind, args})
	}
}

export class ArgInfo extends DocInfo  {
	// TODO: type should be a Ref
	constructor(name /* String */, opType /* Opt[String] */) {
		super({name, opType})
	}
}

export class ClassInfo extends ValueInfo {
	constructor(
		opSuper /* Opt[String] */,
		statics /* Array[MethodInfo] */,
		opConstructor /* Opt[MethodInfo] */,
		methods /* Array[MethodInfo] */) {
		super({opSuper, statics, opConstructor, methods})
	}
}


export class MethodInfo extends DocInfo {
	constructor(name, opComment, fun) {
		super({name, opComment, fun})
	}
}

export class ConstructorInfo extends DocInfo {
	constructor(opComment, fun) {
		super({opComment, fun})
	}
}
