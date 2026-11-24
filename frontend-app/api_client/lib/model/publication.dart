//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of rekor_api;

class Publication {
  /// Returns a new [Publication] instance.
  Publication({
    required this.id,
    required this.titre,
    required this.summary,
    required this.corps,
    required this.date,
    required this.association,
  });

  String id;

  String titre;

  String summary;

  String corps;

  DateTime date;

  String association;

  @override
  bool operator ==(Object other) => identical(this, other) || other is Publication &&
    other.id == id &&
    other.titre == titre &&
    other.summary == summary &&
    other.corps == corps &&
    other.date == date &&
    other.association == association;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (id.hashCode) +
    (titre.hashCode) +
    (summary.hashCode) +
    (corps.hashCode) +
    (date.hashCode) +
    (association.hashCode);

  @override
  String toString() => 'Publication[id=$id, titre=$titre, summary=$summary, corps=$corps, date=$date, association=$association]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'_id'] = this.id;
      json[r'titre'] = this.titre;
      json[r'summary'] = this.summary;
      json[r'corps'] = this.corps;
      json[r'date'] = this.date.toUtc().toIso8601String();
      json[r'association'] = this.association;
    return json;
  }

  /// Returns a new [Publication] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static Publication? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'_id'), 'Required key "Publication[_id]" is missing from JSON.');
        assert(json[r'_id'] != null, 'Required key "Publication[_id]" has a null value in JSON.');
        assert(json.containsKey(r'titre'), 'Required key "Publication[titre]" is missing from JSON.');
        assert(json[r'titre'] != null, 'Required key "Publication[titre]" has a null value in JSON.');
        assert(json.containsKey(r'summary'), 'Required key "Publication[summary]" is missing from JSON.');
        assert(json[r'summary'] != null, 'Required key "Publication[summary]" has a null value in JSON.');
        assert(json.containsKey(r'corps'), 'Required key "Publication[corps]" is missing from JSON.');
        assert(json[r'corps'] != null, 'Required key "Publication[corps]" has a null value in JSON.');
        assert(json.containsKey(r'date'), 'Required key "Publication[date]" is missing from JSON.');
        assert(json[r'date'] != null, 'Required key "Publication[date]" has a null value in JSON.');
        assert(json.containsKey(r'association'), 'Required key "Publication[association]" is missing from JSON.');
        assert(json[r'association'] != null, 'Required key "Publication[association]" has a null value in JSON.');
        return true;
      }());

      return Publication(
        id: mapValueOfType<String>(json, r'_id')!,
        titre: mapValueOfType<String>(json, r'titre')!,
        summary: mapValueOfType<String>(json, r'summary')!,
        corps: mapValueOfType<String>(json, r'corps')!,
        date: mapDateTime(json, r'date', r'')!,
        association: mapValueOfType<String>(json, r'association')!,
      );
    }
    return null;
  }

  static List<Publication> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <Publication>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = Publication.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, Publication> mapFromJson(dynamic json) {
    final map = <String, Publication>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = Publication.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of Publication-objects as value to a dart map
  static Map<String, List<Publication>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<Publication>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = Publication.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    '_id',
    'titre',
    'summary',
    'corps',
    'date',
    'association',
  };
}

