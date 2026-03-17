Feature: Export and Import Data
  As a user
  I want to export and import my assessment data
  So that I can back up my progress and transfer it between devices

  Scenario: Export all assessments
    Given the user has completed assessments
    When the user taps "Export All Data"
    Then a JSON file should be downloaded
    And the file should contain all assessments in the export envelope format

  Scenario: Export a single assessment
    Given the user has a completed assessment
    When the user exports that specific assessment
    Then a JSON file should be downloaded
    And the file type should be "single"

  Scenario: Import valid data
    Given the user has an exported JSON file
    When the user imports the file
    Then the assessments should be added to the database
    And a success toast should appear

  Scenario: Import invalid data
    Given the user has an invalid JSON file
    When the user attempts to import the file
    Then an error toast should appear
    And no data should be modified

  Scenario: Export envelope format
    Given an assessment is exported
    Then the JSON should include appName "MySHAPE"
    And the JSON should include a version number
    And the JSON should include an exportedAt timestamp
    And the JSON should include the assessments array
