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
	const helloText = (
		JSON.parse(fs.readFileSync('tempdb.json', 'utf8')).helloText ||
		'Привет, {first_name}'
	).replace(/{first_name}/g, chat.first_name).replace(/{last_name}/g, chat.last_name)

	await bot.sendMessage(
		chat.id,
		helloText,
		{ reply_markup: { keyboard: [ [ { text: 'Мои мероприятия' } ], [ { text: 'Подписаться на мероприятие' } ] ] } }
	)
	
	await chooseEvent(chat.id)
}

const handleAnotherText = async ({ chat }) => await bot.sendMessage(chat.id, 'Извините, я вас не понимаю. Попробуйте воспользоваться кнопками "Мои мероприятия" или "Подписаться на мероприятие"')

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

	bot.onText(/.*/, handleAnotherText)
}

init()