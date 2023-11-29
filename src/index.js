import { bot } from './config.js'
import { chooseEvent, initActiveEvents, getUserEvents, getOtherEvents } from './utils/events.js'
import { addEvent, deleteEvent, editEvent, addAdminCommands, initEvents } from './utils/admin.js'

const start = async ({ chat }) => {
	await bot.sendMessage(chat.id, 'Привет, я бот психолог', { reply_markup: {
		keyboard: [ [ { text: 'Мои мероприятия' }, { text: 'Подписаться на мероприятие' } ] ],
		one_time_keyboard: true
	} })
	await chooseEvent(chat.id)
}

const init = () => {
	initEvents()
	initActiveEvents()

	bot.onText(/\/start/, start)

	bot.onText(/Мои мероприятия/, getUserEvents)
	bot.onText(/Подписаться на мероприятие/, getOtherEvents)

	bot.onText(/\/administration/, addAdminCommands)
	bot.onText(/\/addevent/, addEvent)
	bot.onText(/\/deleteevent/, deleteEvent)
	bot.onText(/\/editevent/, editEvent)
}

init()