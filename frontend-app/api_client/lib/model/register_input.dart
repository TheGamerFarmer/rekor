//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class RegisterInput {
  /// Returns a new [RegisterInput] instance.
  RegisterInput({
    required this.name,
    required this.firstName,
    required this.email,
    required this.password,
    required this.pronoun,
    this.phoneNumber,
    this.birthday,
  });

  String name;

  String firstName;

  String email;

  String password;

  RegisterInputPronounEnum pronoun;

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
  bool operator ==(Object other) => identical(this, other) || other is RegisterInput &&
    other.name == name &&
    other.firstName == firstName &&
    other.email == email &&
    other.password == password &&
    other.pronoun == pronoun &&
    other.phoneNumber == phoneNumber &&
    other.birthday == birthday;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name.hashCode) +
    (firstName.hashCode) +
    (email.hashCode) +
    (password.hashCode) +
    (pronoun.hashCode) +
    (phoneNumber == null ? 0 : phoneNumber!.hashCode) +
    (birthday == null ? 0 : birthday!.hashCode);

  @override
  String toString() => 'RegisterInput[name=$name, firstName=$firstName, email=$email, password=$password, pronoun=$pronoun, phoneNumber=$phoneNumber, birthday=$birthday]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'name'] = this.name;
      json[r'firstName'] = this.firstName;
      json[r'email'] = this.email;
      json[r'password'] = this.password;
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

  /// Returns a new [RegisterInput] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static RegisterInput? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'name'), 'Required key "RegisterInput[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "RegisterInput[name]" has a null value in JSON.');
        assert(json.containsKey(r'firstName'), 'Required key "RegisterInput[firstName]" is missing from JSON.');
        assert(json[r'firstName'] != null, 'Required key "RegisterInput[firstName]" has a null value in JSON.');
        assert(json.containsKey(r'email'), 'Required key "RegisterInput[email]" is missing from JSON.');
        assert(json[r'email'] != null, 'Required key "RegisterInput[email]" has a null value in JSON.');
        assert(json.containsKey(r'password'), 'Required key "RegisterInput[password]" is missing from JSON.');
        assert(json[r'password'] != null, 'Required key "RegisterInput[password]" has a null value in JSON.');
        assert(json.containsKey(r'pronoun'), 'Required key "RegisterInput[pronoun]" is missing from JSON.');
        assert(json[r'pronoun'] != null, 'Required key "RegisterInput[pronoun]" has a null value in JSON.');
        return true;
      }());

      return RegisterInput(
        name: mapValueOfType<String>(json, r'name')!,
        firstName: mapValueOfType<String>(json, r'firstName')!,
        email: mapValueOfType<String>(json, r'email')!,
        password: mapValueOfType<String>(json, r'password')!,
        pronoun: RegisterInputPronounEnum.fromJson(json[r'pronoun'])!,
        phoneNumber: mapValueOfType<String>(json, r'phoneNumber'),
        birthday: mapDateTime(json, r'birthday', r''),
      );
    }
    return null;
  }

  static List<RegisterInput> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RegisterInput>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RegisterInput.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, RegisterInput> mapFromJson(dynamic json) {
    final map = <String, RegisterInput>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = RegisterInput.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of RegisterInput-objects as value to a dart map
  static Map<String, List<RegisterInput>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<RegisterInput>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = RegisterInput.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'name',
    'firstName',
    'email',
    'password',
    'pronoun',
  };
}


enum RegisterInputPronounEnum {
  il._(r'Il'),
  elle._(r'Elle'),
  iel._(r'Iel'),
  autre._(r'Autre'),
  ;

  /// Instantiate a new enum with the provided value.
  const RegisterInputPronounEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [RegisterInputPronounEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static RegisterInputPronounEnum? fromJson(dynamic value) => RegisterInputPronounEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [RegisterInputPronounEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<RegisterInputPronounEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RegisterInputPronounEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RegisterInputPronounEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [RegisterInputPronounEnum] to String,
/// and [decode] dynamic data back to [RegisterInputPronounEnum].
class RegisterInputPronounEnumTypeTransformer {
  factory RegisterInputPronounEnumTypeTransformer() => _instance ??= const RegisterInputPronounEnumTypeTransformer._();

  const RegisterInputPronounEnumTypeTransformer._();

  String encode(RegisterInputPronounEnum data) => data._value;

  /// Returns the instance of [RegisterInputPronounEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  RegisterInputPronounEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is RegisterInputPronounEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Il': return RegisterInputPronounEnum.il;
        case r'Elle': return RegisterInputPronounEnum.elle;
        case r'Iel': return RegisterInputPronounEnum.iel;
        case r'Autre': return RegisterInputPronounEnum.autre;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static RegisterInputPronounEnumTypeTransformer? _instance;
}


