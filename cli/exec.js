export async function execStream ({ cmd, getData }) {
  const proc = Deno.run({
		cmd,
		stdout: 'piped',
		stderr: 'piped'
	})

	proc.status().then(async ({ code }) => {
		// console.log('finish')
		if (code !== 0) {
			const rawError = await proc.stderrOutput()
			const errorString = new TextDecoder().decode(rawError)
			console.error(errorString)
		}
	})

	for await (const buffer of Deno.iter(proc.stdout)) {
		const str = new TextDecoder().decode(buffer)

		if (getData) {
			getData(str)
		} else {
			console.log(str)
		}
	}

	await proc.close()
}

export async function exec (cmd) {
  const proc = Deno.run({
		cmd,
		stdout: 'piped',
		stderr: 'piped'
	})

	const { code } = await proc.status()

	if (code !== 0) {
		const rawError = await proc.stderrOutput()
		const errorString = new TextDecoder().decode(rawError)
		console.error('exec error: ', errorString, cmd)
	}

	const rawOutput = await proc.output()
	const outStr = new TextDecoder().decode(rawOutput)
	proc.close()

	return outStr
}