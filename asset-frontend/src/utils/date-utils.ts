type DateInput = string | number | Date

/**
 * 计算两个日期之间的天数差
 * @param startDate 开始日期，可以是日期字符串或 Date 对象
 * @param endDate 结束日期，默认为当前日期
 * @returns 天数差（取整）
 */
export const calculateDaysBetween = (startDate: DateInput, endDate: DateInput = new Date()): number => {
  const oneDay = 24 * 60 * 60 * 1000 // 一天的毫秒数
  const start = new Date(startDate)
  const end = endDate instanceof Date ? endDate : new Date(endDate)

  // 计算天数差并取整
  return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay))
}

/**
 * 计算从指定日期到现在的天数
 * @param date 开始日期
 * @returns 从指定日期到现在的天数
 */
export const calculateDaysToNow = (date: DateInput): number => calculateDaysBetween(date, new Date())

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date 需要格式化的日期
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: DateInput): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
