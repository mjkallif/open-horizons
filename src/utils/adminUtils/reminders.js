import { bot } from '../../config.js'
import { deleteEvent } from './admin.js'

const reminders = {}

export const createReminders = ({ message, date, time, subs, text }) => {
	const [ day, month, year ] = date.split`.`

	reminders[text] = time.map((eventTime, scheduleIdx) => {
		const [ hours, minutes ] = eventTime.split`:`
		const reminderTime = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes)) - new Date()

		if (reminderTime > 0)
			return setTimeout(() => {
				subs.forEach(async chatId => bot.copyMessage(chatId, message.fromId, message.id))
				scheduleIdx === time.length - 1 && deleteEvent(text)
			}, reminderTime)
	})
}

export const deleteReminders = text => reminders[text] && reminders[text].forEach(reminder => clearTimeout(reminder))