export interface DateCampaign {
  key: string;
  title: string;
  message: string;
  priority?: number;
  rule:
    | {
        type: 'MONTHLY_DAY';
        day: number;
      }
    | {
        type: 'YEARLY_DATE';
        month: number;
        day: number;
      };
  buttonText?: string;
}

export const DATE_CAMPAIGNS: DateCampaign[] = [
  {
    key: 'birthday-5-mar',
    title: '🎉 ¡Feliz cumpleaños!',
    message: 'Hoy es tu cumple! Te amo mucho y espero que tengas un día increíble. Bienvenida a tu aplicación de libros personalizada 🎂📚',
    priority: 30,
    rule: {
      type: 'YEARLY_DATE',
      month: 3,
      day: 5
    },
    buttonText: '📚'
  },
  {
    key: 'anniversary-19-10',
    title: '💖 ¡Feliz aniversario!',
    message: 'Hoy celebramos nuestro aniversario. Te amo mucho! 💖',
    priority: 20,
    rule: {
      type: 'YEARLY_DATE',
      month: 10,
      day: 19
    },
    buttonText: 'Qué bonito'
  },
  {
    key: 'relationship-monthly-19',
    title: '💕 ¡Feliz cumple mes!',
    message: 'Hoy 19 celebramos un mes más de nuestra relación. Te amo mucho 💕',
    priority: 10,
    rule: {
      type: 'MONTHLY_DAY',
      day: 19
    },
    buttonText: 'Te amo'
  }
];
