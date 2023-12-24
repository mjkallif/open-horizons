import { bot } from '../config.js'

export const scheduleReminders = ({ text, date, time, subs }) => {
	const [ day, month, year ] = date.split`.`

	time.forEach(eventTime => {
		const [ hours, minutes ] = eventTime.split`:`
		const reminderTime = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes)) - new Date()

		reminderTime > 0 && setTimeout(() => subs.forEach(chatId => bot.sendMessage(chatId, text)), reminderTime)
	})
}