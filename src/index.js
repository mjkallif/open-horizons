import { bot } from './config.js'
import { initCommands, help, addAdminCommands } from './utils/initCommands.js'
import { addEvent, deleteEvent, editEvent } from './utils/admin.js'

const start = async ({ chat }) => {
	await bot.sendMessage(chat.id, 'Привет я бот психолог, выберите мероприятие', {
		reply_markup: { inline_keyboard: [
			[ { text: 'Кнопка 1', callback_data: 'test_evt' } ]
		] }
	})
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