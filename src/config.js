import TelegramApi from 'node-telegram-bot-api'

const TOKEN = '6783284165:AAHm8BgbN7jZsSa0JAwiguSS_3p2L6a2Rw0'

export const bot = new TelegramApi(TOKEN, { polling: true })
export const adminIds = [ 484526571 ]