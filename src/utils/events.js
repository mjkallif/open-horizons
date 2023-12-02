import fs from 'fs'

import { bot } from '../config.js'
import { splitArray, getMedia, updateJsonFile } from './utils.js'
import { events } from './admin.js'

export let activeEvents = {}

export const initActiveEvents = () => {
	const data = JSON.parse(fs.readFileSync('tempdb.json', 'utf-8'))
	activeEvents = data.activeEvents || {}
}

const eventSubscribe = async (chatId, data) => {
	!activeEvents[chatId] && (activeEvents[chatId] = [])
	activeEvents[chatId].push(events.find(event => event.text === data))

	updateJsonFile('activeEvents', activeEvents)
	await bot.sendMessage(chatId, `Вы подписались на мероприятие ${data}`)
	addReminder(chatId, activeEvents[chatId].at(-1))

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
		await bot.sendMessage(chat.id, 'Вы уже подписаны на все возможные мероприятия')
}

export const addReminder = (chatId, event) => {
	const { message, date } = event

	const [ day, month, year ] = date.split`.`
	const reminderTimes = [ '09:00', '13:00', '14:00' ]

	const reminder = setInterval(() => {
		const currentDate = new Date()

		reminderTimes.forEach(time => {
			const [ hours, minutes ] = time.split`:`
			const reminderDate = new Date(year, month - 1, day, hours, minutes)

			if (currentDate.getTime() >= reminderDate.getTime() && currentDate.getTime() < reminderDate.getTime() + 60_000) {
				bot.sendMessage(chatId, message.text || message.caption)
				bot.sendMediaGroup(chatId, getMedia(message))

				if (hours === '11') {
					clearInterval(reminder)
					const deletingEventIdx = events.findIndex(eventToDelete => event.text === eventToDelete.text)

					if (deletingEventIdx !== -1) {
						events.splice(deletingEventIdx, 1)

						for (let chatId in activeEvents) {
							const deletingActiveEventIdx = activeEvents[chatId]
								.findIndex(eventToDelete => event.text === eventToDelete.text)

							deletingActiveEventIdx !== -1 && activeEvents[chatId].splice(deletingActiveEventIdx, 1)
						}
					}
				}
			}
		})
	}, 60_000)
}