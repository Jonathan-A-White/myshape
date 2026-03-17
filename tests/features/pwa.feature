Feature: Progressive Web App
  As a user
  I want to use MySHAPE as a PWA
  So that I can access it offline and install it on my device

  Scenario: App loads successfully
    Given the user navigates to the app
    When the page finishes loading
    Then the app shell should be visible
    And the bottom navigation should display three tabs

  Scenario: Service worker registers
    Given the user navigates to the app
    When the page finishes loading
    Then the service worker should be registered
    And assets should be cached for offline use

  Scenario: App works offline
    Given the user has previously loaded the app
    And the service worker has cached all assets
    When the network connection is lost
    Then the app should still be functional
    And previously loaded pages should be accessible

  Scenario: App is installable
    Given the user navigates to the app on a supported browser
    When the PWA install criteria are met
    Then the browser should offer to install the app
