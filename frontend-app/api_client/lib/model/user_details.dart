//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class UserDetails {
  /// Returns a new [UserDetails] instance.
  UserDetails({
    required this.id,
    required this.name,
    this.firstName,
    required this.email,
    required this.role,
    required this.pronoun,
    this.phoneNumber,
    this.birthday,
  });

  String id;

  String name;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? firstName;

  String email;

  UserDetailsRoleEnum role;

  UserDetailsPronounEnum pronoun;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  String? phoneNumber;

  ///
  /// Please note: This property should have been non-nullable! Since the specification file
  /// does not include a default value (using the "default:" property), however, the generated
  /// source code must fall back to having a nullable type.
  /// Consider adding a "default:" property in the specification file to hide this note.
  ///
  DateTime? birthday;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UserDetails &&
    other.id == id &&
    other.name == name &&
    other.firstName == firstName &&
    other.email == email &&
    other.role == role &&
    other.pronoun == pronoun &&
    other.phoneNumber == phoneNumber &&
    other.birthday == birthday;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (name.hashCode) +
    (firstName == null ? 0 : firstName!.hashCode) +
    (email.hashCode) +
    (role.hashCode) +
    (pronoun.hashCode) +
    (phoneNumber == null ? 0 : phoneNumber!.hashCode) +
    (birthday == null ? 0 : birthday!.hashCode);

  @override
  String toString() => 'UserDetails[id=$id, name=$name, firstName=$firstName, email=$email, role=$role, pronoun=$pronoun, phoneNumber=$phoneNumber, birthday=$birthday]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'name'] = this.name;
    if (this.firstName != null) {
      json[r'firstName'] = this.firstName;
    } else {
      json[r'firstName'] = null;
    }
      json[r'email'] = this.email;
      json[r'role'] = this.role;
      json[r'pronoun'] = this.pronoun;
    if (this.phoneNumber != null) {
      json[r'phoneNumber'] = this.phoneNumber;
    } else {
      json[r'phoneNumber'] = null;
    }
    if (this.birthday != null) {
      json[r'birthday'] = this.birthday!.toUtc().toIso8601String();
    } else {
      json[r'birthday'] = null;
    }
    return json;
  }

  /// Returns a new [UserDetails] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UserDetails? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "UserDetails[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "UserDetails[id]" has a null value in JSON.');
        assert(json.containsKey(r'name'), 'Required key "UserDetails[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "UserDetails[name]" has a null value in JSON.');
        assert(json.containsKey(r'email'), 'Required key "UserDetails[email]" is missing from JSON.');
        assert(json[r'email'] != null, 'Required key "UserDetails[email]" has a null value in JSON.');
        assert(json.containsKey(r'role'), 'Required key "UserDetails[role]" is missing from JSON.');
        assert(json[r'role'] != null, 'Required key "UserDetails[role]" has a null value in JSON.');
        assert(json.containsKey(r'pronoun'), 'Required key "UserDetails[pronoun]" is missing from JSON.');
        assert(json[r'pronoun'] != null, 'Required key "UserDetails[pronoun]" has a null value in JSON.');
        return true;
      }());

      return UserDetails(
        id: mapValueOfType<String>(json, r'id')!,
        name: mapValueOfType<String>(json, r'name')!,
        firstName: mapValueOfType<String>(json, r'firstName'),
        email: mapValueOfType<String>(json, r'email')!,
        role: UserDetailsRoleEnum.fromJson(json[r'role'])!,
        pronoun: UserDetailsPronounEnum.fromJson(json[r'pronoun'])!,
        phoneNumber: mapValueOfType<String>(json, r'phoneNumber'),
        birthday: mapDateTime(json, r'birthday', r''),
      );
    }
    return null;
  }

  static List<UserDetails> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UserDetails>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UserDetails.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UserDetails> mapFromJson(dynamic json) {
    final map = <String, UserDetails>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UserDetails.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UserDetails-objects as value to a dart map
  static Map<String, List<UserDetails>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UserDetails>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UserDetails.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'name',
    'email',
    'role',
    'pronoun',
  };
}


enum UserDetailsRoleEnum {
  entraineur._(r'Entraineur'),
  capitaine._(r'Capitaine'),
  adhrent._(r'Adhérent'),
  visiteur._(r'Visiteur'),
  ;

  /// Instantiate a new enum with the provided value.
  const UserDetailsRoleEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [UserDetailsRoleEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static UserDetailsRoleEnum? fromJson(dynamic value) => UserDetailsRoleEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [UserDetailsRoleEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<UserDetailsRoleEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UserDetailsRoleEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UserDetailsRoleEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UserDetailsRoleEnum] to String,
/// and [decode] dynamic data back to [UserDetailsRoleEnum].
class UserDetailsRoleEnumTypeTransformer {
  factory UserDetailsRoleEnumTypeTransformer() => _instance ??= const UserDetailsRoleEnumTypeTransformer._();

  const UserDetailsRoleEnumTypeTransformer._();

  String encode(UserDetailsRoleEnum data) => data._value;

  /// Returns the instance of [UserDetailsRoleEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UserDetailsRoleEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is UserDetailsRoleEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Entraineur': return UserDetailsRoleEnum.entraineur;
        case r'Capitaine': return UserDetailsRoleEnum.capitaine;
        case r'Adhérent': return UserDetailsRoleEnum.adhrent;
        case r'Visiteur': return UserDetailsRoleEnum.visiteur;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static UserDetailsRoleEnumTypeTransformer? _instance;
}



enum UserDetailsPronounEnum {
  il._(r'Il'),
  elle._(r'Elle'),
  iel._(r'Iel'),
  autre._(r'Autre'),
  ;

  /// Instantiate a new enum with the provided value.
  const UserDetailsPronounEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [UserDetailsPronounEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static UserDetailsPronounEnum? fromJson(dynamic value) => UserDetailsPronounEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [UserDetailsPronounEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<UserDetailsPronounEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UserDetailsPronounEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UserDetailsPronounEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UserDetailsPronounEnum] to String,
/// and [decode] dynamic data back to [UserDetailsPronounEnum].
class UserDetailsPronounEnumTypeTransformer {
  factory UserDetailsPronounEnumTypeTransformer() => _instance ??= const UserDetailsPronounEnumTypeTransformer._();

  const UserDetailsPronounEnumTypeTransformer._();

  String encode(UserDetailsPronounEnum data) => data._value;

  /// Returns the instance of [UserDetailsPronounEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UserDetailsPronounEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is UserDetailsPronounEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Il': return UserDetailsPronounEnum.il;
        case r'Elle': return UserDetailsPronounEnum.elle;
        case r'Iel': return UserDetailsPronounEnum.iel;
        case r'Autre': return UserDetailsPronounEnum.autre;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static UserDetailsPronounEnumTypeTransformer? _instance;
}


