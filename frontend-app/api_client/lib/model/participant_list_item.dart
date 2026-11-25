//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class ParticipantListItem {
  /// Returns a new [ParticipantListItem] instance.
  ParticipantListItem({
    required this.id,
    required this.event,
    required this.participe,
    required this.user,
  });

  String id;

  String event;

  bool participe;

  String user;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ParticipantListItem &&
    other.id == id &&
    other.event == event &&
    other.participe == participe &&
    other.user == user;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (event.hashCode) +
    (participe.hashCode) +
    (user.hashCode);

  @override
  String toString() => 'ParticipantListItem[id=$id, event=$event, participe=$participe, user=$user]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'event'] = this.event;
      json[r'participe'] = this.participe;
      json[r'user'] = this.user;
    return json;
  }

  /// Returns a new [ParticipantListItem] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ParticipantListItem? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "ParticipantListItem[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "ParticipantListItem[id]" has a null value in JSON.');
        assert(json.containsKey(r'event'), 'Required key "ParticipantListItem[event]" is missing from JSON.');
        assert(json[r'event'] != null, 'Required key "ParticipantListItem[event]" has a null value in JSON.');
        assert(json.containsKey(r'participe'), 'Required key "ParticipantListItem[participe]" is missing from JSON.');
        assert(json[r'participe'] != null, 'Required key "ParticipantListItem[participe]" has a null value in JSON.');
        assert(json.containsKey(r'user'), 'Required key "ParticipantListItem[user]" is missing from JSON.');
        assert(json[r'user'] != null, 'Required key "ParticipantListItem[user]" has a null value in JSON.');
        return true;
      }());

      return ParticipantListItem(
        id: mapValueOfType<String>(json, r'id')!,
        event: mapValueOfType<String>(json, r'event')!,
        participe: mapValueOfType<bool>(json, r'participe')!,
        user: mapValueOfType<String>(json, r'user')!,
      );
    }
    return null;
  }

  static List<ParticipantListItem> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ParticipantListItem>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ParticipantListItem.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ParticipantListItem> mapFromJson(dynamic json) {
    final map = <String, ParticipantListItem>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ParticipantListItem.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ParticipantListItem-objects as value to a dart map
  static Map<String, List<ParticipantListItem>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ParticipantListItem>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ParticipantListItem.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'event',
    'participe',
    'user',
  };
}

