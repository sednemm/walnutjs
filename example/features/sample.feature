
Feature: Cucumber test

  @simple_web
  Scenario: I want see the Google Page
    Given user navigates to 'https://taniarascia.github.io/primitive/#forms'
    When user fills 'Grosa-teste2' with 'led zeppelin wikipedia'
# When user fills 'GoogleHome-SearchInput' by JS with 'jsonla'
# When user fills 'GoogleHome-SearchInput' by replacing text with 'led zeppelin wikipedia'
# When user selects in combo 'Grosa-combo' the option 'Option 2'
# When user checks the 'Grosa-checkbox'
# Then user clicks on 'Grosa-teste'