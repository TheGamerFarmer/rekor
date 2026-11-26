import { ASSOCIATION_NAME } from '../../constants';

export interface Actualite {
  id: number;
  titre: string;
  summary: string;
  image: string;
  date: string;
  association: string;
  corps: string;
}

export const actualites: Actualite[] = [
  {
    id: 1,
    titre: 'Nouvelle règle de jeu',
    summary: 'Une nouvelle règle de jeu entre en vigueur.',
    image: '/images/volley7.jpg',
    date: '2026-09-01',
    association: ASSOCIATION_NAME,
    corps:
      '<p>Une nouvelle règle de jeu entre en vigueur afin de rendre les rencontres encore plus claires et agréables pour toutes et tous.</p><p>Les joueurs et joueuses sont invités à en prendre connaissance dès maintenant.</p>',
  },
  {
    id: 2,
    titre: 'Collecte solidaire organisée par le club',
    summary: 'Grande collecte solidaire organisée par le club !',
    image: '/images/collecte.png',
    date: '2026-09-15',
    association: ASSOCIATION_NAME,
    corps:
      "<p>Le club organise une grande <strong>collecte solidaire</strong> afin de soutenir une belle cause et de mobiliser ses membres autour d'un moment de partage et de solidarité. Vous pouvez donner dans la boîte présente aux trois prochains entraînements. Chaque don compte, alors n'hésitez pas à participer !</p>",
  },
  {
    id: 3,
    titre: 'Les inscriptions sont ouvertes !',
    summary: 'Rejoignez le Gières Volley-Ball pour la nouvelle saison !',
    image: '/images/volley_ball1.jpg',
    date: '2026-08-25',
    association: ASSOCIATION_NAME,
    corps:
      '<p>Les inscriptions pour la nouvelle saison du Gières Volley-Ball sont ouvertes.</p><p>Envie de découvrir le volley ou de rejoindre le club ? Consultez la page d’inscription pour commencer votre démarche.</p>',
  },
  {
    id: 4,
    titre: 'Le club part en vacances !',
    summary: 'On se retrouve à la rentrée pour une nouvelle saison pleine de projets !',
    image: '/images/vacances.jpg',
    date: '2026-07-10',
    association: ASSOCIATION_NAME,
    corps:
      '<p>La saison se termine et le club fait une pause estivale à partir du 10 juillet.</p><p>Toute l’équipe vous souhaite de belles vacances. Rendez-vous à la rentrée pour une nouvelle saison pleine de projets !</p>',
  },
];
