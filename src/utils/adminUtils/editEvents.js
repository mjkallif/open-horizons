import { getUserMessage } from '../utils.js'
import { createReminders, deleteReminders } from './reminders.js'
import { getDate } from './time.js'

export const editEventName = async chatId => {
	const text = await getUserMessage(chatId, true, {
		question: 'Введите новое название мероприятия',
		cancelMessage: 'Изменение мероприятия отменено',
		answer: 'Имя мероприятия изменено'
	})

	if (text)
		return text.trim()
}

export const editEventMessage = async chatId => {
	const message = await getUserMessage(chatId, false, {
		question: 'Введите новое сообщение для напоминания о мероприятии',
		cancelMessage: 'Изменение мероприятия отменено',
		answer: 'Сообщение напоминания изменено'
	})

	if (message)
		return { ...message }
}

export const editEventDate = async (chatId, event) => {
	event.date = await getDate(chatId)

	deleteReminders(event.text)
	createReminders(event)

	return event
}