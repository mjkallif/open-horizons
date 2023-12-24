import fs from 'fs'

import { bot } from '../config.js'

export const getUserMessage = async (chatId, needOnlyText, { question, answer, cancelMessage }) => new Promise(resolve => {
	const listener = async msg => {
		if (msg.chat.id === chatId) {
			bot.off('message', listener)

			if (msg.text === '/cancel') {
				cancelMessage && await bot.sendMessage(chatId, cancelMessage)
				resolve()
			}
			else {
				answer && await bot.sendMessage(chatId, answer)
				resolve(needOnlyText ? msg.text || msg.caption : msg)
			}
		}
	}

	bot.sendMessage(chatId, question)
	bot.on('message', listener)
})

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