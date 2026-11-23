import { Service } from '@angular/core';
import { QuestionReponse } from '../interfaces/question-reponse-interface';

@Service()
export class MockFaqService {
  getAllTitles(): string[] {
    return [
      'Inscription et adhésion',
      'Tarifs et paiement',
      'Entraînements et matchs',
      'Niveau, âge et matériel',
      'Santé, sécurité et mineurs',
      'Vie du club et contact',
    ];
  }

  getQuestionsReponses(title: string): QuestionReponse[] {
    switch (title) {
      case 'Inscription et adhésion':
        return [
          {
            question: "Comment s'inscrire au club ?",
            reponse:
              'Pour vous inscrire, il suffit de contacter directement le club. Une fois le dossier complété et les documents nécessaires transmis, votre inscription sera validée après le règlement de la cotisation.',
          },
          {
            question: 'Qui peut rejoindre le club ?',
            reponse:
              'Notre club est ouvert à tous, quel que soit votre âge ou votre niveau. Nous accueillons les enfants, les adolescents et les adultes, que vous souhaitiez pratiquer le volley-ball en loisir ou en compétition.',
          },
          {
            question: "Faut-il déjà savoir jouer au volley-ball pour s'inscrire ?",
            reponse:
              "Non, aucune expérience préalable n'est nécessaire ! Nos entraînements sont adaptés au niveau de chacun. Les débutants sont les bienvenus et pourront apprendre les bases du volley-ball grâce à l'accompagnement de nos entraîneurs.",
          },
          {
            question: "Quand peut-on s'inscrire ?",
            reponse:
              "Les inscriptions sont généralement ouvertes à partir de la fin de la saison précédente et se poursuivent pendant l'été, avant la reprise des entraînements en septembre. Selon les places disponibles, il est également possible de rejoindre le club en cours de saison.",
          },
          {
            question: "Quels documents faut-il fournir pour s'inscrire ?",
            reponse:
              "Pour constituer votre dossier d'inscription, vous devrez généralement fournir :\n- Le formulaire d'adhésion complété.\n- Une photo d'identité.\n- Les documents médicaux nécessaires à l'obtention de la licence sportive, selon votre situation.\n- Le règlement de la cotisation annuelle.",
          },
          {
            question: "Peut-on faire un essai avant de s'inscrire ?",
            reponse:
              "Oui ! Il est possible de participer à une ou plusieurs séances d'essai avant de prendre votre décision. Cela vous permettra de découvrir l'ambiance du club, de rencontrer les entraîneurs et de vous familiariser avec la pratique du volley-ball.",
          },
          {
            question: 'Comment renouveler son inscription ?',
            reponse:
              "Le renouvellement s'effectue chaque année en complétant le formulaire de réinscription et en fournissant les éventuels documents à mettre à jour. Vous devrez également régler la cotisation annuelle pour valider votre nouvelle licence.",
          },
        ];

      case 'Tarifs et paiement':
        return [
          {
            question: "Quel est le prix de l'inscription au club ?",
            reponse:
              "Le tarif de l'inscription dépend de la catégorie d'âge et du type de pratique (loisir ou compétition). Il comprend généralement la licence fédérale, l'assurance et la cotisation annuelle du club.",
          },
          {
            question: 'Quels moyens de paiement sont acceptés ?',
            reponse:
              "Le club accepte plusieurs moyens de paiement : carte bancaire, chèque, espèces et virement bancaire. Les modalités précises sont communiquées lors de l'inscription.",
          },
          {
            question: 'Est-il possible de payer en plusieurs fois ?',
            reponse: "Non, le club demande de régler le paiement en entier à l'avance.",
          },
          {
            question: "Peut-on bénéficier d'aides financières pour payer son inscription ?",
            reponse:
              "Oui, certaines aides peuvent contribuer au financement de votre adhésion, comme le Pass'Sport, les aides des collectivités locales ou les dispositifs proposés par les comités d'entreprise, sous réserve d'éligibilité.",
          },
          {
            question: "Puis-je être remboursé si j'arrête le volley en cours d'année ?",
            reponse:
              "En règle générale, la cotisation annuelle n'est pas remboursable après validation de l'inscription. Toutefois, certaines situations exceptionnelles, notamment médicales, peuvent être étudiées par le bureau du club.",
          },
          {
            question:
              'Dois-je payer une cotisation supplémentaire pour participer aux compétitions ?',
            reponse:
              'Non, la participation aux compétitions officielles est généralement comprise dans la cotisation pour les joueurs inscrits en catégorie compétition. Certains événements particuliers peuvent toutefois entraîner des frais supplémentaires.',
          },
          {
            question: 'Comment obtenir une facture ou un justificatif de paiement ?',
            reponse:
              'Vous pouvez demander une facture ou une attestation de paiement auprès du trésorier ou du responsable des inscriptions du club.',
          },
        ];

      case 'Entraînements et matchs':
        return [
          {
            question: 'Où se déroulent les entraînements ?',
            reponse:
              "Les entraînements ont lieu dans les gymnases de Gières partenaires du club. L'adresse et les horaires de chaque séance sont indiqués sur le site.",
          },
          {
            question: 'Quels sont les jours et horaires des entraînements ?',
            reponse:
              "Les entraînements sont organisés plusieurs fois par semaine en fonction des catégories d'âge et du niveau des joueurs. Le planning complet varie en fonction des semaines et est consultable sur notre site.",
          },
          {
            question: 'Est-il obligatoire de participer aux matchs ?',
            reponse:
              'Non, cela dépend de la formule choisie. Les joueurs inscrits en loisir peuvent pratiquer sans participer aux compétitions. En revanche, pour les équipes engagées en compétition, une participation régulière aux matchs est attendue.',
          },
          {
            question: 'Comment savoir si je suis convoqué pour un match ?',
            reponse:
              "Les convocations sont communiquées par l'entraîneur ou le responsable de l'équipe sur notre site. Les joueurs sont informés à l'avance de la date, de l'heure et du lieu de rendez-vous. En cas de non-disponibilité, il est important de prévenir l'entraîneur.",
          },
          {
            question: 'Que faire si je ne peux pas assister à un entraînement ou à un match ?',
            reponse:
              "En cas d'absence, il est important de prévenir son entraîneur le plus tôt possible afin qu'il puisse adapter les séances ou organiser le remplacement du joueur.",
          },
          {
            question: 'Peut-on assister aux matchs en tant que spectateur ?',
            reponse:
              "Bien sûr ! Les matchs sont ouverts aux supporters, aux familles et aux amis. Nous encourageons tout le monde à venir soutenir nos équipes et à partager l'ambiance du club !",
          },
          {
            question: 'Le club organise-t-il des tournois ou des événements sportifs ?',
            reponse:
              'Oui, le club peut organiser des tournois amicaux, des rencontres interéquipes et des événements sportifs tout au long de la saison. Ces événements permettent aux joueurs de progresser et de partager des moments conviviaux.',
          },
        ];

      case 'Niveau, âge et matériel':
        return [
          {
            question: 'À partir de quel âge peut-on commencer le volley-ball ?',
            reponse: 'Il est possible de commencer le volley-ball à partir de 15 ans.',
          },
          {
            question: 'Faut-il avoir un niveau minimum pour rejoindre le club ?',
            reponse:
              "Non, aucun niveau minimum n'est exigé pour s'inscrire. Nous accueillons aussi bien les débutants que les joueurs confirmés. Les groupes sont constitués en fonction du niveau de chacun.",
          },
          {
            question: "Peut-on changer de catégorie ou d'équipe en cours de saison ?",
            reponse:
              "Oui, un changement de groupe peut être envisagé en fonction de la progression du joueur et des places disponibles. Il suffit d'en discuter avec son entraîneur.",
          },
          {
            question: 'Quel équipement faut-il prévoir pour pratiquer le volley-ball ?',
            reponse:
              "Pour participer aux entraînements, il est recommandé de prévoir :\n- Un short et un t-shirt de sport.\n- Des chaussures de sport adaptées à la pratique en salle.\n- Une bouteille d'eau.\n- Des genouillères pour protéger les articulations (facultatif, mais conseillé).",
          },
          {
            question: 'Les genouillères sont-elles obligatoires ?',
            reponse:
              'Non, les genouillères ne sont pas obligatoires, mais elles sont fortement recommandées. Elles permettent de protéger les genoux lors des plongeons et des déplacements au sol.',
          },
          {
            question:
              'Existe-t-il des équipes adaptées aux personnes qui souhaitent pratiquer sans compétition ?',
            reponse:
              'Oui, le club propose des séances de volley-ball loisir permettant de pratiquer dans une ambiance conviviale, sans obligation de participer aux compétitions officielles.',
          },
          {
            question: "Peut-on rejoindre le club si l'on n'a jamais pratiqué de sport collectif ?",
            reponse:
              'Bien sûr ! Le volley-ball est accessible à tous, même sans expérience sportive préalable. Les entraînements permettent de découvrir progressivement les règles, les techniques et le fonctionnement du jeu en équipe.',
          },
        ];

      case 'Santé, sécurité et mineurs':
        return [
          {
            question: "Un certificat médical est-il obligatoire pour s'inscrire ?",
            reponse:
              "Pas nécessairement. Selon l'âge du joueur, sa situation et les règles de la Fédération Française de Volley, un certificat médical ou un questionnaire de santé peut être demandé. Les modalités sont précisées lors de l'inscription.",
          },
          {
            question: 'Que se passe-t-il si je me blesse pendant un entraînement ou un match ?',
            reponse:
              "En cas de blessure, l'entraîneur interrompt l'activité si nécessaire et apporte les premiers soins dans la limite de ses compétences. Si la situation l'exige, les services de secours sont contactés et les responsables légaux sont prévenus pour les joueurs mineurs.",
          },
          {
            question: "Le club dispose-t-il d'une assurance en cas d'accident ?",
            reponse:
              "Oui, la licence sportive comprend une couverture d'assurance liée à la pratique du volley-ball. Les garanties et les éventuelles exclusions sont précisées dans les documents d'assurance remis lors de l'inscription.",
          },
          {
            question: 'Les entraînements sont-ils encadrés par des entraîneurs qualifiés ?',
            reponse:
              'Oui, les séances sont encadrées par des entraîneurs et des encadrants adaptés aux catégories accueillies. Ils veillent au bon déroulement des activités, à la progression des joueurs et au respect des consignes de sécurité.',
          },
          {
            question:
              'Les parents de mineurs peuvent-ils assister aux entraînements et aux matchs ?',
            reponse:
              "Les parents sont généralement les bienvenus pour assister aux matchs et encourager les équipes. Pour les entraînements, l'accès peut dépendre des installations et de l'organisation des séances.",
          },
          {
            question: 'Comment le club assure-t-il la sécurité des joueurs mineurs ?',
            reponse:
              "Le club veille à proposer un environnement sportif sécurisé grâce à l'encadrement des séances, au respect des règles de vie collective et à la prévention des comportements inappropriés. Les encadrants sont sensibilisés à la protection des jeunes joueurs.",
          },
          {
            question:
              'Comment signaler un problème de comportement ou une situation préoccupante concernant un mineur ?',
            reponse:
              'Les joueurs et leurs familles peuvent contacter directement un entraîneur, un dirigeant ou un responsable du club. Toute situation préoccupante est prise au sérieux et doit être traitée avec confidentialité et dans le respect des procédures de protection des mineurs.',
          },
        ];

      case 'Vie du club et contact':
        return [
          {
            question: 'Comment contacter le club ?',
            reponse:
              'Vous pouvez contacter le club par e-mail ou directement auprès des responsables lors des entraînements. Nous ferons notre possible pour vous répondre dans les meilleurs délais.',
          },
          {
            question: 'Comment suivre les actualités du club ?',
            reponse:
              'Pour ne rien manquer de la vie du club, vous pouvez consulter régulièrement notre site internet et nous suivre sur nos réseaux sociaux. Nous y partageons les résultats des matchs, les événements à venir et les actualités de nos équipes.',
          },
          {
            question: 'Comment devenir entraîneur ou encadrant au sein du club ?',
            reponse:
              'Si vous souhaitez transmettre votre passion du volley-ball et encadrer une équipe, vous pouvez contacter les responsables du club. Selon votre expérience, des formations peuvent être proposées pour vous accompagner dans cette démarche.',
          },
          {
            question: 'Comment signaler un problème ou faire une suggestion ?',
            reponse:
              "Nous sommes toujours à l'écoute de nos adhérents et de leurs familles. Vous pouvez transmettre vos remarques ou suggestions via l'adresse mail du club ou directement auprès d'un responsable du club. Toutes les propositions permettant d'améliorer la vie du club sont les bienvenues.",
          },
          {
            question: 'Qui contacter en cas de question concernant une équipe en particulier ?',
            reponse:
              'Pour toute question concernant une équipe, ses entraînements ou ses compétitions, vous pouvez contacter directement son entraîneur ou le responsable de la catégorie. Leurs coordonnées peuvent être obtenues auprès du club.',
          },
        ];

      default:
        return [];
    }
  }
}
