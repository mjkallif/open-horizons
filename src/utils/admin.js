import Calendar from 'telegram-bot-calendar'

import { bot } from '../config.js'
import { getUserMessage } from './utils.js'

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
				bot.sendMessage(chatId, `Мероприятие запланировано на ${selectedDate}`)
				bot.deleteMessage(chatId, messageId)
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

export const addEvent = async ({ chat }) => {
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

export const deleteEvent = async () => {

}

export const editEvent = async () => {

}