import { bot } from '../config.js'
import { splitArray } from './utils.js'
import { events } from './admin.js'

export const activeEvents = {}

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

	const handleCallbackQuery = async ({ data }) => {
		!activeEvents[chatId] && (activeEvents[chatId] = [])
		activeEvents[chatId].push(events.find(event => event.text === data))

		await bot.sendMessage(chatId, `Вы подписались на мероприятие ${data}`)
		activeEvents[chatId].forEach(event => addReminder(chatId, event))

		bot.off('callback_query', handleCallbackQuery)
	}

	bot.on('callback_query', handleCallbackQuery)
})

export const addReminder = (chatId, event) => {
	const { message, date } = event

	const [ day, month, year ] = date.split`.`
	const reminderTimes = [ '6:00', '10:00', '11:00' ]

	console.log('add')

	setInterval(() => {
		const currentDate = new Date()

		reminderTimes.forEach(time => {
			const [ hours, minutes ] = time.split(':')
			const reminderDate = new Date(year, month - 1, day, hours, minutes)

			console.log(time, currentDate)

			if (currentDate.getTime() >= reminderDate.getTime() && currentDate.getTime() < reminderDate.getTime() + 60_000)
				bot.sendMessage(chatId, message.text)
		})
	}, 60_000)
}