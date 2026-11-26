//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class MessageDetails {
  /// Returns a new [MessageDetails] instance.
  MessageDetails({
    required this.id,
    required this.body,
    required this.author,
    required this.date,
  });

  String id;

  String body;

  String author;

  String date;

  @override
  bool operator ==(Object other) => identical(this, other) || other is MessageDetails &&
    other.id == id &&
    other.body == body &&
    other.author == author &&
    other.date == date;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (body.hashCode) +
    (author.hashCode) +
    (date.hashCode);

  @override
  String toString() => 'MessageDetails[id=$id, body=$body, author=$author, date=$date]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'body'] = this.body;
      json[r'author'] = this.author;
      json[r'date'] = this.date;
    return json;
  }

  /// Returns a new [MessageDetails] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static MessageDetails? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "MessageDetails[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "MessageDetails[id]" has a null value in JSON.');
        assert(json.containsKey(r'body'), 'Required key "MessageDetails[body]" is missing from JSON.');
        assert(json[r'body'] != null, 'Required key "MessageDetails[body]" has a null value in JSON.');
        assert(json.containsKey(r'author'), 'Required key "MessageDetails[author]" is missing from JSON.');
        assert(json[r'author'] != null, 'Required key "MessageDetails[author]" has a null value in JSON.');
        assert(json.containsKey(r'date'), 'Required key "MessageDetails[date]" is missing from JSON.');
        assert(json[r'date'] != null, 'Required key "MessageDetails[date]" has a null value in JSON.');
        return true;
      }());

      return MessageDetails(
        id: mapValueOfType<String>(json, r'id')!,
        body: mapValueOfType<String>(json, r'body')!,
        author: mapValueOfType<String>(json, r'author')!,
        date: mapValueOfType<String>(json, r'date')!,
      );
    }
    return null;
  }

  static List<MessageDetails> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <MessageDetails>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = MessageDetails.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, MessageDetails> mapFromJson(dynamic json) {
    final map = <String, MessageDetails>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = MessageDetails.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of MessageDetails-objects as value to a dart map
  static Map<String, List<MessageDetails>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<MessageDetails>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = MessageDetails.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'body',
    'author',
    'date',
  };
}

