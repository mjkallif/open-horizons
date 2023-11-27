import { bot } from './config.js'
import { splitArray } from './utils/utils.js'
import { initCommands, help, addAdminCommands } from './utils/initCommands.js'
import { events, addEvent, deleteEvent, editEvent } from './utils/admin.js'

const activeEvents = {}

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
		bot.sendMessage(chatId, `Вы подписались на мероприятие ${data}`)
		bot.off('callback_query', handleCallbackQuery)

		!activeEvents[chatId] && (activeEvents[chatId] = [])
		activeEvents[chatId].push(events.find(event => event.text === data))
	}

	bot.on('callback_query', handleCallbackQuery)
}

const start = async ({ chat }) => {
	chooseEvent(chat.id)
}

const init = () => {
	initCommands()

	bot.onText(/\/start/, start)
	bot.onText(/\/help/, help)

	bot.onText(/\/administration/, addAdminCommands)
	bot.onText(/\/addevent/, addEvent)
	bot.onText(/\/deleteevent/, deleteEvent)
	bot.onText(/\/editevent/, editEvent)
}

init()