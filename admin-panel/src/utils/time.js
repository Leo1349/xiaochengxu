/**
 * 格式化时间
 * @param {string|Date|number} time 时间
 * @param {string} format 格式（预留，目前固定为 YYYY-MM-DD HH:mm:ss）
 * @returns {string}
 */
export const formatTime = (time) => {
    if (!time) return '-'

    // 如果已经是格式化好的字符串（简单的判断），直接返回
    if (typeof time === 'string' && time.length === 19 && time.includes('-') && time.includes(':')) {
        return time
    }

    const date = new Date(time)
    if (isNaN(date.getTime())) return time

    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
