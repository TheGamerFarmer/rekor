//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class LoginUser {
  /// Returns a new [LoginUser] instance.
  LoginUser({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
  });

  String id;

  String email;

  String name;

  LoginUserRoleEnum role;

  @override
  bool operator ==(Object other) => identical(this, other) || other is LoginUser &&
    other.id == id &&
    other.email == email &&
    other.name == name &&
    other.role == role;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (email.hashCode) +
    (name.hashCode) +
    (role.hashCode);

  @override
  String toString() => 'LoginUser[id=$id, email=$email, name=$name, role=$role]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'id'] = this.id;
      json[r'email'] = this.email;
      json[r'name'] = this.name;
      json[r'role'] = this.role;
    return json;
  }

  /// Returns a new [LoginUser] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static LoginUser? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'id'), 'Required key "LoginUser[id]" is missing from JSON.');
        assert(json[r'id'] != null, 'Required key "LoginUser[id]" has a null value in JSON.');
        assert(json.containsKey(r'email'), 'Required key "LoginUser[email]" is missing from JSON.');
        assert(json[r'email'] != null, 'Required key "LoginUser[email]" has a null value in JSON.');
        assert(json.containsKey(r'name'), 'Required key "LoginUser[name]" is missing from JSON.');
        assert(json[r'name'] != null, 'Required key "LoginUser[name]" has a null value in JSON.');
        assert(json.containsKey(r'role'), 'Required key "LoginUser[role]" is missing from JSON.');
        assert(json[r'role'] != null, 'Required key "LoginUser[role]" has a null value in JSON.');
        return true;
      }());

      return LoginUser(
        id: mapValueOfType<String>(json, r'id')!,
        email: mapValueOfType<String>(json, r'email')!,
        name: mapValueOfType<String>(json, r'name')!,
        role: LoginUserRoleEnum.fromJson(json[r'role'])!,
      );
    }
    return null;
  }

  static List<LoginUser> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LoginUser>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LoginUser.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, LoginUser> mapFromJson(dynamic json) {
    final map = <String, LoginUser>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = LoginUser.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of LoginUser-objects as value to a dart map
  static Map<String, List<LoginUser>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<LoginUser>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = LoginUser.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'id',
    'email',
    'name',
    'role',
  };
}


enum LoginUserRoleEnum {
  entraineur._(r'Entraineur'),
  capitaine._(r'Capitaine'),
  adhrent._(r'Adhérent'),
  visiteur._(r'Visiteur'),
  ;

  /// Instantiate a new enum with the provided value.
  const LoginUserRoleEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [LoginUserRoleEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static LoginUserRoleEnum? fromJson(dynamic value) => LoginUserRoleEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [LoginUserRoleEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<LoginUserRoleEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <LoginUserRoleEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = LoginUserRoleEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [LoginUserRoleEnum] to String,
/// and [decode] dynamic data back to [LoginUserRoleEnum].
class LoginUserRoleEnumTypeTransformer {
  factory LoginUserRoleEnumTypeTransformer() => _instance ??= const LoginUserRoleEnumTypeTransformer._();

  const LoginUserRoleEnumTypeTransformer._();

  String encode(LoginUserRoleEnum data) => data._value;

  /// Returns the instance of [LoginUserRoleEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  LoginUserRoleEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is LoginUserRoleEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Entraineur': return LoginUserRoleEnum.entraineur;
        case r'Capitaine': return LoginUserRoleEnum.capitaine;
        case r'Adhérent': return LoginUserRoleEnum.adhrent;
        case r'Visiteur': return LoginUserRoleEnum.visiteur;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static LoginUserRoleEnumTypeTransformer? _instance;
}


