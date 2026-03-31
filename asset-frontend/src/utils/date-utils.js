// src/utils/date-utils.js

/**
 * 计算两个日期之间的天数差
 * @param {string|Date} startDate - 开始日期，可以是日期字符串或Date对象
 * @param {string|Date} [endDate] - 结束日期，默认为当前日期
 * @returns {number} 天数差（取整）
 */
export const calculateDaysBetween = (startDate, endDate = new Date()) => {
  const oneDay = 24 * 60 * 60 * 1000 // 一天的毫秒数
  const start = new Date(startDate)
  const end = endDate instanceof Date ? endDate : new Date(endDate)
  
  // 计算天数差并取整
  return Math.round(Math.abs((end - start) / oneDay))
}

/**
 * 计算从指定日期到现在的天数
 * @param {string|Date} date - 开始日期
 * @returns {number} 从指定日期到现在的天数
 */
export const calculateDaysToNow = (date) => {
  return calculateDaysBetween(date, new Date())
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {string|Date} date - 需要格式化的日期
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}