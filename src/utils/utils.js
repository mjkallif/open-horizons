import fs from 'fs'

import { bot } from '../config.js'

export const getUserMessage = async (chatId, needOnlyText, { question, answer, cancelMessage }) => new Promise(resolve => {
	const cancel = () => {
		clearTimeout(timer)
		bot.off('message', listener)
	}

	const timer = setTimeout(async () => {
		cancelMessage && await bot.sendMessage(chatId, cancelMessage)

		cancel()
		resolve()
	}, 60_000)

	const listener = async msg => {
		cancel()

		if (msg.text === '/cancel') {
			cancelMessage && await bot.sendMessage(chatId, cancelMessage)
			resolve()
		}
		else {
			answer && await bot.sendMessage(chatId, answer)
			resolve(needOnlyText ? msg.text || msg.caption : msg)
		}
	}

	bot.sendMessage(chatId, question)
	bot.on('message', listener)
})

export const getMedia = msg => {
	let media = []

	if (msg.photo)
		media = msg.photo.map(photo => ({ type: 'photo', media: photo.file_id }))
	if (msg.video)
		media.push({ type: 'video', media: msg.video.file_id })
	else if (msg.document)
		media.push({ type: 'document', media: msg.document.file_id })

	return media
}

export const splitArray = (arr, subarraySize) => {
	const resultArray = []

	for (let idx = 0; idx < arr.length; idx += subarraySize)
		resultArray.push(arr.slice(idx, idx + subarraySize))

	return resultArray
}

export const updateJsonFile = (property, value) => {
	const existingData = JSON.parse(fs.readFileSync('tempdb.json', 'utf8') || {})

	existingData[property] = value
	fs.writeFileSync('tempdb.json', JSON.stringify(existingData, null, 2), 'utf8')
}