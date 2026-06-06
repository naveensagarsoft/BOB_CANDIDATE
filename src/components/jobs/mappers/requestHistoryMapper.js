/**
 * Map request history API response to UI-friendly model
 */
export const mapRequestHistoryApiToList = (apiList = []) => {
  if (!Array.isArray(apiList)) return [];

  return apiList.map(item => {
    const thread = item.conversationThreads || {};
    const messages = item.conversationMessages || [];

    return {
      thread_id: thread.conversationThreadId,
      application_id: thread.applicationId,
      request_type_id: thread.requestTypeId,
      initiated_by: thread.initiatedBy,
      status: thread.status,
      created_date:thread.createdDate,
      modified_date:thread.modifiedDate,

      messages: messages.map(msg => ({
        message_id: msg.conversationMessageId,
        sender_type: msg.senderType,
        sender_id: msg.senderId,
        message: msg.message,
        attachment: msg.attachmentPath,
        is_read: msg.isRead,
           created_date:msg.createdDate,
      modified_date:msg.modifiedDate,
      })),
    };
  });
};
