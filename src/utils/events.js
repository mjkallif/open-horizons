import fs from 'fs'

import { bot } from '../config.js'
import { splitArray, updateJsonFile } from './utils.js'
import { events } from './admin.js'

export let activeEvents = {}

export const initActiveEvents = () => activeEvents = JSON.parse(fs.readFileSync('tempdb.json', 'utf-8')).activeEvents || {}

const eventSubscribe = async (chatId, data) => {
	!activeEvents[chatId] && (activeEvents[chatId] = [])
	activeEvents[chatId].push(events.find(event => event.text === data))

	updateJsonFile('activeEvents', activeEvents)
	await bot.sendMessage(chatId, `Вы подписались на мероприятие ${data}`)

	bot.off('callback_query', () => eventSubscribe(chatId, data))
}

export const chooseEvent = async chatId => new Promise(() => {
	if (events.length)
		bot.sendMessage(
			chatId,
			'Выберите мероприятие',
			{ reply_markup: { inline_keyboard: splitArray(events, 3) } }
		)
	else {
		bot.sendMessage(chatId, 'Сейчас не запланировано никаких мероприятий')

		return
	}

	bot.on('callback_query', async ({ data }) => await eventSubscribe(chatId, data))
})

export const getUserEvents = async ({ chat }) => await bot.sendMessage(
	chat.id,
	activeEvents[chat.id] && activeEvents[chat.id].length
		? activeEvents[chat.id].map(event => `На ${event.date} запланировано ${event.text}`).join`\n`
		: 'У вас нет запланированных мероприятий'
)

export const getOtherEvents = async ({ chat }) => {
	const otherEvents = activeEvents[chat.id] && activeEvents[chat.id].length
		? events.filter(event => !activeEvents[chat.id].some(activeEvent => activeEvent.text === event.text))
		: [ ...events ]

	if (otherEvents.length) {
		await bot.sendMessage(
			chat.id,
			'Выберите мероприятие, на которое вы хотели бы подписаться',
			{ reply_markup: { inline_keyboard: splitArray(otherEvents, 3) } }
		)

		bot.on('callback_query', async ({ data }) => await eventSubscribe(chat.id, data))
	}
	else
		await bot.sendMessage(chat.id, events.length
			? 'Вы уже подписаны на все возможные мероприятия'
			: 'В ближайшее время не планируется никаких мероприятий'
		)
}