const User = require('../../db/models/user');
const Group = require('../../db/models/group');
const GroupMember = require('../../db/models/group_member');
const { USER_ROLE } = require('../../db/enums');

/**
 * Retrieves all groups.
 * @returns {Promise<Array<Document>>} List of Mongoose group documents.
 */
async function getAllGroups() {
  return await Group.find();
}

/**
 * Retrieves a group by its identifier.
 * @param {string} id - The group ObjectId.
 * @returns {Promise<Document|null>} The Mongoose group document, or null if not found.
 */
async function getGroupById(id) {
  return await Group.findOne({ _id: { $eq: id } });
}

/**
 * Creates a new group with an owner and optional members.
 * Checks that the owner and all members exist before creation.
 * @param {Object} params
 * @param {string} params.name - Group name.
 * @param {string} params.owner - Owner ObjectId.
 * @param {string[]} [params.members] - ObjectIds of members to add.
 * @returns {Promise<{success: boolean, group: Document}|{error: string}>}
 *   Possible errors: USER_NOT_FOUND, MEMBER_NOT_FOUND, DUPLICATE.
 */
async function createGroup({ name, owner, members }) {
  const userResult = await User.findOne({ _id: { $eq: owner } });
  if (!userResult) return { error: 'USER_NOT_FOUND' };

  if (members && members.length > 0) {
    const foundUsers = await User.find({ _id: { $in: members } });
    if (foundUsers.length !== members.length) {
      return { error: 'MEMBER_NOT_FOUND' };
    }
  }

  let group;
  try {
    group = await Group.create({ name, owner });
  } catch (error) {
    if (error.code === 11000) return { error: 'DUPLICATE' };
    throw error;
  }

  if (members && members.length > 0) {
    const memberDocs = members.map((userId) => ({ group: group._id, user: userId }));
    await GroupMember.insertMany(memberDocs);
  }

  return { success: true, group: group };
}

/**
 * Checks whether a user is the owner of a group.
 * @param {string} id - Group ObjectId.
 * @param {string} userId - ObjectId of the user to check.
 * @returns {Promise<{isOwner: boolean}|{error: string}>}
 *   Possible error: GROUP_NOT_FOUND.
 */
async function isOwner(id, userId) {
  const group = await getGroupById(id);
  if (!group) return { error: 'GROUP_NOT_FOUND' };

  return { isOwner: group.owner.toString() === userId.toString() };
}

/**
 * Partially updates a group. Only provided fields are applied.
 * Only the owner can update the group.
 * @param {string} id - Group ObjectId.
 * @param {string} userId - ObjectId of the requesting user.
 * @param {Object} params
 * @param {string} [params.name] - New group name.
 * @param {string} [params.owner] - ObjectId of the new owner.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: GROUP_NOT_FOUND, USER_NOT_OWNER, USER_NOT_FOUND.
 */
async function updateGroup(id, userId, { name, owner }) {
  const isOwnerResult = await isOwner(id, userId);
  if (isOwnerResult.error) return { error: isOwnerResult.error };

  if (!isOwnerResult.isOwner) return { error: 'USER_NOT_OWNER' };

  const changes = {};
  if (name) changes.name = name;
  if (owner) changes.owner = owner;

  if (changes.owner) {
    const userResult = await User.findOne({ _id: { $eq: changes.owner } });
    if (!userResult) return { error: 'USER_NOT_FOUND' };
  }

  await Group.updateOne({ _id: id }, { $set: changes });

  return { success: true };
}

/**
 * Deletes a group and all its associated members.
 * Only the owner can delete the group.
 * @param {string} id - Group ObjectId.
 * @param {string} senderId - ObjectId of the requesting user.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: GROUP_NOT_FOUND, USER_NOT_OWNER.
 */
async function deleteGroup(id, senderId) {
  const isOwnerResult = await isOwner(id, senderId);
  if (isOwnerResult.error) return { error: isOwnerResult.error };

  if (!isOwnerResult.isOwner) return { error: 'USER_NOT_OWNER' };

  await GroupMember.deleteMany({ group: id });

  await Group.deleteOne({ _id: id });

  return { success: true };
}

/**
 * Retrieves the list of members of a group.
 * @param {string} id - Group ObjectId.
 * @returns {Promise<{data: Array<Document>}|{error: string}>}
 *   Possible error: GROUP_NOT_FOUND.
 */
async function getGroupMembers(id) {
  const doc = await Group.findOne({ _id: { $eq: id } });
  if (!doc) return { error: 'GROUP_NOT_FOUND' };

  const memberships = await GroupMember.find({ group: doc._id });
  const usersId = memberships.map((member) => member.user);
  const users = await User.find({ _id: { $in: usersId } });

  return { data: users };
}

/**
 * Adds a user to a group. Only the owner can add members.
 * @param {string} groupId - Group ObjectId.
 * @param {string} userId - ObjectId of the user to add.
 * @param {string} senderId - ObjectId of the requesting user.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: GROUP_NOT_FOUND, USER_NOT_FOUND, USER_NOT_OWNER, DUPLICATE.
 */
async function addMemberToGroup(groupId, userId, senderId) {
  const groupResult = await Group.findOne({ _id: { $eq: groupId } });
  const userResult = await User.findOne({ _id: { $eq: userId } });

  if (!groupResult) return { error: 'GROUP_NOT_FOUND' };
  if (!userResult) return { error: 'USER_NOT_FOUND' };

  if (groupResult.owner.toString() !== senderId.toString()) return { error: 'USER_NOT_OWNER' };

  try {
    await GroupMember.create({ group: groupId, user: userId });
  } catch (error) {
    if (error.code === 11000) return { error: 'DUPLICATE' };
    throw error;
  }

  return { success: true };
}

/**
 * Removes a user from a group.
 * The owner can remove anyone; a member can remove themselves.
 * If the removed member was the owner, ownership is transferred to the
 * remaining member with the highest role.
 * @param {string} groupId - Group ObjectId.
 * @param {string} userId - ObjectId of the user to remove.
 * @param {string} senderId - ObjectId of the requesting user.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: GROUP_NOT_FOUND, USER_NOT_FOUND, USER_NOT_OWNER, MEMBERSHIP_NOT_FOUND.
 */
async function removeMemberFromGroup(groupId, userId, senderId) {
  const groupResult = await Group.findOne({ _id: { $eq: groupId } });
  const userResult = await User.findOne({ _id: { $eq: userId } });

  if (!groupResult) return { error: 'GROUP_NOT_FOUND' };
  if (!userResult) return { error: 'USER_NOT_FOUND' };

  if (
    groupResult.owner.toString() !== senderId.toString() &&
    userId.toString() !== senderId.toString()
  )
    return { error: 'USER_NOT_OWNER' };

  const result = await GroupMember.deleteOne({ group: groupId, user: userId });
  if (result.deletedCount === 0) return { error: 'MEMBERSHIP_NOT_FOUND' };

  if (groupResult.owner.toString() === userId.toString()) await changeOwnerFromGroup(groupId);

  return { success: true };
}

/**
 * Transfers group ownership to the remaining member with the highest role.
 * If no members remain, the group is deleted.
 * @param {string} groupId - Group ObjectId.
 * @returns {Promise<void>}
 */
async function changeOwnerFromGroup(groupId) {
  const members = await GroupMember.find({ group: groupId }).populate('user', 'role');

  let replacer;
  let replacerRole = USER_ROLE.VISITEUR;

  for (const member of members) {
    if (USER_ROLE.compareTo(member.user.role, replacerRole) > 0) {
      replacer = member;
      replacerRole = member.user.role;
    }
  }

  if (replacer) await Group.updateOne({ _id: groupId }, { owner: replacer.user._id });
  else await Group.deleteOne({ _id: groupId });
}

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  addMemberToGroup,
  removeMemberFromGroup,
  changeOwnerFromGroup,
};
