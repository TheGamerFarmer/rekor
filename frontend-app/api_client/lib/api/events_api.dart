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

  /// Creates a new event with an auto-created group (requires Entraineur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [EventInput] eventInput (required):
  Future<Response> createEventWithHttpInfo(EventInput eventInput, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/event';

    // ignore: prefer_final_locals
    Object? postBody = eventInput;

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

  /// Creates a new event with an auto-created group (requires Entraineur role or above)
  ///
  /// Parameters:
  ///
  /// * [EventInput] eventInput (required):
  Future<void> createEvent(EventInput eventInput, { Future<void>? abortTrigger, }) async {
    final response = await createEventWithHttpInfo(eventInput, abortTrigger: abortTrigger,);
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

  /// Retrieves an event by its identifier
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

  /// Retrieves an event by its identifier
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

  /// Lists participants of an event (requires Visiteur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<Response> listEventParticipantsWithHttpInfo(String id, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/event/{id}/participants'
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

  /// Lists participants of an event (requires Visiteur role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  Future<List<ParticipantListItem>?> listEventParticipants(String id, { Future<void>? abortTrigger, }) async {
    final response = await listEventParticipantsWithHttpInfo(id, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
    // When a remote server returns no body with a status of 204, we shall not decode it.
    // At the time of writing this, `dart:convert` will throw an "Unexpected end of input"
    // FormatException when trying to decode an empty string.
    if (response.body.isNotEmpty && response.statusCode != HttpStatus.noContent) {
      final responseBody = await _decodeBodyBytes(response);
      return (await apiClient.deserializeAsync(responseBody, 'List<ParticipantListItem>') as List)
        .cast<ParticipantListItem>()
        .toList(growable: false);

    }
    return null;
  }

  /// Lists events
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

  /// Lists events
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

  /// Registers participation for an event and joins the group if accepting (requires Entraineur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [RegisterParticipationInput] registerParticipationInput (required):
  Future<Response> registerParticipationWithHttpInfo(String id, RegisterParticipationInput registerParticipationInput, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/event/{id}/register'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = registerParticipationInput;

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

  /// Registers participation for an event and joins the group if accepting (requires Entraineur role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [RegisterParticipationInput] registerParticipationInput (required):
  Future<void> registerParticipation(String id, RegisterParticipationInput registerParticipationInput, { Future<void>? abortTrigger, }) async {
    final response = await registerParticipationWithHttpInfo(id, registerParticipationInput, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
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

  /// Updates participation for an event (requires Entraineur role or above)
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [RegisterParticipationInput] registerParticipationInput (required):
  Future<Response> updateParticipationWithHttpInfo(String id, RegisterParticipationInput registerParticipationInput, { Future<void>? abortTrigger, }) async {
    // ignore: prefer_const_declarations
    final path = r'/event/{id}/register'
      .replaceAll('{id}', id);

    // ignore: prefer_final_locals
    Object? postBody = registerParticipationInput;

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

  /// Updates participation for an event (requires Entraineur role or above)
  ///
  /// Parameters:
  ///
  /// * [String] id (required):
  ///
  /// * [RegisterParticipationInput] registerParticipationInput (required):
  Future<void> updateParticipation(String id, RegisterParticipationInput registerParticipationInput, { Future<void>? abortTrigger, }) async {
    final response = await updateParticipationWithHttpInfo(id, registerParticipationInput, abortTrigger: abortTrigger,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}
