import { bot } from '../config.js'

export const getUserMessage = async (chatId, needOnlyText, { question, answer, cancelMessage }) => new Promise(resolve => {
	const cancel = () => {
		clearTimeout(timer)
		bot.off('message', listener)
	}

	const timer = setTimeout(() => {
		bot.sendMessage(chatId, cancelMessage)
		cancel()
		resolve()
	}, 60_000)

	const listener = async msg => {
		if (msg.text === '/cancel') {
			await bot.sendMessage(chatId, cancelMessage)
			cancel()
			resolve()
		}
		else {
			answer && (await bot.sendMessage(chatId, answer))
			cancel()
			resolve(needOnlyText ? msg.text || msg.caption : msg)
		}
	}

	bot.sendMessage(chatId, question)
	bot.on('message', listener)
})

export const splitArray = (arr, subarraySize) => {
	let resultArray = []

	for (let idx = 0; idx < arr.length; idx += subarraySize)
		resultArray.push(arr.slice(idx, idx + subarraySize))

	return resultArray
}