Feature: App Navigation
  As a user
  I want to navigate between pages
  So that I can access different sections of the assessment

  Scenario: Navigate from landing to assessment
    Given the user is on the landing page
    When the user taps "Start Assessment"
    Then the user should see the section hub page

  Scenario: Bottom navigation works
    Given the user is on any page
    When the user taps the "Home" tab
    Then the user should see the landing page
    When the user taps the "Assessment" tab
    Then the user should see the section hub page
    When the user taps the "Settings" tab
    Then the user should see the settings page

  Scenario: Back navigation works
    Given the user is on the section hub page
    When the user taps the back arrow
    Then the user should see the landing page

  Scenario: 404 page for unknown routes
    Given the user navigates to an unknown route
    Then the user should see the 404 page
    And there should be a link to go home

  Scenario: Navigation guard prevents data loss
    Given the user has unsaved changes in a form
    When the user attempts to navigate away
    Then a confirmation dialog should appear
    And the user can choose to stay or leave
