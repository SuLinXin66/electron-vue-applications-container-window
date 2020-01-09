type MessageType = 'loadScroll' | 'settingBgc'

export interface PostMessageData {
  type: MessageType | Array<MessageType>,
  contentHeight?: number,
  bgcColor?: string
}
