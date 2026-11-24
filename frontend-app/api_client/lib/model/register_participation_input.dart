//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class RegisterParticipationInput {
  /// Returns a new [RegisterParticipationInput] instance.
  RegisterParticipationInput({
    required this.participate,
  });

  RegisterParticipationInputParticipateEnum participate;

  @override
  bool operator ==(Object other) => identical(this, other) || other is RegisterParticipationInput &&
    other.participate == participate;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (participate.hashCode);

  @override
  String toString() => 'RegisterParticipationInput[participate=$participate]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'participate'] = this.participate;
    return json;
  }

  /// Returns a new [RegisterParticipationInput] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static RegisterParticipationInput? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'participate'), 'Required key "RegisterParticipationInput[participate]" is missing from JSON.');
        assert(json[r'participate'] != null, 'Required key "RegisterParticipationInput[participate]" has a null value in JSON.');
        return true;
      }());

      return RegisterParticipationInput(
        participate: RegisterParticipationInputParticipateEnum.fromJson(json[r'participate'])!,
      );
    }
    return null;
  }

  static List<RegisterParticipationInput> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RegisterParticipationInput>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RegisterParticipationInput.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, RegisterParticipationInput> mapFromJson(dynamic json) {
    final map = <String, RegisterParticipationInput>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = RegisterParticipationInput.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of RegisterParticipationInput-objects as value to a dart map
  static Map<String, List<RegisterParticipationInput>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<RegisterParticipationInput>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = RegisterParticipationInput.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'participate',
  };
}


enum RegisterParticipationInputParticipateEnum {
  true_._(r'true'),
  false_._(r'false'),
  ;

  /// Instantiate a new enum with the provided value.
  const RegisterParticipationInputParticipateEnum._(this._value);

  /// The underlying value of this enum member.
  final String _value;

  @override
  String toString() => _value;

  /// Encodes this enum as a value suitable for JSON.
  String toJson() => _value;

  /// Returns the instance of [RegisterParticipationInputParticipateEnum] that was successfully decoded
  /// from the passed [value] on success, null otherwise.
  static RegisterParticipationInputParticipateEnum? fromJson(dynamic value) => RegisterParticipationInputParticipateEnumTypeTransformer().decode(value);

  /// Returns a [List] containing instances of [RegisterParticipationInputParticipateEnum]
  /// that were successfully decoded from the passed [JSON][json].
  static List<RegisterParticipationInputParticipateEnum> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <RegisterParticipationInputParticipateEnum>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = RegisterParticipationInputParticipateEnum.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }
}

/// Transformation class that can [encode] an instance of [RegisterParticipationInputParticipateEnum] to String,
/// and [decode] dynamic data back to [RegisterParticipationInputParticipateEnum].
class RegisterParticipationInputParticipateEnumTypeTransformer {
  factory RegisterParticipationInputParticipateEnumTypeTransformer() => _instance ??= const RegisterParticipationInputParticipateEnumTypeTransformer._();

  const RegisterParticipationInputParticipateEnumTypeTransformer._();

  String encode(RegisterParticipationInputParticipateEnum data) => data._value;

  /// Returns the instance of [RegisterParticipationInputParticipateEnum] that was successfully decoded
  /// from the passed [data] value on success, null otherwise.
  ///
  /// If [allowNull] is true and the [dynamic value][data] cannot be decoded successfully,
  /// then null is returned. However, if [allowNull] is false and the [dynamic value][data]
  /// cannot be decoded successfully, then an [UnimplementedError] is thrown.
  ///
  /// The [allowNull] is very handy when an API changes and a new enum value is added or removed,
  /// and users are still using an old app with the old code.
  RegisterParticipationInputParticipateEnum? decode(dynamic data, {bool allowNull = true}) {
    if (data is RegisterParticipationInputParticipateEnum) {
      return data;
    }
    if (data != null) {
      switch (data) {
        case r'true': return RegisterParticipationInputParticipateEnum.true_;
        case r'false': return RegisterParticipationInputParticipateEnum.false_;
        default:
          if (!allowNull) {
            throw ArgumentError('Unknown enum value to decode: $data');
          }
      }
    }
    return null;
  }

  /// The singleton instance of this transformer.
  static RegisterParticipationInputParticipateEnumTypeTransformer? _instance;
}


