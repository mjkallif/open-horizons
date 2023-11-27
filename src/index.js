import { bot } from './config.js'
import { splitArray } from './utils/utils.js'
import { events, addEvent, deleteEvent, editEvent, addAdminCommands } from './utils/admin.js'

export const activeEvents = {}

const chooseEvent = async chatId => {
	if (events.length)
		await bot.sendMessage(
			chatId,
			'Привет я бот психолог, выберите мероприятие',
			{ reply_markup: { inline_keyboard: splitArray(events, 3) } }
		)
	else {
		await bot.sendMessage(chatId, 'Привет я бот психолог, сейчас не запланировано никаких мероприятий')

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

const start = async ({ chat }) => {
	chooseEvent(chat.id)
}

const init = () => {
	bot.onText(/\/start/, start)

	bot.onText(/\/administration/, addAdminCommands)
	bot.onText(/\/addevent/, addEvent)
	bot.onText(/\/deleteevent/, deleteEvent)
	bot.onText(/\/editevent/, editEvent)
}

init()