//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class UpdateProfileInput {
  /// Returns a new [UpdateProfileInput] instance.
  UpdateProfileInput({
    this.name,
    this.firstName,
    this.phoneNumber,
    this.birthday,
    this.pronoun,
  });

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
  String? firstName;

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

  UpdateProfileInputPronounEnum? pronoun;

  @override
  bool operator ==(Object other) => identical(this, other) || other is UpdateProfileInput &&
    other.name == name &&
    other.firstName == firstName &&
    other.phoneNumber == phoneNumber &&
    other.birthday == birthday &&
    other.pronoun == pronoun;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (name == null ? 0 : name!.hashCode) +
    (firstName == null ? 0 : firstName!.hashCode) +
    (phoneNumber == null ? 0 : phoneNumber!.hashCode) +
    (birthday == null ? 0 : birthday!.hashCode) +
    (pronoun == null ? 0 : pronoun!.hashCode);

  @override
  String toString() => 'UpdateProfileInput[name=$name, firstName=$firstName, phoneNumber=$phoneNumber, birthday=$birthday, pronoun=$pronoun]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
    if (this.name != null) {
      json[r'name'] = this.name;
    } else {
      json[r'name'] = null;
    }
    if (this.firstName != null) {
      json[r'firstName'] = this.firstName;
    } else {
      json[r'firstName'] = null;
    }
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
    if (this.pronoun != null) {
      json[r'pronoun'] = this.pronoun;
    } else {
      json[r'pronoun'] = null;
    }
    return json;
  }

  /// Returns a new [UpdateProfileInput] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static UpdateProfileInput? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        return true;
      }());

      return UpdateProfileInput(
        name: mapValueOfType<String>(json, r'name'),
        firstName: mapValueOfType<String>(json, r'firstName'),
        phoneNumber: mapValueOfType<String>(json, r'phoneNumber'),
        birthday: mapDateTime(json, r'birthday', r''),
        pronoun: UpdateProfileInputPronounEnum.fromJson(json[r'pronoun']),
      );
    }
    return null;
  }

  static List<UpdateProfileInput> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateProfileInput>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateProfileInput.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, UpdateProfileInput> mapFromJson(dynamic json) {
    final map = <String, UpdateProfileInput>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = UpdateProfileInput.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of UpdateProfileInput-objects as value to a dart map
  static Map<String, List<UpdateProfileInput>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<UpdateProfileInput>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = UpdateProfileInput.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
  };
}


enum UpdateProfileInputPronounEnum {
  il._(r'Il'),
  elle._(r'Elle'),
  iel._(r'Iel'),
  autre._(r'Autre'),
  ;

  /// Instantiate a new enum with the provided value.
  const UpdateProfileInputPronounEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [UpdateProfileInputPronounEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static UpdateProfileInputPronounEnum? fromJson(dynamic value) => UpdateProfileInputPronounEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [UpdateProfileInputPronounEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<UpdateProfileInputPronounEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <UpdateProfileInputPronounEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = UpdateProfileInputPronounEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [UpdateProfileInputPronounEnum] to String,
/// and [decode] dynamic data back to [UpdateProfileInputPronounEnum].
class UpdateProfileInputPronounEnumTypeTransformer {
  factory UpdateProfileInputPronounEnumTypeTransformer() => _instance ??= const UpdateProfileInputPronounEnumTypeTransformer._();

  const UpdateProfileInputPronounEnumTypeTransformer._();

  String encode(UpdateProfileInputPronounEnum data) => data._value;

  /// Returns the instance of [UpdateProfileInputPronounEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  UpdateProfileInputPronounEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is UpdateProfileInputPronounEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'Il': return UpdateProfileInputPronounEnum.il;
        case r'Elle': return UpdateProfileInputPronounEnum.elle;
        case r'Iel': return UpdateProfileInputPronounEnum.iel;
        case r'Autre': return UpdateProfileInputPronounEnum.autre;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static UpdateProfileInputPronounEnumTypeTransformer? _instance;
}


