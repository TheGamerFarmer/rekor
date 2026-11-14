//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;


class EventsApi {
  EventsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Creates a new event (requires Entraineur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [EventInput] eventInput (required):
  Future<Response> createEventWithHttpInfo(String id, EventInput eventInput, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/event/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = eventInput;

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

  /// Creates a new event (requires Entraineur role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [EventInput] eventInput (required):
  Future<void> createEvent(String id, EventInput eventInput, { Future<void>? abortTrigger, }) async {
    final response = await createEventWithHttpInfo(id, eventInput, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Deletes an event (requires Entraineur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> deleteEventWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/event/{id}'
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

  /// Deletes an event (requires Entraineur role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<void> deleteEvent(String id, { Future<void>? abortTrigger, }) async {
    final response = await deleteEventWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Retrieves an event by its identifier (user must be a member of the event group)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> getEventWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/event/{id}'
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

  /// Retrieves an event by its identifier (user must be a member of the event group)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<EventDetails?> getEvent(String id, { Future<void>? abortTrigger, }) async {
    final response = await getEventWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      return await apiClient.deserializeAsync(await _decodeBodyBytes(response), 'EventDetails',) as EventDetails;
    
    }
    return null;
  }

  /// Lists events belonging to groups the authenticated user is a member of
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> listEventsWithHttpInfo({ Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/event';

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

  /// Lists events belonging to groups the authenticated user is a member of
  Future<List<EventListItem>?> listEvents({ Future<void>? abortTrigger, }) async {
    final response = await listEventsWithHttpInfo(abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      final responseBody = await _decodeBodyBytes(response);
      return (await apiClient.deserializeAsync(responseBody, 'List<EventListItem>') as List)
        .cast<EventListItem>()
        .toList(growable: false);

    }
    return null;
  }

  /// Partially updates an event (requires Entraineur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [EventPatchInput] eventPatchInput (required):
  Future<Response> updateEventWithHttpInfo(String id, EventPatchInput eventPatchInput, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/event/{id}'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = eventPatchInput;

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

  /// Partially updates an event (requires Entraineur role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [EventPatchInput] eventPatchInput (required):
  Future<void> updateEvent(String id, EventPatchInput eventPatchInput, { Future<void>? abortTrigger, }) async {
    final response = await updateEventWithHttpInfo(id, eventPatchInput, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
