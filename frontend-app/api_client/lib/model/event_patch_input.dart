//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class EventPatchInput {
  /// Returns a new [EventPatchInput] instance.
  EventPatchInput({
    this.date,
    this.place,
    this.type,
    this.name,
    this.description,
    this.group,
  });

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  DateTime? date;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? place;

  EventPatchInputTypeEnum? type;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? name;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? description;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? group;

  @override
  bool operator ==(Object other) => identical(this, other) || other is EventPatchInput &&
    other.date == date &&
    other.place == place &&
    other.type == type &&
    other.name == name &&
    other.description == description &&
    other.group == group;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (date == null ? 0 : date!.hashCode) +
    (place == null ? 0 : place!.hashCode) +
    (type == null ? 0 : type!.hashCode) +
    (name == null ? 0 : name!.hashCode) +
    (description == null ? 0 : description!.hashCode) +
    (group == null ? 0 : group!.hashCode);

  @override
  String toString() => 'EventPatchInput[date=$date, place=$place, type=$type, name=$name, description=$description, group=$group]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.date != null) {
      json[r'date'] = _dateFormatter.format(this.date!);
    } else {
      json[r'date'] = null;
    }
    if (this.place != null) {
      json[r'place'] = this.place;
    } else {
      json[r'place'] = null;
    }
    if (this.type != null) {
      json[r'type'] = this.type;
    } else {
      json[r'type'] = null;
    }
    if (this.name != null) {
      json[r'name'] = this.name;
    } else {
      json[r'name'] = null;
    }
    if (this.description != null) {
      json[r'description'] = this.description;
    } else {
      json[r'description'] = null;
    }
    if (this.group != null) {
      json[r'group'] = this.group;
    } else {
      json[r'group'] = null;
    }
    return json;
  }

  /// Returns a new [EventPatchInput] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static EventPatchInput? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return EventPatchInput(
        date: mapDateTime(json, r'date', r''),
        place: mapValueOfType<String>(json, r'place'),
        type: EventPatchInputTypeEnum.fromJson(json[r'type']),
        name: mapValueOfType<String>(json, r'name'),
        description: mapValueOfType<String>(json, r'description'),
        group: mapValueOfType<String>(json, r'group'),
      );
    }
    return null;
  }

  static List<EventPatchInput> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EventPatchInput>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EventPatchInput.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, EventPatchInput> mapFromJson(dynamic json) {
    final map = <String, EventPatchInput>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = EventPatchInput.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of EventPatchInput-objects as value to a dart map
  static Map<String, List<EventPatchInput>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<EventPatchInput>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = EventPatchInput.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


enum EventPatchInputTypeEnum {
  entrainement._(r'Entrainement'),
  matchAmical._(r'Match-amical'),
  matchComptitif._(r'Match-compétitif'),
  runion._(r'Réunion'),
  autre._(r'Autre'),
  ;

  /// Instantiate a new enum with the provided value.
  const EventPatchInputTypeEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [EventPatchInputTypeEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static EventPatchInputTypeEnum? fromJson(dynamic value) => EventPatchInputTypeEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [EventPatchInputTypeEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<EventPatchInputTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EventPatchInputTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EventPatchInputTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [EventPatchInputTypeEnum] to String,
/// and [decode] dynamic data back to [EventPatchInputTypeEnum].
class EventPatchInputTypeEnumTypeTransformer {
  factory EventPatchInputTypeEnumTypeTransformer() => _instance ??= const EventPatchInputTypeEnumTypeTransformer._();

  const EventPatchInputTypeEnumTypeTransformer._();

  String encode(EventPatchInputTypeEnum data) => data._value;

  /// Returns the instance of [EventPatchInputTypeEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  EventPatchInputTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is EventPatchInputTypeEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Entrainement': return EventPatchInputTypeEnum.entrainement;
        case r'Match-amical': return EventPatchInputTypeEnum.matchAmical;
        case r'Match-compétitif': return EventPatchInputTypeEnum.matchComptitif;
        case r'Réunion': return EventPatchInputTypeEnum.runion;
        case r'Autre': return EventPatchInputTypeEnum.autre;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static EventPatchInputTypeEnumTypeTransformer? _instance;
}


