import fs from 'fs'

import { bot } from './config.js'
import {
	chooseEvent,
	initActiveEvents,
	getUserEvents,
	getOtherEvents
} from './utils/events.js'
import {
	addEvent,
	deleteEvent,
	editEvent,
	addAdminCommands,
	initEvents,
	editHelloText
} from './utils/admin.js'

const start = async ({ chat }) => {
	await bot.sendMessage(
		chat.id,
		JSON.parse(fs.readFileSync('tempdb.json', 'utf8'))?.helloText || 'Привет, я буду твоим личным помощником',
		{ reply_markup: {
			keyboard: [ [ { text: 'Мои мероприятия' }, { text: 'Подписаться на мероприятие' } ] ]
		} }
	)
	await chooseEvent(chat.id)
}

const init = () => {
	initEvents()
	initActiveEvents()

	bot.onText(/\/start/, start)

	bot.onText(/Мои мероприятия/, getUserEvents)
	bot.onText(/Подписаться на мероприятие/, getOtherEvents)

	bot.onText(/\/administration/, addAdminCommands)
	bot.onText(/\/edithello/, editHelloText)
	bot.onText(/\/addevent/, addEvent)
	bot.onText(/\/deleteevent/, deleteEvent)
	bot.onText(/\/editevent/, editEvent)
}

init()