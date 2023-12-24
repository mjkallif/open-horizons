import { bot } from '../config.js'

export const createReminders = ({ message, date, time, subs }) => {
	const [ day, month, year ] = date.split`.`

	return time.map(eventTime => {
		const [ hours, minutes ] = eventTime.split`:`
		const reminderTime = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes)) - new Date()

		if (reminderTime > 0)
			return setTimeout(() => subs.forEach(async chatId => bot.copyMessage(chatId, message.fromId, message.id)), reminderTime)
	})
}

export const deleteReminders = reminders => reminders.forEach(reminder => clearTimeout(reminder))