import { bot } from '../config.js'

export const events = []

export const addEvent = async ({ message_id, chat }) => {
	await bot.sendMessage(chat.id, 'Как называется ваше мероприятие')
	events.push({ text: 'evt', callback_data: `event-${message_id}` })
}

export const deleteEvent = async () => {

}

export const editEvent = async () => {

}