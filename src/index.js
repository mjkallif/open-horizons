import { bot } from './config.js'
import { chooseEvent } from './utils/events.js'
import { addEvent, deleteEvent, editEvent, addAdminCommands } from './utils/admin.js'

const start = async ({ chat }) => {
	await bot.sendMessage(chat.id, 'Привет, я бот психолог')
	await chooseEvent(chat.id)
}

const init = () => {
	bot.onText(/\/start/, start)

	bot.onText(/\/administration/, addAdminCommands)
	bot.onText(/\/addevent/, addEvent)
	bot.onText(/\/deleteevent/, deleteEvent)
	bot.onText(/\/editevent/, editEvent)
}

init()