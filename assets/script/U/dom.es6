import { assert } from 'mason-compile/private/util'

export const
	elem = (ancestor, name) => {
		if (name === undefined) {
			name = ancestor
			ancestor = document
		}

		const em = ancestor.querySelector(`#${name}`)
		assert(em !== null)
		return em
	},
	setContent = (elem, content) => {
		if (typeof content === 'string')
			elem.textContent = content
		else if (content instanceof Array)
			for (const _ of content)
				elem.appendChild(_)
		else
			elem.appendChild(content)
	},
	setOrRemove = (elem, op, getContent) => {
		if (op instanceof Array)
			if (op.length === 0)
				remove(elem)
			else {
				if (getContent)
					op = op.map(getContent)
				setContent(elem, op)
			}
		else
			if (op === null)
				remove(elem)
			else {
				if (getContent)
					op = getContent(op)
				setContent(elem, op)
			}
	},
	setHTMLOrRemove = (elem, op, getHTML) => {
		if (op === null)
			remove(elem)
		else
			elem.innerHTML = getHTML(op)
	}

const remove = elem => {
	elem.parentNode.removeChild(elem)
}
