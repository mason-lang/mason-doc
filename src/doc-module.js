import {html_beautify} from 'js-beautify'
import collectInfo from './collect-info'
import toHyperscript from './to-hyperscript'

export default function docModule(src, filename) {
	const info = collectInfo(src, filename, {
		// TODO: get this from mason settings in the project's package.json
		builtins: {
			global: [
				'Array', 'Boolean', 'Error', 'Function', 'Number', 'Object', 'String', 'Symbol'
			]
		}
	})
	const hyperTree = toHyperscript(info)
	return html_beautify(hyperTree.outerHTML)
}
