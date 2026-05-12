/**
 * Date Utilities for Dynamic Appointment Booking
 */

const WEEKDAYS_ZH = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Get the next working day (Mon-Fri) from a given date
 * @param date - The starting date
 * @param daysToAdd - Number of days to add (will skip weekends)
 * @returns The next working day Date object
 */
export function getNextWorkingDay(date: Date, daysToAdd: number): Date {
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
 * @param date - The date to format
 * @returns Formatted date string in Chinese
 */
export function formatDateChinese(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS_ZH[date.getDay()];

  return `${year}年${month}月${day}日 (${weekday})`;
}

/**
 * Format date in English: D Month YYYY (Weekday)
 * @param date - The date to format
 * @returns Formatted date string in English
 */
export function formatDateEnglish(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();
  const weekday = WEEKDAYS_EN[date.getDay()];

  return `${day} ${month} ${year} (${weekday})`;
}

/**
 * Generate dynamic appointment dates for the next N working days
 * @param count - Number of working days to generate
 * @param language - 'zh' for Chinese, 'en' for English
 * @param startDate - Optional starting date (defaults to today)
 * @returns Array of formatted date strings
 */
export function generateAppointmentDates(count: number = 5, language: 'zh' | 'en' = 'zh', startDate?: Date): string[] {
  const start = startDate || new Date();
  const dates: string[] = [];
  const formatter = language === 'zh' ? formatDateChinese : formatDateEnglish;

  for (let i = 0; i < count; i++) {
    // Start from tomorrow (i+1) to avoid today
    const workingDay = getNextWorkingDay(start, i + 1);
    dates.push(formatter(workingDay));
  }

  return dates;
}

/**
 * Vanilla JavaScript version for use in pure HTML/JS environments
 * Can be called from a <script> tag
 */
export const dateManager = {
  getNextWorkingDay(date: Date, daysToAdd: number): Date {
    let result = new Date(date);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    }

    return result;
  },

  formatDateChinese(date: Date): string {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];

    return `${year}年${month}月${day}日 (${weekday})`;
  },

  formatDateEnglish(date: Date): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const year = date.getFullYear();
    const month = months[date.getMonth()];
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];

    return `${day} ${month} ${year} (${weekday})`;
  },

  /**
   * Populate all elements with class 'dynamic-appt-date'
   * Reads data-days-ahead attribute and sets the date text
   * @param language - 'zh' or 'en'
   */
  populateDynamicDates(language: 'zh' | 'en' = 'zh'): void {
    const buttons = document.querySelectorAll('.dynamic-appt-date');
    const formatter = language === 'zh' ? this.formatDateChinese : this.formatDateEnglish;

    buttons.forEach((button) => {
      const element = button as HTMLElement;
      const daysAhead = parseInt(element.getAttribute('data-days-ahead') || '0', 10);
      
      if (daysAhead > 0) {
        const futureDate = this.getNextWorkingDay(new Date(), daysAhead);
        element.textContent = formatter(futureDate);
      }
    });
  }
};
