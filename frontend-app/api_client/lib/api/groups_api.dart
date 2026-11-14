//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;


class GroupsApi {
  GroupsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Adds a user to a group (requires Entraineur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [String] userId (required):
  Future<Response> addGroupMemberWithHttpInfo(String id, String userId, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{id}/members/{userId}'
      .replaceAll('{id}', id)
      .replaceAll('{userId}', userId);

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'PUT',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Adds a user to a group (requires Entraineur role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [String] userId (required):
  Future<void> addGroupMember(String id, String userId, { Future<void>? abortTrigger, }) async {
    final response = await addGroupMemberWithHttpInfo(id, userId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Creates a new group (requires Entraineur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [GroupInput] groupInput (required):
  Future<Response> createGroupWithHttpInfo(String id, GroupInput groupInput, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = groupInput;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'PUT',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
      abortTrigger: abortTrigger,
    );
  }

  /// Creates a new group (requires Entraineur role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [GroupInput] groupInput (required):
  Future<void> createGroup(String id, GroupInput groupInput, { Future<void>? abortTrigger, }) async {
    final response = await createGroupWithHttpInfo(id, groupInput, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Deletes a group (requires Entraineur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> deleteGroupWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{id}'
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

  /// Deletes a group (requires Entraineur role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<void> deleteGroup(String id, { Future<void>? abortTrigger, }) async {
    final response = await deleteGroupWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Retrieves a group by its identifier (requires Adhérent role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> getGroupWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{id}'
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

  /// Retrieves a group by its identifier (requires Adhérent role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<GroupDetails?> getGroup(String id, { Future<void>? abortTrigger, }) async {
    final response = await getGroupWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'GroupDetails',) as GroupDetails;
    
    }
    return null;
  }

  /// Lists the members of a group (requires Adhérent role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> listGroupMembersWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{id}/members'
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

  /// Lists the members of a group (requires Adhérent role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<List<UserDetails>?> listGroupMembers(String id, { Future<void>? abortTrigger, }) async {
    final response = await listGroupMembersWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      final responseBody = await _decodeBodyBytes(response);
      return (await apiClient.deserializeAsync(responseBody, 'List<UserDetails>') as List)
        .cast<UserDetails>()
        .toList(growable: false);

    }
    return null;
  }

  /// Removes a user from a group (requires Entraineur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [String] userId (required):
  Future<Response> removeGroupMemberWithHttpInfo(String id, String userId, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{id}/members/{userId}'
      .replaceAll('{id}', id)
      .replaceAll('{userId}', userId);

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

  /// Removes a user from a group (requires Entraineur role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [String] userId (required):
  Future<void> removeGroupMember(String id, String userId, { Future<void>? abortTrigger, }) async {
    final response = await removeGroupMemberWithHttpInfo(id, userId, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Partially updates a group (requires Entraineur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [GroupPatchInput] groupPatchInput (required):
  Future<Response> updateGroupWithHttpInfo(String id, GroupPatchInput groupPatchInput, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/group/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = groupPatchInput;

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

  /// Partially updates a group (requires Entraineur role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [GroupPatchInput] groupPatchInput (required):
  Future<void> updateGroup(String id, GroupPatchInput groupPatchInput, { Future<void>? abortTrigger, }) async {
    final response = await updateGroupWithHttpInfo(id, groupPatchInput, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
