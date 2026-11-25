//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class EventListItem {
  /// Returns a new [EventListItem] instance.
  EventListItem({
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

  EventListItemTypeEnum type;

  String description;

  String group;

  @override
  bool operator ==(Object other) => identical(this, other) || other is EventListItem &&
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
  String toString() => 'EventListItem[id=$id, name=$name, date=$date, place=$place, type=$type, description=$description, group=$group]';

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

  /// Returns a new [EventListItem] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static EventListItem? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "EventListItem[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "EventListItem[id]" has a null value in JSON.');
        assert(json.containsKey(r'name'), 'Required key "EventListItem[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "EventListItem[name]" has a null value in JSON.');
        assert(json.containsKey(r'date'), 'Required key "EventListItem[date]" is missing from JSON.');
        assert(json[r'date'] != null, 'Required key "EventListItem[date]" has a null value in JSON.');
        assert(json.containsKey(r'place'), 'Required key "EventListItem[place]" is missing from JSON.');
        assert(json[r'place'] != null, 'Required key "EventListItem[place]" has a null value in JSON.');
        assert(json.containsKey(r'type'), 'Required key "EventListItem[type]" is missing from JSON.');
        assert(json[r'type'] != null, 'Required key "EventListItem[type]" has a null value in JSON.');
        assert(json.containsKey(r'description'), 'Required key "EventListItem[description]" is missing from JSON.');
        assert(json[r'description'] != null, 'Required key "EventListItem[description]" has a null value in JSON.');
        assert(json.containsKey(r'group'), 'Required key "EventListItem[group]" is missing from JSON.');
        assert(json[r'group'] != null, 'Required key "EventListItem[group]" has a null value in JSON.');
        return true;
      }());

      return EventListItem(
        id: mapValueOfType<String>(json, r'id')!,
        name: mapValueOfType<String>(json, r'name')!,
        date: mapDateTime(json, r'date', r'')!,
        place: mapValueOfType<String>(json, r'place')!,
        type: EventListItemTypeEnum.fromJson(json[r'type'])!,
        description: mapValueOfType<String>(json, r'description')!,
        group: mapValueOfType<String>(json, r'group')!,
      );
    }
    return null;
  }

  static List<EventListItem> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EventListItem>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EventListItem.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, EventListItem> mapFromJson(dynamic json) {
    final map = <String, EventListItem>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = EventListItem.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of EventListItem-objects as value to a dart map
  static Map<String, List<EventListItem>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<EventListItem>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = EventListItem.listFromJson(entry.value, growable: growable,);
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


enum EventListItemTypeEnum {
  entrainement._(r'Entrainement'),
  matchAmical._(r'Match-amical'),
  matchComptitif._(r'Match-compétitif'),
  runion._(r'Réunion'),
  autre._(r'Autre'),
  ;

  /// Instantiate a new enum with the provided value.
  const EventListItemTypeEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [EventListItemTypeEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static EventListItemTypeEnum? fromJson(dynamic value) => EventListItemTypeEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [EventListItemTypeEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<EventListItemTypeEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <EventListItemTypeEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = EventListItemTypeEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [EventListItemTypeEnum] to String,
/// and [decode] dynamic data back to [EventListItemTypeEnum].
class EventListItemTypeEnumTypeTransformer {
  factory EventListItemTypeEnumTypeTransformer() => _instance ??= const EventListItemTypeEnumTypeTransformer._();

  const EventListItemTypeEnumTypeTransformer._();

  String encode(EventListItemTypeEnum data) => data._value;

  /// Returns the instance of [EventListItemTypeEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  EventListItemTypeEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is EventListItemTypeEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Entrainement': return EventListItemTypeEnum.entrainement;
        case r'Match-amical': return EventListItemTypeEnum.matchAmical;
        case r'Match-compétitif': return EventListItemTypeEnum.matchComptitif;
        case r'Réunion': return EventListItemTypeEnum.runion;
        case r'Autre': return EventListItemTypeEnum.autre;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static EventListItemTypeEnumTypeTransformer? _instance;
}


