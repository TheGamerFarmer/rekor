//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class CurrentUser {
  /// Returns a new [CurrentUser] instance.
  CurrentUser({
    required this.id,
    required this.role,
  });

  String id;

  CurrentUserRoleEnum role;

  @override
  bool operator ==(Object other) => identical(this, other) || other is CurrentUser &&
    other.id == id &&
    other.role == role;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (role.hashCode);

  @override
  String toString() => 'CurrentUser[id=$id, role=$role]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'role'] = this.role;
    return json;
  }

  /// Returns a new [CurrentUser] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static CurrentUser? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "CurrentUser[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "CurrentUser[id]" has a null value in JSON.');
        assert(json.containsKey(r'role'), 'Required key "CurrentUser[role]" is missing from JSON.');
        assert(json[r'role'] != null, 'Required key "CurrentUser[role]" has a null value in JSON.');
        return true;
      }());

      return CurrentUser(
        id: mapValueOfType<String>(json, r'id')!,
        role: CurrentUserRoleEnum.fromJson(json[r'role'])!,
      );
    }
    return null;
  }

  static List<CurrentUser> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CurrentUser>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CurrentUser.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, CurrentUser> mapFromJson(dynamic json) {
    final map = <String, CurrentUser>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = CurrentUser.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of CurrentUser-objects as value to a dart map
  static Map<String, List<CurrentUser>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<CurrentUser>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = CurrentUser.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'role',
  };
}


enum CurrentUserRoleEnum {
  entraineur._(r'Entraineur'),
  capitaine._(r'Capitaine'),
  adhrent._(r'Adhérent'),
  visiteur._(r'Visiteur'),
  ;

  /// Instantiate a new enum with the provided value.
  const CurrentUserRoleEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [CurrentUserRoleEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static CurrentUserRoleEnum? fromJson(dynamic value) => CurrentUserRoleEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [CurrentUserRoleEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<CurrentUserRoleEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <CurrentUserRoleEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = CurrentUserRoleEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [CurrentUserRoleEnum] to String,
/// and [decode] dynamic data back to [CurrentUserRoleEnum].
class CurrentUserRoleEnumTypeTransformer {
  factory CurrentUserRoleEnumTypeTransformer() => _instance ??= const CurrentUserRoleEnumTypeTransformer._();

  const CurrentUserRoleEnumTypeTransformer._();

  String encode(CurrentUserRoleEnum data) => data._value;

  /// Returns the instance of [CurrentUserRoleEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  CurrentUserRoleEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is CurrentUserRoleEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Entraineur': return CurrentUserRoleEnum.entraineur;
        case r'Capitaine': return CurrentUserRoleEnum.capitaine;
        case r'Adhérent': return CurrentUserRoleEnum.adhrent;
        case r'Visiteur': return CurrentUserRoleEnum.visiteur;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static CurrentUserRoleEnumTypeTransformer? _instance;
}


