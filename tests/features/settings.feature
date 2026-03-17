Feature: Settings Page
  As a user
  I want to manage app settings
  So that I can customize my experience

  Scenario: View settings page
    Given the user navigates to the settings page
    Then the user should see the dark mode toggle
    And the user should see the data management section
    And the user should see the about section

  Scenario: Toggle dark mode from settings
    Given the user is on the settings page
    And dark mode is off
    When the user toggles the dark mode switch
    Then dark mode should be enabled
    And the preference should be persisted
