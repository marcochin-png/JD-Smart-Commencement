/**
 * Vanilla JavaScript Date Manager for Dynamic Appointment Booking
 * Use this in pure HTML/JS environments
 */

(function(window) {
  'use strict';

  const WEEKDAYS_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];

  /**
   * Get the next working day (Mon-Fri) from a given date
   * @param {Date} date - The starting date
   * @param {number} daysToAdd - Number of days to add (will skip weekends)
   * @returns {Date} The next working day Date object
   */
  function getNextWorkingDay(date, daysToAdd) {
    let result = new Date(date);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    }

    return result;
  }

  /**
   * Format date in Traditional Chinese: YYYY年M月D日 (星期X)
   * @param {Date} date - The date to format
   * @returns {string} Formatted date string in Chinese
   */
  function formatDateChinese(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = WEEKDAYS_ZH[date.getDay()];

    return year + '年' + month + '月' + day + '日 (' + weekday + ')';
  }

  /**
   * Format date in English: D Month YYYY (Weekday)
   * @param {Date} date - The date to format
   * @returns {string} Formatted date string in English
   */
  function formatDateEnglish(date) {
    const year = date.getFullYear();
    const month = MONTHS_EN[date.getMonth()];
    const day = date.getDate();
    const weekday = WEEKDAYS_EN[date.getDay()];

    return day + ' ' + month + ' ' + year + ' (' + weekday + ')';
  }

  /**
   * Populate all elements with class 'dynamic-appt-date'
   * Reads data-days-ahead attribute and sets the date text
   * @param {string} language - 'zh' or 'en'
   */
  function populateDynamicDates(language) {
    language = language || 'zh';
    const buttons = document.querySelectorAll('.dynamic-appt-date');
    const formatter = language === 'zh' ? formatDateChinese : formatDateEnglish;

    buttons.forEach(function(button) {
      const daysAhead = parseInt(button.getAttribute('data-days-ahead') || '0', 10);
      
      if (daysAhead > 0) {
        const futureDate = getNextWorkingDay(new Date(), daysAhead);
        button.textContent = formatter(futureDate);
      }
    });
  }

  /**
   * Generate an array of dynamic appointment dates
   * @param {number} count - Number of working days to generate
   * @param {string} language - 'zh' or 'en'
   * @param {Date} startDate - Optional starting date (defaults to today)
   * @returns {Array<string>} Array of formatted date strings
   */
  function generateAppointmentDates(count, language, startDate) {
    count = count || 5;
    language = language || 'zh';
    const start = startDate || new Date();
    const dates = [];
    const formatter = language === 'zh' ? formatDateChinese : formatDateEnglish;

    for (let i = 0; i < count; i++) {
      // Start from tomorrow (i+1) to avoid today
      const workingDay = getNextWorkingDay(start, i + 1);
      dates.push(formatter(workingDay));
    }

    return dates;
  }

  // Export to window object for global access
  window.DateManager = {
    getNextWorkingDay: getNextWorkingDay,
    formatDateChinese: formatDateChinese,
    formatDateEnglish: formatDateEnglish,
    populateDynamicDates: populateDynamicDates,
    generateAppointmentDates: generateAppointmentDates
  };

  // Auto-populate on DOM ready if elements exist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Check if there are dynamic-appt-date elements
      if (document.querySelectorAll('.dynamic-appt-date').length > 0) {
        // Determine language from html lang attribute or default to zh
        const htmlLang = document.documentElement.lang || 'zh';
        const language = htmlLang.toLowerCase().startsWith('en') ? 'en' : 'zh';
        populateDynamicDates(language);
      }
    });
  } else {
    // DOM is already ready
    if (document.querySelectorAll('.dynamic-appt-date').length > 0) {
      const htmlLang = document.documentElement.lang || 'zh';
      const language = htmlLang.toLowerCase().startsWith('en') ? 'en' : 'zh';
      populateDynamicDates(language);
    }
  }

})(window);
