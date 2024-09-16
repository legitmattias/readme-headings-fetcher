# README Headings Fetcher

## Overview
This project contains a Node.js script that searches GitHub repositories for README files and extracts headings from the markdown content. It uses the GitHub API and requires a personal access token (PAT) for authentication.

## Features
- Searches repositories based on a given query (e.g., repositories with a specific language).
- Fetches README files from the found repositories.
- Extracts headings (H1, H2, etc.) from the markdown content of the README files.

## Usage

### Prerequisites
- [Node.js](https://nodejs.org/) (version 12 or higher)
- A [GitHub Personal Access Token (PAT)](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

### Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/legitmattias/readme-headings-fetcher.git
   cd readme-headings-fetcher
   ```

2. Install dependencies:
   ```bash
   npm install axios
   ```

3. Set your GitHub Personal Access Token:
   Edit the `GITHUB_TOKEN` variable in the script to include your token:
   ```javascript
   const GITHUB_TOKEN = 'your_github_token_here';
   ```
   It is recommended to use environment variables for storing sensitive information like the GitHub token.

### Running the Script
You can run the script directly using Node.js. The script is configured to search for repositories and extract headings from their README files.

```bash
node fetch_readme_headings.js
```

By default, the script searches for repositories that use JavaScript as the primary language and fetches the first 5 repositories. You can modify the query and the number of repositories to search within the script.

### Example Query
The default query searches for JavaScript repositories:
```javascript
const repositories = await searchRepositories('language:javascript', 5);
```
You can modify the query string to search for other languages or keywords.

## Output
For each repository, the script will:
1. Fetch the README.md content.
2. Extract headings from the README file.
3. Print the headings to the console.

Example output:
```
Processing repository: octocat/Hello-World
Headings found: [ '# Introduction', '## Setup', '## Usage', '# License' ]
--------------------------------
```

## Limitations
- The script only supports markdown-formatted README files.
- It currently retrieves a limited number of repositories (default: 5).
- The script does not handle README files in other formats, such as reStructuredText.

## Future Enhancements
- Add support for fetching more repository metadata.
- Improve error handling for repositories without README files.
- Extend functionality to support other markdown formats or file types.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.
