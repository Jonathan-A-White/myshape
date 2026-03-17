Feature: Dark Mode
  As a user
  I want to toggle dark mode
  So that I can use the app comfortably in low-light environments

  Scenario: Default theme based on system preference
    Given the user has not set a theme preference
    When the app loads
    Then the theme should match the system preference

  Scenario: Toggle dark mode on
    Given the app is in light mode
    When the user enables dark mode
    Then the app should display in dark mode
    And the "dark" class should be on the html element
    And the preference should be saved to localStorage

  Scenario: Toggle dark mode off
    Given the app is in dark mode
    When the user disables dark mode
    Then the app should display in light mode
    And the "dark" class should be removed from the html element
    And the preference should be saved to localStorage

  Scenario: Theme persists across sessions
    Given the user has set dark mode
    When the user closes and reopens the app
    Then dark mode should still be active
