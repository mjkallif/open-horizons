import { adminIds, bot } from '../config.js'

const commands = [
	{ command: '/help', description: 'Подробная информация о командах' }
]

export const initCommands = () => bot.setMyCommands(commands)

export const help = async ({ chat }) => bot.sendMessage(chat.id, 'Список команд')

export const addAdminCommands = async ({ chat }) => {
	if (adminIds.includes(chat.id)) {
		bot.setMyCommands([
			...commands,
			{ command: '/addevent', description: 'Добавьте новое мероприятие' },
			{ command: '/deleteevent', description: 'Удалите мероприятие' },
			{ command: '/editevent', description: 'Отредактируйте мероприятие' }
		])
		bot.sendMessage(chat.id, 'Включен режим администрирования')
	}
	else
		bot.sendMessage(chat.id, 'Извините, у вас нет доступа к командам администратора')
}