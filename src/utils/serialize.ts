export function serializeChatRequestMessage(message: any) {
    return {
        role: message.role,
        content: message.content,
    }
}