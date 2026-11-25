const Event = require('../../db/models/event');
const User = require('../../db/models/user');
const Group = require('../../db/models/group');
const GroupMembre = require('../../db/models/group_member');
const Participant = require('../../db/models/participant');
const groupService = require('./groupService');
const { USER_ROLE, EVENT_TYPE } = require('../../db/enums');

/**
 * Retrieves all events.
 * @returns {Promise<Array<Document>>} List of Mongoose event documents.
 */
async function getAllEvents() {
  return await Event.find();
}

/**
 * Retrieves an event by its identifier.
 * @param {string} id - The event ObjectId.
 * @returns {Promise<Document|null>} The Mongoose event document, or null if not found.
 */
async function getEventById(id) {
  return await Event.findOne({ _id: { $eq: id } });
}

/**
 * Creates an event and automatically creates its associated group.
 * The creator becomes the owner and first member of the group.
 * @param {Object} params
 * @param {string} params.date - Event date.
 * @param {string} params.place - Event location.
 * @param {string} params.type - Event type (see EVENT_TYPE).
 * @param {string} params.name - Event name.
 * @param {string} [params.description] - Event description.
 * @param {string} userId - ObjectId of the user creating the event.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: DUPLICATE, or group creation failure.
 */
async function createEvent({ date, place, type, name, description }, userId) {
  const result = await groupService.createGroup({ name: name, owner: userId, members: [userId] });

  if (!result?.success) return { error: `Failed to create group: ${result?.error}` };

  try {
    await Event.create({ date, place, type, name, description, group: result.group._id });
  } catch (error) {
    if (error.code === 11000) {
      await groupService.deleteGroup(result.group._id, userId);
      return { error: 'DUPLICATE' };
    }
    throw error;
  }

  return { success: true };
}

/**
 * Partially updates an event. Only provided fields are applied.
 * Checks that the associated group exists.
 * @param {string} id - Event ObjectId.
 * @param {Object} params
 * @param {string} [params.date] - New date.
 * @param {string} [params.place] - New location.
 * @param {string} [params.type] - New type.
 * @param {string} [params.name] - New name.
 * @param {string} [params.description] - New description.
 * @param {string} params.group - ObjectId of the associated group.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: GROUP_NOT_FOUND, EVENT_NOT_FOUND.
 */
async function updateEvent(id, { date, place, type, name, description, group }) {
  const changes = {};
  if (date) changes.date = new Date(`${date}T00:00:00.000Z`);
  if (place) changes.place = place;
  if (type) changes.type = type;
  if (name) changes.name = name;
  if (description) changes.description = description;
  changes.group = group;

  const groupResult = await Group.findOne({ _id: { $eq: group } });
  if (!groupResult) return { error: 'GROUP_NOT_FOUND' };

  const result = await Event.updateOne({ _id: id }, { $set: changes });
  if (result.matchedCount === 0) return { error: 'EVENT_NOT_FOUND' };

  return { success: true };
}

/**
 * Deletes an event, its participants, and its associated group.
 * Only the group owner can delete the event.
 * @param {string} id - Event ObjectId.
 * @param {string} senderId - ObjectId of the requesting user.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: EVENT_NOT_FOUND, GROUP_NOT_FOUND, USER_NOT_OWNER.
 */
async function deleteEvent(id, senderId) {
  await Participant.deleteMany({ event: id });
  const event = await getEventById(id);
  if (!event) return { error: 'EVENT_NOT_FOUND' };

  const deleteGroupResult = await groupService.deleteGroup(event.group, senderId);
  if (deleteGroupResult.error) return { error: deleteGroupResult.error };

  const result = await Event.deleteOne({ _id: id });
  if (result.deletedCount === 0) return { error: 'EVENT_NOT_FOUND' };

  return { success: true };
}

/**
 * Registers a user's participation in an event.
 * Visitors cannot register for competitive matches.
 * If the user participates, they are automatically added to the event's group.
 * @param {string} eventId - Event ObjectId.
 * @param {boolean} participate - Whether the user is participating.
 * @param {string} senderId - ObjectId of the user.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: EVENT_NOT_FOUND, PERMISSION_NOT_ALLOWED, DUPLICATE.
 */
async function registerParticipation(eventId, participate, senderId) {
  const event = await Event.findOne({ _id: { $eq: eventId } });
  if (!event) return { error: 'EVENT_NOT_FOUND' };

  const sender = await User.findOne({ _id: { $eq: senderId } });
  if (sender.role === USER_ROLE.VISITEUR && event.type === EVENT_TYPE.MATCH_COMPETITIF)
    return { error: 'PERMISSION_NOT_ALLOWED' };

  try {
    await Participant.create({ event: eventId, participe: participate });
  } catch (error) {
    if (error.code === 11000) return { error: 'DUPLICATE' };
    throw error;
  }

  if (participate) {
    const existing = await GroupMembre.findOne({
      group: { $eq: event.group },
      user: { $eq: senderId },
    });
    if (!existing) {
      await GroupMembre.create({ group: event.group, user: senderId });
    }
  }

  return { success: true };
}

/**
 * Updates an existing participation for an event.
 * @param {string} eventId - Event ObjectId.
 * @param {boolean} participate - New participation value.
 * @param {string} senderId - ObjectId of the user.
 * @returns {Promise<{success: boolean}|{error: string}>}
 *   Possible errors: EVENT_NOT_FOUND, NON_PARTICIPATE.
 */
async function updateParticipation(eventId, participate, senderId) {
  const event = await Event.findOne({ _id: { $eq: eventId } });
  if (!event) return { error: 'EVENT_NOT_FOUND' };

  const result = await Participant.updateOne(
    { event: { $eq: eventId }, created_by: { $eq: senderId } },
    { participe: participate },
  );

  if (result.matchedCount === 0) return { error: 'NON_PARTICIPATE' };

  return { success: true };
}

/**
 * Retrieves the list of participants of an event.
 * @param {string} eventId - Event ObjectId.
 * @returns {Promise<{data: Array<Document>}|{error: string}>}
 *   Possible error: EVENT_NOT_FOUND.
 */
async function getEventParticipants(eventId) {
  const event = await Event.findOne({ _id: { $eq: eventId } });
  if (!event) return { error: 'EVENT_NOT_FOUND' };

  const participants = await Participant.find({ event: event._id });
  return { data: participants };
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerParticipation,
  updateParticipation,
  getEventParticipants,
};
