import { bot } from '../config.js'
import { splitArray } from './utils.js'
import { events } from './admin.js'

export const activeEvents = {}

export const chooseEvent = async chatId => {
	if (events.length)
		await bot.sendMessage(
			chatId,
			'Выберите мероприятие',
			{ reply_markup: { inline_keyboard: splitArray(events, 3) } }
		)
	else {
		await bot.sendMessage(chatId, 'Сейчас не запланировано никаких мероприятий')

		return
	}

	const handleCallbackQuery = async ({ data }) => {
		!activeEvents[chatId] && (activeEvents[chatId] = [])
		activeEvents[chatId].push(events.find(event => event.text === data))

		await bot.sendMessage(chatId, `Вы подписались на мероприятие ${data}`)
		bot.off('callback_query', handleCallbackQuery)
	}

	bot.on('callback_query', handleCallbackQuery)
}