export interface Actualite {
  id: number;
  slug: string;
  titre: string;
  summary: string;
  image: string;
  date: string;
  association: string;
  corps: string[];
}

export const actualites: Actualite[] = [
  {
    id: 1,
    slug: 'nouvelle-regle-de-jeu',
    titre: 'Nouvelle règle de jeu',
    summary: 'Une nouvelle règle de jeu entre en vigueur.',
    image: '/images/volley7.jpg',
    date: '2026-09-01',
    association: 'Gières Volley-Ball',
    corps: [
      'Une nouvelle règle de jeu entre en vigueur afin de rendre les rencontres encore plus claires et agréables pour toutes et tous.',
      'Les joueurs et joueuses sont invités à en prendre connaissance dès maintenant.',
    ],
  },
  {
    id: 2,
    slug: 'collecte-solidaire-du-club',
    titre: 'Collecte solidaire organisée par le club',
    summary: 'Grande collecte solidaire organisée par le club !',
    image: '/images/collecte.png',
    date: '2026-09-15',
    association: 'Gières Volley-Ball',
    corps: [
      "Le club organise une grande collecte solidaire afin de soutenir une belle cause et de mobiliser ses membres autour d'un moment de partage et de solidarité. Vous pouvez donner dans la boîte présente aux trois prochains entraînements. Chaque don compte, alors n'hésitez pas à participer !",
    ],
  },
  {
    id: 3,
    slug: 'inscriptions-ouvertes',
    titre: 'Les inscriptions sont ouvertes !',
    summary: 'Rejoignez le Gières Volley-Ball pour la nouvelle saison !',
    image: '/images/volley_ball1.jpg',
    date: '2026-08-25',
    association: 'Gières Volley-Ball',
    corps: [
      'Les inscriptions pour la nouvelle saison du Gières Volley-Ball sont ouvertes.',
      'Envie de découvrir le volley ou de rejoindre le club ? Consultez la page d’inscription pour commencer votre démarche.',
    ],
  },
  {
    id: 4,
    slug: 'vacances-dete',
    titre: 'Le club part en vacances !',
    summary: 'On se retrouve à la rentrée pour une nouvelle saison pleine de projets !',
    image: '/images/vacances.jpg',
    date: '2026-07-10',
    association: 'Gières Volley-Ball',
    corps: [
      'La saison se termine et le club fait une pause estivale à partir du 10 juillet.',
      'Toute l’équipe vous souhaite de belles vacances. Rendez-vous à la rentrée pour une nouvelle saison pleine de projets !',
    ],
  },
];
