//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class EventInput {
  /// Returns a new [EventInput] instance.
  EventInput({
    required this.date,
    required this.place,
    required this.type,
    required this.name,
    required this.description,
    required this.group,
  });

  DateTime date;

  String place;

  EventInputTypeEnum type;

  String name;

  String description;

  String group;

  @override
  bool operator ==(Object other) => identical(this, other) || other is EventInput &&
    other.date == date &&
    other.place == place &&
    other.type == type &&
    other.name == name &&
    other.description == description &&
    other.group == group;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (date.hashCode) +
    (place.hashCode) +
    (type.hashCode) +
    (name.hashCode) +
    (description.hashCode) +
    (group.hashCode);

  @override
  String toString() => 'EventInput[date=$date, place=$place, type=$type, name=$name, description=$description, group=$group]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'date'] = _dateFormatter.format(this.date);
      json[r'place'] = this.place;
      json[r'type'] = this.type;
      json[r'name'] = this.name;
      json[r'description'] = this.description;
      json[r'group'] = this.group;
    return json;
  }

  /// Returns a new [EventInput] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static EventInput? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'date'), 'Required key "EventInput[date]" is missing from JSON.');
        assert(json[r'date'] != null, 'Required key "EventInput[date]" has a null value in JSON.');
        assert(json.containsKey(r'place'), 'Required key "EventInput[place]" is missing from JSON.');
        assert(json[r'place'] != null, 'Required key "EventInput[place]" has a null value in JSON.');
        assert(json.containsKey(r'type'), 'Required key "EventInput[type]" is missing from JSON.');
        assert(json[r'type'] != null, 'Required key "EventInput[type]" has a null value in JSON.');
        assert(json.containsKey(r'name'), 'Required key "EventInput[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "EventInput[name]" has a null value in JSON.');
        assert(json.containsKey(r'description'), 'Required key "EventInput[description]" is missing from JSON.');
        assert(json[r'description'] != null, 'Required key "EventInput[description]" has a null value in JSON.');
        assert(json.containsKey(r'group'), 'Required key "EventInput[group]" is missing from JSON.');
        assert(json[r'group'] != null, 'Required key "EventInput[group]" has a null value in JSON.');
        return true;
      }());

      return EventInput(
        date: mapDateTime(json, r'date', r'')!,
        place: mapValueOfType<String>(json, r'place')!,
        type: EventInputTypeEnum.fromJson(json[r'type'])!,
        name: mapValueOfType<String>(json, r'name')!,
        description: mapValueOfType<String>(json, r'description')!,
        group: mapValueOfType<String>(json, r'group')!,
      );
    }
    return null;
  }

  static List<EventInput> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EventInput>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EventInput.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, EventInput> mapFromJson(dynamic json) {
    final map = <String, EventInput>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = EventInput.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of EventInput-objects as value to a dart map
  static Map<String, List<EventInput>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<EventInput>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = EventInput.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'date',
    'place',
    'type',
    'name',
    'description',
    'group',
  };
}


enum EventInputTypeEnum {
  entrainement._(r'Entrainement'),
  matchAmical._(r'Match-amical'),
  matchComptitif._(r'Match-compétitif'),
  runion._(r'Réunion'),
  autre._(r'Autre'),
  ;

  /// Instantiate a new enum with the provided value.
  const EventInputTypeEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [EventInputTypeEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static EventInputTypeEnum? fromJson(dynamic value) => EventInputTypeEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [EventInputTypeEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<EventInputTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EventInputTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EventInputTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [EventInputTypeEnum] to String,
/// and [decode] dynamic data back to [EventInputTypeEnum].
class EventInputTypeEnumTypeTransformer {
  factory EventInputTypeEnumTypeTransformer() => _instance ??= const EventInputTypeEnumTypeTransformer._();

  const EventInputTypeEnumTypeTransformer._();

  String encode(EventInputTypeEnum data) => data._value;

  /// Returns the instance of [EventInputTypeEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  EventInputTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is EventInputTypeEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Entrainement': return EventInputTypeEnum.entrainement;
        case r'Match-amical': return EventInputTypeEnum.matchAmical;
        case r'Match-compétitif': return EventInputTypeEnum.matchComptitif;
        case r'Réunion': return EventInputTypeEnum.runion;
        case r'Autre': return EventInputTypeEnum.autre;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static EventInputTypeEnumTypeTransformer? _instance;
}


