import fs from 'fs'

import { bot } from '../config.js'
import { splitArray } from './utils.js'
import { events } from './admin.js'

export let activeEvents = {}

export const initActiveEvents = () => activeEvents = JSON.parse(fs.readFileSync('tempdb.json', 'utf-8'))?.activeEvents || {}

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

	const handleChoosedEvent = async ({ data }) => {
		!activeEvents[chatId] && (activeEvents[chatId] = [])
		activeEvents[chatId].push(events.find(event => event.text === data))

		fs.writeFileSync('tempdb.json', JSON.stringify({ events, activeEvents }), 'utf-8')

		await bot.sendMessage(chatId, `Вы подписались на мероприятие ${data}`)
		addReminder(chatId, activeEvents[chatId].at(-1))

		bot.off('callback_query', handleChoosedEvent)
	}

	bot.on('callback_query', handleChoosedEvent)
})

export const addReminder = (chatId, event) => {
	const { message, date } = event

	const [ day, month, year ] = date.split`.`
	const reminderTimes = [ '6:00', '10:00', '11:00' ]

	const reminder = setInterval(() => {
		const currentDate = new Date()

		reminderTimes.forEach(time => {
			const [ hours, minutes ] = time.split`:`
			const reminderDate = new Date(year, month - 1, day, hours, minutes)

			currentDate.getTime() >= reminderDate.getTime()
            && currentDate.getTime() < reminderDate.getTime() + 60_000
                && bot.sendMessage(chatId, message.text)

			if (hours === '11') {
				clearInterval(reminder)

				const deletingEventIdx = events.findIndex(eventToDelete => event.text === eventToDelete.text)
				if (deletingEventIdx !== -1) {
					events.splice(deletingEventIdx, 1)

					for (let chatId in activeEvents) {
						const deletingActiveEventIdx = activeEvents[chatId].findIndex(
							eventToDelete => event.text === eventToDelete.text
						)
						deletingActiveEventIdx !== -1 && activeEvents[chatId].splice(deletingActiveEventIdx, 1)
					}
				}
			}
		})
	}, 60_000)
}