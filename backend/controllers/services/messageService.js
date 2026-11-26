const User = require('../../db/models/user');
const Message = require('../../db/models/message');
const { USER_ROLE } = require('../../db/enums');

/**
 * Retrieves all messages belonging to a group.
 * @param {string} groupId - The group ObjectId.
 * @returns {Promise<Array<Document>>} List of Mongoose message documents.
 */
async function getAllMessagesOfGroup(groupId) {
  return await Message.find({ group: { $eq: groupId } });
}

/**
 * Retrieves a message by its identifier within a group.
 * @param {string} groupId - The group ObjectId.
 * @param {string} id - The message ObjectId.
 * @returns {Promise<Document|null>} The Mongoose message document, or null if not found.
 */
async function getMessageById(groupId, id) {
  return await Message.findOne({ _id: { $eq: id }, group: { $eq: groupId } });
}

/**
 * Creates a new message in a group.
 * The `created_by` field is set automatically by the audit plugin.
 * @param {string} groupId - Group ObjectId.
 * @param {string} body - Message body text.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: DUPLICATE.
 */
async function createMessage(groupId, body) {
  try {
    await Message.create({ group: groupId, body });
  } catch (error) {
    if (error.code === 11000) return { error: 'DUPLICATE' };
    throw error;
  }

  return { success: true };
}

/**
 * Checks whether a user is the author of a message.
 * @param {string} groupId - Group ObjectId.
 * @param {string} id - Message ObjectId.
 * @param {string} userId - ObjectId of the user to check.
 * @returns {Promise<{isOwner: boolean}|{error: string}>}
 *   Possible error: MESSAGE_NOT_FOUND.
 */
async function isOwner(groupId, id, userId) {
  const message = await getMessageById(groupId, id);
  if (!message) return { error: 'MESSAGE_NOT_FOUND' };

  return { isOwner: message.created_by.toString() === userId.toString() };
}

/**
 * Updates the body of an existing message.
 * Only the author can update it.
 * @param {string} groupId - Group ObjectId.
 * @param {string} id - Message ObjectId.
 * @param {string} userId - ObjectId of the requesting user.
 * @param {string} body - New message body text.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: MESSAGE_NOT_FOUND, USER_NOT_OWNER.
 */
async function updateMessage(groupId, id, userId, body) {
  const isOwnerResult = await isOwner(groupId, id, userId);
  if (isOwnerResult.error) return { error: isOwnerResult.error };

  if (!isOwnerResult.isOwner) return { error: 'USER_NOT_OWNER' };

  await Message.updateOne({ _id: { $eq: id }, group: { $eq: groupId } }, { body: body });

  return { success: true };
}

/**
 * Deletes a message. Only the author or an administrator can delete it.
 * @param {string} groupId - Group ObjectId.
 * @param {string} id - Message ObjectId.
 * @param {string} senderId - ObjectId of the requesting user.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: MESSAGE_NOT_FOUND, USER_NOT_OWNER.
 */
async function deleteMessage(groupId, id, senderId) {
  const isOwnerResult = await isOwner(groupId, id, senderId);
  if (isOwnerResult.error) return { error: isOwnerResult.error };

  const user = await User.findOne({ _id: { $eq: senderId } });

  if (!isOwnerResult.isOwner && user.role.toString() !== USER_ROLE.ADMINISTRATEUR.toString())
    return { error: 'USER_NOT_OWNER' };

  await Message.deleteOne({ _id: id });

  return { success: true };
}

module.exports = {
  getAllMessagesOfGroup,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
};
