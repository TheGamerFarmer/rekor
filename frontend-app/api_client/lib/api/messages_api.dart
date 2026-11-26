//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;


class MessagesApi {
  MessagesApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Creates a new message in the group (requires authentication + group membership)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] groupId (required):
  ///
  /// * [MessageInput] messageInput (required):
  Future<Response> createGroupMessageWithHttpInfo(String groupId, MessageInput messageInput, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{groupId}/messages'
      .replaceAll('{groupId}', groupId);

    // ignore: prefer_final_locals
    Object? postBody = messageInput;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Creates a new message in the group (requires authentication + group membership)
  ///
  /// Parameters:
  ///
  /// * [String] groupId (required):
  ///
  /// * [MessageInput] messageInput (required):
  Future<void> createGroupMessage(String groupId, MessageInput messageInput, { Future<void>? abortTrigger, }) async {
    final response = await createGroupMessageWithHttpInfo(groupId, messageInput, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Deletes a message (requires authentication + group membership, must be author or admin)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] groupId (required):
  ///
  /// * [String] id (required):
  Future<Response> deleteGroupMessageWithHttpInfo(String groupId, String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{groupId}/messages/{id}'
      .replaceAll('{groupId}', groupId)
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'DELETE',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Deletes a message (requires authentication + group membership, must be author or admin)
  ///
  /// Parameters:
  ///
  /// * [String] groupId (required):
  ///
  /// * [String] id (required):
  Future<void> deleteGroupMessage(String groupId, String id, { Future<void>? abortTrigger, }) async {
    final response = await deleteGroupMessageWithHttpInfo(groupId, id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Retrieves a message by its identifier (requires authentication + group membership)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] groupId (required):
  ///
  /// * [String] id (required):
  Future<Response> getGroupMessageWithHttpInfo(String groupId, String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{groupId}/messages/{id}'
      .replaceAll('{groupId}', groupId)
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Retrieves a message by its identifier (requires authentication + group membership)
  ///
  /// Parameters:
  ///
  /// * [String] groupId (required):
  ///
  /// * [String] id (required):
  Future<MessageDetails?> getGroupMessage(String groupId, String id, { Future<void>? abortTrigger, }) async {
    final response = await getGroupMessageWithHttpInfo(groupId, id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'MessageDetails',) as MessageDetails;
    
    }
    return null;
  }

  /// Lists all messages in a group (requires authentication + group membership)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] groupId (required):
  Future<Response> listGroupMessagesWithHttpInfo(String groupId, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{groupId}/messages'
      .replaceAll('{groupId}', groupId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Lists all messages in a group (requires authentication + group membership)
  ///
  /// Parameters:
  ///
  /// * [String] groupId (required):
  Future<List<MessageDetails>?> listGroupMessages(String groupId, { Future<void>? abortTrigger, }) async {
    final response = await listGroupMessagesWithHttpInfo(groupId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      final responseBody = await _decodeBodyBytes(response);
      return (await apiClient.deserializeAsync(responseBody, 'List<MessageDetails>') as List)
        .cast<MessageDetails>()
        .toList(growable: false);

    }
    return null;
  }

  /// Updates a message (requires authentication + group membership, must be author)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] groupId (required):
  ///
  /// * [String] id (required):
  ///
  /// * [MessageInput] messageInput (required):
  Future<Response> updateGroupMessageWithHttpInfo(String groupId, String id, MessageInput messageInput, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{groupId}/messages/{id}'
      .replaceAll('{groupId}', groupId)
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = messageInput;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PATCH',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Updates a message (requires authentication + group membership, must be author)
  ///
  /// Parameters:
  ///
  /// * [String] groupId (required):
  ///
  /// * [String] id (required):
  ///
  /// * [MessageInput] messageInput (required):
  Future<void> updateGroupMessage(String groupId, String id, MessageInput messageInput, { Future<void>? abortTrigger, }) async {
    final response = await updateGroupMessageWithHttpInfo(groupId, id, messageInput, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
