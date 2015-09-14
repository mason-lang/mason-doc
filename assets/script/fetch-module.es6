import 'fetch'

export default async function(data) {
	const project = data.project.replace(/\./g, '/')
	const module = data.module.replace(/\./g, '/') + '.ms'

	const raw_url = `//raw.githubusercontent.com/${project}/master/${module}`
	const link_url = `//github.com/${project}/blob/master/${module}`

	const code = test_code // await get_text(raw_url)
	return { link_url, raw_url, code }
}

async function get_text(url) {
	const response = await fetch(url)
	return await response.text()
}

const test_code = `
| Best module ever!

A.
	| Good ol' A.
	1

fun. |x
	| Comment
	x

Classy-The-Class. class A
	| A class

	static
		"m" |
			| Static method
			1

		"m2" |
			| Even more static
			3

	construct! a:A b
		| Construct it here!
		super!

	"method" |
		| A method
		1
`
