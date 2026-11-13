import { Service } from '@angular/core';

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

  getQuestions(title: string): string[] {
    switch (title) {
      case 'Inscription et adhésion':
        return [
          "Comment s'inscrire au club ?",
          'Qui peut rejoindre le club ?',
          "Faut-il déjà savoir jouer au volley-ball pour s'inscrire ?",
          "Quand peut-on s'inscrire ?",
          "Quels documents faut-il fournir pour s'inscrire ?",
          "Peut-on faire un essai avant de s'inscrire ?",
          'Comment renouveler son inscription ?',
        ];
      case 'Tarifs et paiement':
        return [
          "Quel est le prix de l'inscription au club ?",
          'Quels moyens de paiement sont acceptés ?',
          'Est-il possible de payer en plusieurs fois ?',
          "Peut-on bénéficier d'aides financières pour payer son inscription ?",
          "Puis-je être remboursé si j'arrête le volley en cours d'année ?",
          'Dois-je payer une cotisation supplémentaire pour participer aux compétitions ?',
          'Comment obtenir une facture ou un justificatif de paiement ?',
        ];
      case 'Entraînements et matchs':
        return [
          'Où se déroulent les entraînements ?',
          'Quels sont les jours et horaires des entraînements ?',
          'Est-il obligatoire de participer aux matchs ?',
          'Comment savoir si je suis convoqué pour un match ?',
          'Que faire si je ne peux pas assister à un entraînement ou à un match ?',
          'Peut-on assister aux matchs en tant que spectateur ?',
          'Le club organise-t-il des tournois ou des événements sportifs ?',
        ];
      case 'Niveau, âge et matériel':
        return [
          'À partir de quel âge peut-on commencer le volley-ball ?',
          'Faut-il avoir un niveau minimum pour rejoindre le club ?',
          "Peut-on changer de catégorie ou d'équipe en cours de saison ?",
          'Quel équipement faut-il prévoir pour pratiquer le volley-ball ?',
          'Les genouillères sont-elles obligatoires ?',
          'Existe-t-il des équipes adaptées aux personnes qui souhaitent pratiquer sans compétition ?',
          "Peut-on rejoindre le club si l'on n'a jamais pratiqué de sport collectif ?",
        ];
      case 'Santé, sécurité et mineurs':
        return [
          "Un certificat médical est-il obligatoire pour s'inscrire ?",
          'Que se passe-t-il si je me blesse pendant un entraînement ou un match ?',
          "Le club dispose-t-il d'une assurance en cas d'accident ?",
          'Les entraînements sont-ils encadrés par des entraîneurs qualifiés ?',
          'Les parents de mineurs peuvent-ils assister aux entraînements et aux matchs ?',
          'Comment le club assure-t-il la sécurité des joueurs mineurs ?',
          'Comment signaler un problème de comportement ou une situation préoccupante concernant un mineur ?',
        ];
      case 'Vie du club et contact':
        return [
          'Comment contacter le club ?',
          'Comment suivre les actualités du club ?',
          'Comment devenir entraîneur ou encadrant au sein du club ?',
          'Comment signaler un problème ou faire une suggestion ?',
          'Qui contacter en cas de question concernant une équipe en particulier ?',
        ];
      default:
        return [];
    }
  }

  getReponses(title: string): string[] {
    switch (title) {
      case 'Inscription et adhésion':
        return [
          'Pour vous inscrire, il suffit de contacter directement le club. Une fois le dossier complété et les documents nécessaires transmis, votre inscription sera validée après le règlement de la cotisation.',
          'Notre club est ouvert à tous, quel que soit votre âge ou votre niveau. Nous accueillons les enfants, les adolescents et les adultes, que vous souhaitiez pratiquer le volley-ball en loisir ou en compétition.',
          "Non, aucune expérience préalable n'est nécessaire ! Nos entraînements sont adaptés au niveau de chacun. Les débutants sont les bienvenus et pourront apprendre les bases du volley-ball grâce à l'accompagnement de nos entraîneurs.",
          "Les inscriptions sont généralement ouvertes à partir de la fin de la saison précédente et se poursuivent pendant l'été, avant la reprise des entraînements en septembre. Selon les places disponibles, il est également possible de rejoindre le club en cours de saison.",
          "Pour constituer votre dossier d'inscription, vous devrez généralement fournir :\n" +
            "- Le formulaire d'adhésion complété.\n" +
            "- Une photo d'identité.\n" +
            "- Les documents médicaux nécessaires à l'obtention de la licence sportive, selon votre situation.\n" +
            '- Le règlement de la cotisation annuelle.',
          "Oui ! Il est possible de participer à une ou plusieurs séances d'essai avant de prendre votre décision. Cela vous permettra de découvrir l'ambiance du club, de rencontrer les entraîneurs et de vous familiariser avec la pratique du volley-ball.",
          "Le renouvellement s'effectue chaque année en complétant le formulaire de réinscription et en fournissant les éventuels documents à mettre à jour. Vous devrez également régler la cotisation annuelle pour valider votre nouvelle licence.",
        ];

      case 'Tarifs et paiement':
        return [
          "Le tarif de l'inscription dépend de la catégorie d'âge et du type de pratique (loisir ou compétition). Il comprend généralement la licence fédérale, l'assurance et la cotisation annuelle du club.",
          "Le club accepte plusieurs moyens de paiement : carte bancaire, chèque, espèces et virement bancaire. Les modalités précises sont communiquées lors de l'inscription.",
          "Non, le club demande de régler le paiment en entier à l'avance.",
          "Oui, certaines aides peuvent contribuer au financement de votre adhésion, comme le Pass'Sport, les aides des collectivités locales ou les dispositifs proposés par les comités d'entreprise, sous réserve d'éligibilité.",
          "En règle générale, la cotisation annuelle n'est pas remboursable après validation de l'inscription. Toutefois, certaines situations exceptionnelles, notamment médicales, peuvent être étudiées par le bureau du club.",
          'Non, la participation aux compétitions officielles est généralement comprise dans la cotisation pour les joueurs inscrits en catégorie compétition. Certains événements particuliers peuvent toutefois entraîner des frais supplémentaires.',
          'Vous pouvez demander une facture ou une attestation de paiement auprès du trésorier ou du responsable des inscriptions du club.',
        ];
      case 'Entraînements et matchs':
        return [
          "Les entraînements ont lieu dans les gymnases de Gières partenaires du club. L'adresse et les horaires de chaque séance indiqués sur le site.",
          "Les entraînements sont organisés plusieurs fois par semaine en fonction des catégories d'âge et du niveau des joueurs. Le planning complet varie en fonction des semaines et est consultable sur notre site.",
          'Non, cela dépend de la formule choisie. Les joueurs inscrits en loisir peuvent pratiquer sans participer aux compétitions. En revanche, pour les équipes engagées en compétition, une participation régulière aux matchs est attendue.',
          "Les convocations sont communiquées par l'entraîneur ou le responsable de l'équipe avec notre site. Les joueurs sont informés à l'avance de la date, de l'heure et du lieu de rendez-vous. En cas de non-disponibilité, prévenir.",
          "En cas d'absence, il est important de prévenir son entraîneur le plus tôt possible afin qu'il puisse adapter les séances",
          "Bien sûr ! Les matchs sont ouverts aux supporters, aux familles et aux amis. Nous encourageons tout le monde à venir soutenir nos équipes et à partager l'ambiance du club !",
          'Oui, le club peut organiser des tournois amicaux, des rencontres interéquipes et des événements sportifs tout au long de la saison. Ces événements permettent aux joueurs de progresser et de partager des moments conviviaux.',
        ];
      case 'Niveau, âge et matériel':
        return [
          'Il est possible de commencer le volley-ball à partir de 15 ans.',
          "Non, aucun niveau minimum n'est exigé pour s'inscrire. Nous accueillons aussi bien les débutants que les joueurs confirmés. Les groupes sont constitués en fonction du niveau de chacun.",
          "Oui, un changement de groupe peut être envisagé en fonction de la progression du joueur et des places disponibles. Il suffit d'en discuter avec son entraîneur.",
          'Pour participer aux entraînements, il est recommandé de prévoir :\n' +
            '- Un short et un t-shirt de sport.\n' +
            '- Des chaussures de sport adaptées à la pratique en salle.\n' +
            "- Une bouteille d'eau.\n" +
            '- Des genouillères pour protéger les articulations (facultatif, mais conseillé).',
          'Non, les genouillères ne sont pas obligatoires, mais elles sont fortement recommandées. Elles permettent de protéger les genoux lors des plongeons et des déplacements au sol.',
          'Oui, le club propose des séances de volley-ball loisir permettant de pratiquer dans une ambiance conviviale, sans obligation de participer aux compétitions officielles.',
          'Bien sûr ! Le volley-ball est accessible à tous, même sans expérience sportive préalable. Les entraînements permettent de découvrir progressivement les règles, les techniques et le fonctionnement du jeu en équipe.',
        ];
      case 'Santé, sécurité et mineurs':
        return [
          "Pas nécessairement. Selon l'âge du joueur, sa situation et les règles de la Fédération Française de Volley, un certificat médical ou un questionnaire de santé peut être demandé. Les modalités sont précisées lors de l'inscription.",
          "En cas de blessure, l'entraîneur interrompt l'activité si nécessaire et apporte les premiers soins dans la limite de ses compétences. Si la situation l'exige, les services de secours sont contactés et les responsables légaux sont prévenus pour les joueurs mineurs.",
          "Oui, la licence sportive comprend une couverture d'assurance liée à la pratique du volley-ball. Les garanties et les éventuelles exclusions sont précisées dans les documents d'assurance remis lors de l'inscription.",
          'Oui, les séances sont encadrées par des entraîneurs et des encadrants adaptés aux catégories accueillies. Ils veillent au bon déroulement des activités, à la progression des joueurs et au respect des consignes de sécurité.',
          "Les parents sont généralement les bienvenus pour assister aux matchs et encourager les équipes. Pour les entraînements, l'accès peut dépendre des installations et de l'organisation des séances.",
          "Le club veille à proposer un environnement sportif sécurisé grâce à l'encadrement des séances, au respect des règles de vie collective et à la prévention des comportements inappropriés. Les encadrants sont sensibilisés à la protection des jeunes joueurs.",
          'Les joueurs et leurs familles peuvent contacter directement un entraîneur, un dirigeant ou un responsable du club. Toute situation préoccupante est prise au sérieux et doit être traitée avec confidentialité et dans le respect des procédures de protection des mineurs.',
        ];
      case 'Vie du club et contact':
        return [
          'Vous pouvez contacter le club par e-mail ou directement auprès des responsables lors des entraînements. Nous ferons notre possible pour vous répondre dans les meilleurs délais.',
          'Pour ne rien manquer de la vie du club, vous pouvez consulter régulièrement notre site internet et nous suivre sur nos réseaux sociaux. Nous y partageons les résultats des matchs, les événements à venir et les actualités de nos équipes.',
          'Si vous souhaitez transmettre votre passion du volley-ball et encadrer une équipe, vous pouvez contacter les responsables du club. Selon votre expérience, des formations peuvent être proposées pour vous accompagner dans cette démarche.',
          "Nous sommes toujours à l'écoute de nos adhérents et de leurs familles. Vous pouvez transmettre vos remarques ou suggestions via l'adresse mail du club ou directement auprès d'un responsable du club. Toutes les propositions permettant d'améliorer la vie du club sont les bienvenues.",
          'Pour toute question concernant une équipe, ses entraînements ou ses compétitions, vous pouvez contacter directement son entraîneur ou le responsable de la catégorie. Leurs coordonnées peuvent être obtenues auprès du club.',
        ];
      default:
        return [];
    }
  }
}
