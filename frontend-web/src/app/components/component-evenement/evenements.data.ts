export interface Evenement {
  slug: string;
  date: string;
  dateLabel: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  time?: string;
  location?: string;
  participants?: string;
  paragraphs: string[];
}

export const evenements: Evenement[] = [
  {
    slug: 'gouter-du-club',
    date: '2026-09-13',
    dateLabel: '13 septembre',
    title: 'Goûter organisé par le club',
    summary: 'Le club vous invite à un goûter convivial pour bien commencer la saison ensemble !',
    image: '/img/gouter.jpg',
    category: 'Vie du club',
    paragraphs: [
      'Le Gières Volley-Ball vous donne rendez-vous pour partager un goûter convivial et lancer la nouvelle saison dans la bonne humeur.',
      'Un moment chaleureux pour se retrouver et commencer l’année sportive ensemble.',
    ],
  },
  {
    slug: 'inscriptions-ouvertes',
    date: '2026-09-08',
    dateLabel: '8 septembre',
    title: 'Les inscriptions sont ouvertes !',
    summary: 'Rejoignez le Gières Volley-Ball pour la nouvelle saison !',
    image: '/img/volley_ball1.jpg',
    category: 'Inscription',
    paragraphs: [
      'Les inscriptions pour la nouvelle saison du Gières Volley-Ball sont ouvertes.',
      'Envie de découvrir le volley ou de rejoindre le club ? Consultez la page d’inscription pour commencer votre démarche.',
    ],
  },
  {
    slug: 'vacances-dete',
    date: '2026-07-10',
    dateLabel: '10 juillet',
    title: 'Le club part en vacances !',
    summary: 'On se retrouve à la rentrée pour une nouvelle saison pleine de projets !',
    image: '/img/vacances.jpg',
    category: 'Vie du club',
    paragraphs: [
      'La saison se termine et le club fait une pause estivale.',
      'Toute l’équipe vous souhaite de belles vacances. Rendez-vous à la rentrée pour une nouvelle saison pleine de projets !',
    ],
  },
];
