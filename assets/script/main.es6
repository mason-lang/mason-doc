import { elem } from './U/dom'
import { MasonDocModule } from './mason-doc'
import fetchModule from './fetch-module'

const getDataFromURL = url => {
	const params = getSearchParams(url)
	const project = params.project
	const module =params.module
	//TODO: assertions, error messages?
	return {project, module}
}

const getSearchParams = url => {
	const search = url.search.slice(1) // take off '?'
	if (search.length === 0)
		return {}
	else {
		const result = {}
		for (const part of search.split('&')) {
			const [key, val] = splitOnce(part, '=')
			result[key] = window.decodeURIComponent(val)
		}
		return result
	}
}
const splitOnce = (str, splitter) => {
	const idx = str.indexOf(splitter)
	return [str.slice(0, idx), str.slice(idx+1)]
}

const show = async function(data) {
	const { link_url, code } = await fetchModule(data)
	const doc = MasonDocModule.new({code})
	document.querySelector('main').appendChild(doc)
	console.log(elem('url'))
	elem('url').href = link_url
}

const data = getDataFromURL(new URL(window.location.href))
show(data)
const form = document.querySelector('form')
form.project.value = data.project
form.module.value = data.module
