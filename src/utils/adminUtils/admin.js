import fs from 'fs'

import { bot } from '../../config.js'
import { editEventName, editEventMessage, editEventDate } from './editEvents.js'
import { checkTime, sortTime, getDate } from './time.js'
import { getUserMessage, splitArray, updateJsonFile } from '../utils.js'
import { deleteReminders, createReminders } from './reminders.js'

export const adminIds = [ 484526571, 1242013874 ]
export let events = []

export const initEvents = () => events = JSON.parse(fs.readFileSync('tempdb.json', 'utf-8')).events || []

export const editHelloText = async ({ chat }) => {
	const helloText = await getUserMessage(chat.id, true, {
		question: 'Введите текст приветствия.\nДля того чтобы обратиться к пользователю по имени напишите вместо имени {first_name}, для обращения по фамилии напишите вместо фамилии {last_name}',
		answer: 'Текст приветствия обновлён',
		cancelMessage: 'Обновление приветственного текста отменено'
	})

	updateJsonFile('helloText', helloText)
}

export const addEvent = async ({ chat }) => {
	if (!adminIds.includes(chat.id))
		return await bot.sendMessage(chat.id, 'Извините, но эта команда доступна только администраторам бота')

	let text = (await getUserMessage(chat.id, true, {
		question: 'Как называется ваше мероприятие',
		cancelMessage: 'Добавление мероприятия отменено'
	}))

	if (!text)
		return

	text = text.trim()

	let message = await getUserMessage(chat.id, false, {
		question: 'Введите сообщение, которое будет напоминать пользователю о мероприятии',
		cancelMessage: 'Добавление мероприятия отменено'
	})

	if (!message)
		return

	message = { id: message.message_id, fromId: message.from.id }

	const date = await getDate(chat.id)

	let time = []
	let timeMessage = 'Через запятую введите время, в которое вы хотели бы отправлять уведомления\nНапример:\n10:00, 12:00, 13:30, 15:45'

	while (timeMessage) {
		time = (await getUserMessage(chat.id, true, {
			question: timeMessage,
			cancelMessage: 'Добавление мероприятия отменено'
		})).replace(/\s/g, '').split`,`

		if (!time.length)
			return

		timeMessage = checkTime(time)
	}
	time = sortTime(time)

	await bot.sendMessage(chat.id, `Мероприятие запланировано на ${date}\nНапоминания придут в:\n${time.join('\n')}`)

	const newEvent = { text, message, date, callback_data: text, time, subs: [] }
	createReminders(newEvent)

	events.push(newEvent)
	console.log(newEvent)
	updateJsonFile('events', events)
}

export const deleteEvent = async ({ chat }) => {
	if (!adminIds.includes(chat.id))
		return await bot.sendMessage(chat.id, 'Извините, но эта команда доступна только администраторам бота')

	if (events.length)
		await bot.sendMessage(
			chat.id,
			'Какое мероприятие вы хотите удалить',
			{ reply_markup: { inline_keyboard: splitArray(events, 3) } }
		)
	else
		return await bot.sendMessage(chat.id, 'Cейчас не запланировано никаких мероприятий')

	const handleCallbackQuery = async ({ data }) => {
		const deletingEventIdx = events.findIndex(event => event.text === data)

		if (deletingEventIdx !== -1) {
			deleteReminders(events[deletingEventIdx].text)
			events.splice(deletingEventIdx, 1)
			fs.writeFileSync('tempdb.json', JSON.stringify({ events }), 'utf-8')

			await bot.sendMessage(chat.id, `Мероприятие ${data} удалено`)
		}

		bot.off('callback_query', handleCallbackQuery)
	}

	bot.on('callback_query', handleCallbackQuery)
}

export const editEvent = async ({ chat }) => {
	if (!adminIds.includes(chat.id))
		return await bot.sendMessage(chat.id, 'Извините, но эта команда доступна только администраторам бота')

	if (events.length)
		await bot.sendMessage(
			chat.id,
			'Какое мероприятие вы хотите отредактировать',
			{ reply_markup: { inline_keyboard: splitArray(events, 3) } }
		)
	else
		return await bot.sendMessage(chat.id, 'Cейчас не запланировано никаких мероприятий')

	const handleEditingEvent = async ({ data }) => {
		const editingEventIdx = events.findIndex(event => event.text === data)
		if (editingEventIdx !== -1) {
			await bot.sendMessage(chat.id, `Мероприятие ${data} не найдено`)

			return
		}

		await bot.sendMessage( chat.id, 'Что вы хотите изменить', {
			reply_markup: { inline_keyboard: [
				[ { text: 'Название', callback_data: 'editname' }, { text: 'Содержание', callback_data: 'editmsg' } ],
				[ { text: 'Дата', callback_data: 'editdate' }, { text: 'Время уведомлений', callback_data: 'edittime' } ]
			] }
		})

		const handleEditType = async ({ data }) => {
			switch (data) {
			case 'editname':
				events[editingEventIdx] = editEventName(chat.id)
				break
			case 'editmsg': {
				events[editingEventIdx] = editEventMessage(chat.id)
				break
			}
			case 'editdate':
				editEventDate(chat.id, events[editingEventIdx])
				break
			}

			fs.writeFileSync('tempdb.json', JSON.stringify({ events }), 'utf-8')
			bot.off('callback_query', handleEditType)
		}

		bot.off('callback_query', handleEditingEvent)
		bot.on('callback_query', handleEditType)
	}

	bot.on('callback_query', handleEditingEvent)
}