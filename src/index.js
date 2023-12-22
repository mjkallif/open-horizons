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
	adminIds,
	initEvents,
	editHelloText
} from './utils/admin.js'

const start = async ({ chat }) => {
	const helloText = (
		JSON.parse(fs.readFileSync('tempdb.json', 'utf8')).helloText ||
		'Привет, {first_name}'
	).replace(/{first_name}/g, chat.first_name).replace(/{last_name}/g, chat.last_name)

	const commands = adminIds.includes(chat.id)
		? [
			[ { text: 'Мои мероприятия' }, { text: 'Подписаться на мероприятие' } ],
			[ { text: 'Отредактировать приветственное сообщение', callback_data: '/edithello' }, { text: 'Добавить новое мероприятие', callback_data: '/addevent' } ],
			[ { text: 'Удалить мероприятие', callback_data: '/deleteevent' }, { text: 'Отредактировать мероприятие', callback_data: '/editevent' } ]
		]
		: [ [ { text: 'Мои мероприятия' } ], [ { text: 'Подписаться на мероприятие' } ] ]

	await bot.sendMessage(
		chat.id,
		helloText,
		{ reply_markup: { keyboard: commands } }
	)

	await chooseEvent(chat.id)
}

const init = () => {
	initEvents()
	initActiveEvents()

	bot.onText(/\/start/, start)

	bot.onText(/Мои мероприятия/, getUserEvents)
	bot.onText(/Подписаться на мероприятие/, getOtherEvents)

	bot.onText(/\/edithello/, editHelloText)
	bot.onText(/\/addevent/, addEvent)
	bot.onText(/\/deleteevent/, deleteEvent)
	bot.onText(/\/editevent/, editEvent)
}

init()