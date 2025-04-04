# Bazaar Mobile Apps

  

## Introduction

Welcome to the Bazaar Mobile Apps repository. This project houses the development of our mobile ecosystem using React Native, consisting of two core applications targeting different user groups:

*   **Bazaar:** The primary interface for buyers.
*   **The Shop:** The primary interface for our partners/sellers.

Both applications are developed within this monorepo to leverage shared components, utilities, and business logic, ensuring a cohesive user experience and efficient development workflow.

### Dependencies:

- **[npm](https://nodejs.org/en/download)**

- **[Backend application](https://github.com/Software-Engineering-Group-Bazaar/bazaar-backend)**


## Getting Started

  

To get this project up and running on your local machine, follow the steps from [link](https://docs.expo.dev/get-started/set-up-your-environment/)
  

### Clone the Repository

  

Clone the repository to your local machine:

  

```bash

git  clone  https://github.com/Software-Engineering-Group-Bazaar/bazaar-mobile-react-native.git

cd  bazaar-mobile-react-native
```

## Setup and Configuration

1. Open the specific app folder
2. First run `npm install` to install the required dependencies.
3. To run the project locally, use the following command: `npx expo start`

## Create and add package

1. Create package folder in packages
2. Execute following command in created package folder: `yarn init`
3. Add package in app's dependencies in package.json like this: `"package-name": "*"`
4. Execute following command: `yarn install`

## Testing
 Toplevel you can trigger tests in 
 
```bash
npx jest --watchAll
```

## Contributing
Please adhere to the [SI guidlines](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
