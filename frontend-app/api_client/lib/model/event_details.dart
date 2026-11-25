//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class EventDetails {
  /// Returns a new [EventDetails] instance.
  EventDetails({
    required this.id,
    required this.name,
    required this.date,
    required this.place,
    required this.type,
    required this.description,
    required this.group,
  });

  String id;

  String name;

  DateTime date;

  String place;

  EventDetailsTypeEnum type;

  String description;

  String group;

  @override
  bool operator ==(Object other) => identical(this, other) || other is EventDetails &&
    other.id == id &&
    other.name == name &&
    other.date == date &&
    other.place == place &&
    other.type == type &&
    other.description == description &&
    other.group == group;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (name.hashCode) +
    (date.hashCode) +
    (place.hashCode) +
    (type.hashCode) +
    (description.hashCode) +
    (group.hashCode);

  @override
  String toString() => 'EventDetails[id=$id, name=$name, date=$date, place=$place, type=$type, description=$description, group=$group]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'name'] = this.name;
      json[r'date'] = this.date.toUtc().toIso8601String();
      json[r'place'] = this.place;
      json[r'type'] = this.type;
      json[r'description'] = this.description;
      json[r'group'] = this.group;
    return json;
  }

  /// Returns a new [EventDetails] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static EventDetails? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "EventDetails[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "EventDetails[id]" has a null value in JSON.');
        assert(json.containsKey(r'name'), 'Required key "EventDetails[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "EventDetails[name]" has a null value in JSON.');
        assert(json.containsKey(r'date'), 'Required key "EventDetails[date]" is missing from JSON.');
        assert(json[r'date'] != null, 'Required key "EventDetails[date]" has a null value in JSON.');
        assert(json.containsKey(r'place'), 'Required key "EventDetails[place]" is missing from JSON.');
        assert(json[r'place'] != null, 'Required key "EventDetails[place]" has a null value in JSON.');
        assert(json.containsKey(r'type'), 'Required key "EventDetails[type]" is missing from JSON.');
        assert(json[r'type'] != null, 'Required key "EventDetails[type]" has a null value in JSON.');
        assert(json.containsKey(r'description'), 'Required key "EventDetails[description]" is missing from JSON.');
        assert(json[r'description'] != null, 'Required key "EventDetails[description]" has a null value in JSON.');
        assert(json.containsKey(r'group'), 'Required key "EventDetails[group]" is missing from JSON.');
        assert(json[r'group'] != null, 'Required key "EventDetails[group]" has a null value in JSON.');
        return true;
      }());

      return EventDetails(
        id: mapValueOfType<String>(json, r'id')!,
        name: mapValueOfType<String>(json, r'name')!,
        date: mapDateTime(json, r'date', r'')!,
        place: mapValueOfType<String>(json, r'place')!,
        type: EventDetailsTypeEnum.fromJson(json[r'type'])!,
        description: mapValueOfType<String>(json, r'description')!,
        group: mapValueOfType<String>(json, r'group')!,
      );
    }
    return null;
  }

  static List<EventDetails> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EventDetails>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EventDetails.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, EventDetails> mapFromJson(dynamic json) {
    final map = <String, EventDetails>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = EventDetails.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of EventDetails-objects as value to a dart map
  static Map<String, List<EventDetails>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<EventDetails>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = EventDetails.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'name',
    'date',
    'place',
    'type',
    'description',
    'group',
  };
}


enum EventDetailsTypeEnum {
  entrainement._(r'Entrainement'),
  matchAmical._(r'Match-amical'),
  matchComptitif._(r'Match-compétitif'),
  runion._(r'Réunion'),
  autre._(r'Autre'),
  ;

  /// Instantiate a new enum with the provided value.
  const EventDetailsTypeEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [EventDetailsTypeEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static EventDetailsTypeEnum? fromJson(dynamic value) => EventDetailsTypeEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [EventDetailsTypeEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<EventDetailsTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EventDetailsTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EventDetailsTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [EventDetailsTypeEnum] to String,
/// and [decode] dynamic data back to [EventDetailsTypeEnum].
class EventDetailsTypeEnumTypeTransformer {
  factory EventDetailsTypeEnumTypeTransformer() => _instance ??= const EventDetailsTypeEnumTypeTransformer._();

  const EventDetailsTypeEnumTypeTransformer._();

  String encode(EventDetailsTypeEnum data) => data._value;

  /// Returns the instance of [EventDetailsTypeEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  EventDetailsTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is EventDetailsTypeEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Entrainement': return EventDetailsTypeEnum.entrainement;
        case r'Match-amical': return EventDetailsTypeEnum.matchAmical;
        case r'Match-compétitif': return EventDetailsTypeEnum.matchComptitif;
        case r'Réunion': return EventDetailsTypeEnum.runion;
        case r'Autre': return EventDetailsTypeEnum.autre;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static EventDetailsTypeEnumTypeTransformer? _instance;
}


