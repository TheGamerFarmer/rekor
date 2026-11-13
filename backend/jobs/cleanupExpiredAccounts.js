const User = require('../db/models/user');
const Registration = require('../db/models/registration');

/**
 * Deletes expired user accounts based on their role:
 * - Visitors inactive for more than 2 months are removed unconditionally.
 * - Other roles (Adhérent, Capitaine, Entraineur) are removed after 14 months
 *   unless they have at least one registration created within that period.
 */
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
    `[Cleanup] ${visiteurResult.deletedCount} visitor(s) deleted, ` +
      `${userResult.deletedCount} expired account(s) deleted.`,
  );
}

module.exports = { cleanupExpiredAccounts };
