export const contactRecipient = 'dustlineadv@gmail.com'
export const contactSender = 'contact-form@contact-mail.dustline.jp'
export const contactEndpoint = '/api/contact'

export const contactTopics = {
  magazine: '雑誌の購入・閲覧',
  advertising: '広告・掲載',
  parts: 'パーツ・塗装',
  other: 'その他',
}

export const contactLimits = { name: 80, email: 254, message: 3000 }

export function isContactTopic(value) {
  return Object.hasOwn(contactTopics, value)
}
