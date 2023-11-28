import Calendar from 'telegram-bot-calendar'

import { bot } from '../config.js'
import { activeEvents } from './events.js'
import { getUserMessage, splitArray } from './utils.js'

export const adminIds = [ 484526571 ]
export const events = []

const getDate = async chatId => {
	let currDate = Date.now()
	const ONE_MONTH = 2_592_000_000

	await bot.sendMessage(chatId, 'Когда пройдет ваше мероприятие?', { reply_markup: Calendar.getUI(currDate) })

	return new Promise(resolve => {
		const handleCallbackQuery = async ({ message, data }) => {
			const messageId = message.message_id

			if (data.startsWith('clndr-date-')) {
				const selectedDate = data.split`-`[2]

				await bot.sendMessage(chatId, `Мероприятие запланировано на ${selectedDate}`)
				await bot.deleteMessage(chatId, messageId)
				bot.off('callback_query', handleCallbackQuery)

				resolve(selectedDate)
			}
			else if (data.startsWith('clndr-nxtMnth-'))
				await bot.editMessageReplyMarkup(Calendar.getUI(currDate += ONE_MONTH), { chat_id: chatId, message_id: messageId })
			else if (data.startsWith('clndr-prvMnth-'))
				await bot.editMessageReplyMarkup(Calendar.getUI(currDate -= ONE_MONTH), { chat_id: chatId, message_id: messageId })
		}

		bot.on('callback_query', handleCallbackQuery)
	})
}

export const addAdminCommands = async ({ chat }) => {
	if (adminIds.includes(chat.id)) {
		bot.setMyCommands([
			{ command: '/addevent', description: 'Добавьте новое мероприятие' },
			{ command: '/deleteevent', description: 'Удалите мероприятие' },
			{ command: '/editevent', description: 'Отредактируйте мероприятие' }
		])
		await bot.sendMessage(chat.id, 'Включен режим администрирования')
	}
	else
		await bot.sendMessage(chat.id, 'Извините, у вас нет доступа к командам администратора')
}

export const addEvent = async ({ chat }) => {
	if (!adminIds.includes(chat.id))
		return await bot.sendMessage(chat.id, 'Извините, но эта команда доступна только администраторам бота')

	let text = (await getUserMessage(chat.id, true, {
		question: 'Как называется ваше мероприятие',
		cancelMessage: 'Добавление мероприятия отменено'
	})).trim()

	if (!text)
		return

	text = text.trim()

	const message = await getUserMessage(chat.id, false, {
		question: 'Введите сообщение, которое будет напоминать пользователю о мероприятии',
		cancelMessage: 'Добавление мероприятия отменено'
	})

	if (!message)
		return

	const date = await getDate(chat.id)

	events.push({ text, message, date, callback_data: text })
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
			events.splice(deletingEventIdx, 1)

			for (let chatId in activeEvents) {
				const deletingActiveEventIdx = activeEvents[chatId].findIndex(event => event.text === data)
				deletingActiveEventIdx !== -1 && activeEvents[chatId].splice(deletingActiveEventIdx, 1)
			}
		}

		await bot.sendMessage(chat.id, `Мероприятие ${data} удалено`)
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
		editingEventIdx !== -1 && await bot.sendMessage( chat.id, 'Что вы хотите изменить', {
			reply_markup: { inline_keyboard: [ [
				{ text: 'Название', callback_data: 'editname' },
				{ text: 'Содержание', callback_data: 'editmsg' },
				{ text: 'Дата', callback_data: 'editdate' }
			] ] }
		})

		const handleEditType = async ({ data }) => {
			switch (data) {
			case 'editname': {
				const text = await getUserMessage(chat.id, true, {
					question: 'Введите новое название мероприятия',
					cancelMessage: 'Изменение мероприятия отменено',
					answer: 'Имя мероприятия изменено'
				})

				if (!text) {
					bot.off('callback_query', handleEditType)

					return
				}

				events[editingEventIdx].callback_data = events[editingEventIdx].text = text.trim()

				for (let chatId in activeEvents) {
					const editingActiveEventIdx = activeEvents[chatId].findIndex(event => event.text === data)
					editingActiveEventIdx !== -1 &&
						(activeEvents[chatId].text = activeEvents[chatId].callback_data = events[editingEventIdx].text)
				}
				break
			}
			case 'editmsg': {
				const message = await getUserMessage(chat.id, false, {
					question: 'Введите новое сообщение для напоминания о мероприятии',
					cancelMessage: 'Изменение мероприятия отменено',
					answer: 'Сообщение напоминания изменено'
				})

				if (!message) {
					bot.off('callback_query', handleEditType)

					return
				}

				events[editingEventIdx].message = message

				for (let chatId in activeEvents) {
					const editingActiveEventIdx = activeEvents[chatId].findIndex(event => event.text === data)
					editingActiveEventIdx !== -1 && (activeEvents[chatId].message = { ...events[editingEventIdx].message })
				}
				break
			}
			case 'editdate':
				events[editingEventIdx].date = await getDate(chat.id)

				for (let chatId in activeEvents) {
					const editingActiveEventIdx = activeEvents[chatId].findIndex(event => event.text === data)
					editingActiveEventIdx !== -1 && (activeEvents[chatId].date = events[editingEventIdx].date)
				}
				break
			}

			bot.off('callback_query', handleEditType)
		}

		bot.off('callback_query', handleEditingEvent)
		bot.on('callback_query', handleEditType)
	}

	bot.on('callback_query', handleEditingEvent)
}