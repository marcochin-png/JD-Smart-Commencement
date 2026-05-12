export interface Location {
  id: string;
  name: string;
  address: string;
}

export const TIME_SLOTS_ZH = [
  '上午 9:30 - 10:30',
  '上午 10:30 - 11:30',
  '下午 2:30 - 3:30',
  '下午 3:30 - 4:30',
  '下午 4:30 - 5:30',
];

export const TIME_SLOTS_EN = [
  '9:30 - 10:30 am',
  '10:30 - 11:30 am',
  '2:30 - 3:30 pm',
  '3:30 - 4:30 pm',
  '4:30 - 5:30 pm',
];

export const LOCATIONS_ZH: Location[] = [
  { id: 'labour-tribunal', name: '勞資審裁處', address: '九龍加士居道36號地下' },
];

export const LOCATIONS_EN: Location[] = [
  { id: 'labour-tribunal', name: 'Labour Tribunal', address: '36 Gascoigne Road, G/F, Kowloon' },
];

export function getTimeSlots(language: 'zh' | 'en'): string[] {
  return language === 'zh' ? TIME_SLOTS_ZH : TIME_SLOTS_EN;
}

export function getLocations(language: 'zh' | 'en'): Location[] {
  return language === 'zh' ? LOCATIONS_ZH : LOCATIONS_EN;
}
