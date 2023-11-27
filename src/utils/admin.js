import Calendar from 'telegram-bot-calendar'

import { bot } from '../config.js'
import { activeEvents } from '../index.js'
import { getUserMessage, splitArray } from './utils.js'

export const adminIds = [ 484526571 ]
export const events = []

const getDate = async chatId => {
	let currDate = Date.now()
	const ONE_MONTH = 2_592_000_000

	await bot.sendMessage(chatId, 'Когда пройдет ваше мероприятие?', { reply_markup: Calendar.getUI(currDate) })

	return new Promise(resolve => {
		const handleCallbackQuery = async callbackQuery => {
			const messageId = callbackQuery.message.message_id
			const data = callbackQuery.data

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

	const text = (await getUserMessage(chat.id, true, {
		question: 'Как называется ваше мероприятие',
		cancelMessage: 'Добавление мероприятия отменено'
	})).trim()

	if (!text)
		return

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
			activeEvents[chat.id].splice(deletingEventIdx, 1)
		}

		await bot.sendMessage(chat.id, `Мероприятие ${data} удалено`)
		bot.off('callback_query', handleCallbackQuery)
	}

	bot.on('callback_query', handleCallbackQuery)
}

export const editEvent = async ({ chat }) => {
	if (!adminIds.includes(chat.id))
		return await bot.sendMessage(chat.id, 'Извините, но эта команда доступна только администраторам бота')
}