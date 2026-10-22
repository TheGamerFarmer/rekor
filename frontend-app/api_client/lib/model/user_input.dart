//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class UserInput {
  /// Returns a new [UserInput] instance.
  UserInput({
    required this.email,
    required this.name,
    required this.firstName,
    required this.password,
    required this.role,
    required this.pronoun,
    this.phoneNumber,
    this.birthday,
  });

  String email;

  String name;

  String firstName;

  String password;

  UserInputRoleEnum role;

  UserInputPronounEnum pronoun;

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
  bool operator ==(Object other) => identical(this, other) || other is UserInput &&
    other.email == email &&
    other.name == name &&
    other.firstName == firstName &&
    other.password == password &&
    other.role == role &&
    other.pronoun == pronoun &&
    other.phoneNumber == phoneNumber &&
    other.birthday == birthday;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (email.hashCode) +
    (name.hashCode) +
    (firstName.hashCode) +
    (password.hashCode) +
    (role.hashCode) +
    (pronoun.hashCode) +
    (phoneNumber == null ? 0 : phoneNumber!.hashCode) +
    (birthday == null ? 0 : birthday!.hashCode);

  @override
  String toString() => 'UserInput[email=$email, name=$name, firstName=$firstName, password=$password, role=$role, pronoun=$pronoun, phoneNumber=$phoneNumber, birthday=$birthday]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'email'] = this.email;
      json[r'name'] = this.name;
      json[r'firstName'] = this.firstName;
      json[r'password'] = this.password;
      json[r'role'] = this.role;
      json[r'pronoun'] = this.pronoun;
    if (this.phoneNumber != null) {
      json[r'phoneNumber'] = this.phoneNumber;
    } else {
      json[r'phoneNumber'] = null;
    }
    if (this.birthday != null) {
      json[r'birthday'] = _dateFormatter.format(this.birthday!);
    } else {
      json[r'birthday'] = null;
    }
    return json;
  }

  /// Returns a new [UserInput] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UserInput? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'email'), 'Required key "UserInput[email]" is missing from JSON.');
        assert(json[r'email'] != null, 'Required key "UserInput[email]" has a null value in JSON.');
        assert(json.containsKey(r'name'), 'Required key "UserInput[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "UserInput[name]" has a null value in JSON.');
        assert(json.containsKey(r'firstName'), 'Required key "UserInput[firstName]" is missing from JSON.');
        assert(json[r'firstName'] != null, 'Required key "UserInput[firstName]" has a null value in JSON.');
        assert(json.containsKey(r'password'), 'Required key "UserInput[password]" is missing from JSON.');
        assert(json[r'password'] != null, 'Required key "UserInput[password]" has a null value in JSON.');
        assert(json.containsKey(r'role'), 'Required key "UserInput[role]" is missing from JSON.');
        assert(json[r'role'] != null, 'Required key "UserInput[role]" has a null value in JSON.');
        assert(json.containsKey(r'pronoun'), 'Required key "UserInput[pronoun]" is missing from JSON.');
        assert(json[r'pronoun'] != null, 'Required key "UserInput[pronoun]" has a null value in JSON.');
        return true;
      }());

      return UserInput(
        email: mapValueOfType<String>(json, r'email')!,
        name: mapValueOfType<String>(json, r'name')!,
        firstName: mapValueOfType<String>(json, r'firstName')!,
        password: mapValueOfType<String>(json, r'password')!,
        role: UserInputRoleEnum.fromJson(json[r'role'])!,
        pronoun: UserInputPronounEnum.fromJson(json[r'pronoun'])!,
        phoneNumber: mapValueOfType<String>(json, r'phoneNumber'),
        birthday: mapDateTime(json, r'birthday', r''),
      );
    }
    return null;
  }

  static List<UserInput> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UserInput>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UserInput.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UserInput> mapFromJson(dynamic json) {
    final map = <String, UserInput>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UserInput.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UserInput-objects as value to a dart map
  static Map<String, List<UserInput>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UserInput>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UserInput.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'email',
    'name',
    'firstName',
    'password',
    'role',
    'pronoun',
  };
}


enum UserInputRoleEnum {
  entraineur._(r'Entraineur'),
  capitaine._(r'Capitaine'),
  adhrent._(r'Adhérent'),
  visiteur._(r'Visiteur'),
  ;

  /// Instantiate a new enum with the provided value.
  const UserInputRoleEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [UserInputRoleEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static UserInputRoleEnum? fromJson(dynamic value) => UserInputRoleEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [UserInputRoleEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<UserInputRoleEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UserInputRoleEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UserInputRoleEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UserInputRoleEnum] to String,
/// and [decode] dynamic data back to [UserInputRoleEnum].
class UserInputRoleEnumTypeTransformer {
  factory UserInputRoleEnumTypeTransformer() => _instance ??= const UserInputRoleEnumTypeTransformer._();

  const UserInputRoleEnumTypeTransformer._();

  String encode(UserInputRoleEnum data) => data._value;

  /// Returns the instance of [UserInputRoleEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UserInputRoleEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is UserInputRoleEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Entraineur': return UserInputRoleEnum.entraineur;
        case r'Capitaine': return UserInputRoleEnum.capitaine;
        case r'Adhérent': return UserInputRoleEnum.adhrent;
        case r'Visiteur': return UserInputRoleEnum.visiteur;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static UserInputRoleEnumTypeTransformer? _instance;
}



enum UserInputPronounEnum {
  il._(r'Il'),
  elle._(r'Elle'),
  iel._(r'Iel'),
  autre._(r'Autre'),
  ;

  /// Instantiate a new enum with the provided value.
  const UserInputPronounEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [UserInputPronounEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static UserInputPronounEnum? fromJson(dynamic value) => UserInputPronounEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [UserInputPronounEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<UserInputPronounEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UserInputPronounEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UserInputPronounEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UserInputPronounEnum] to String,
/// and [decode] dynamic data back to [UserInputPronounEnum].
class UserInputPronounEnumTypeTransformer {
  factory UserInputPronounEnumTypeTransformer() => _instance ??= const UserInputPronounEnumTypeTransformer._();

  const UserInputPronounEnumTypeTransformer._();

  String encode(UserInputPronounEnum data) => data._value;

  /// Returns the instance of [UserInputPronounEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UserInputPronounEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is UserInputPronounEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Il': return UserInputPronounEnum.il;
        case r'Elle': return UserInputPronounEnum.elle;
        case r'Iel': return UserInputPronounEnum.iel;
        case r'Autre': return UserInputPronounEnum.autre;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static UserInputPronounEnumTypeTransformer? _instance;
}


