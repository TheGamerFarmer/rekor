const User = require('../db/models/user');
const Registration = require('../db/models/registration');

async function cleanupExpiredAccounts() {
  const now = new Date();

  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  const visiteurResult = await User.deleteMany({
    role: 'Visiteur',
    created_at: { $lt: twoMonthsAgo },
  });

  const fourteenMonthsAgo = new Date(now);
  fourteenMonthsAgo.setMonth(fourteenMonthsAgo.getMonth() - 14);

  const activeUserIds = await Registration.distinct('created_by', {
    created_at: { $gte: fourteenMonthsAgo },
  });

  const userResult = await User.deleteMany({
    role: { $ne: 'Visiteur' },
    created_at: { $lt: fourteenMonthsAgo },
    _id: { $nin: activeUserIds },
  });

  console.log(
    `[Cleanup] ${visiteurResult.deletedCount} visiteur(s) supprimé(s), ` +
      `${userResult.deletedCount} utilisateur(s) expiré(s) supprimé(s).`,
  );
}

module.exports = { cleanupExpiredAccounts };
