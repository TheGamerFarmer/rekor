export interface Actualite {
  slug: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  paragraphs: string[];
}

export const actualites: Actualite[] = [
  {
    slug: 'nouvelle-regle-de-jeu',
    title: 'Nouvelle règle de jeu',
    summary: 'Une nouvelle règle de jeu entre en vigueur.',
    image: '/images/volley7.jpg',
    category: 'Vie du club',
    paragraphs: [
      'Une nouvelle règle de jeu entre en vigueur afin de rendre les rencontres encore plus claires et agréables pour toutes et tous.',
      'Les joueurs et joueuses sont invités à en prendre connaissance dès maintenant.',
    ],
  },
  {
    slug: 'collecte-solidaire-du-club',
    title: 'Collecte solidaire organisée par le club',
    summary: 'Grande collecte solidaire organisée par le club !',
    image: '/images/collecte.png',
    category: 'Vie du club',
    paragraphs: [
      "Le club organise une grande collecte solidaire afin de soutenir une belle cause et de mobiliser ses membres autour d'un moment de partage et de solidarité. Vous pouvez donner dans la boîte présente aux trois prochains entraînements. Chaque don compte, alors n'hésitez pas à participer !",
    ],
  },
  {
    slug: 'inscriptions-ouvertes',
    title: 'Les inscriptions sont ouvertes !',
    summary: 'Rejoignez le Gières Volley-Ball pour la nouvelle saison !',
    image: '/images/volley_ball1.jpg',
    category: 'Inscription',
    paragraphs: [
      'Les inscriptions pour la nouvelle saison du Gières Volley-Ball sont ouvertes.',
      'Envie de découvrir le volley ou de rejoindre le club ? Consultez la page d’inscription pour commencer votre démarche.',
    ],
  },
  {
    slug: 'vacances-dete',
    title: 'Le club part en vacances !',
    summary: 'On se retrouve à la rentrée pour une nouvelle saison pleine de projets !',
    image: '/images/vacances.jpg',
    category: 'Vie du club',
    paragraphs: [
      'La saison se termine et le club fait une pause estivale à partir du 10 juillet.',
      'Toute l’équipe vous souhaite de belles vacances. Rendez-vous à la rentrée pour une nouvelle saison pleine de projets !',
    ],
  },
];
