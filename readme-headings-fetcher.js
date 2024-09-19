const axios = require('axios')

// GitHub API credentials (replace with your personal access token)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

// Base URL for GitHub API
const GITHUB_API_URL = process.env.GITHUB_API_URL

// Axios instance with authentication headers
const axiosInstance = axios.create({
  baseURL: GITHUB_API_URL,
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  }
})

// Function to search for repositories with README.md
async function searchRepositories (query, perPage = 10) {
  try {
    const response = await axiosInstance.get(`/search/repositories`, {
      params: {
        q: query, // Query (e.g., "language:javascript")
        per_page: perPage
      }
    })
    return response.data.items // Return repository items
  } catch (error) {
    console.error('Error fetching repositories:', error.response?.data || error.message)
    return []
  }
}

// Function to get README.md for a given repository
async function getReadme (owner, repo) {
  try {
    const response = await axiosInstance.get(`/repos/${owner}/${repo}/readme`, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' } // Get raw content
    })
    return response.data // Return README content
  } catch (error) {
    console.error(`Error fetching README for ${owner}/${repo}:`, error.response?.data || error.message)
    return null
  }
}

// Function to extract all headings from the markdown content
function extractHeadings(markdownText) {
  const headings = [];
  const lines = markdownText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Detect headings (Markdown heading levels start with '#')
    if (line.startsWith('#')) {
      headings.push(line);
    }
  }

  return headings;
}

// Function to extract the description that follows the main heading
// Function to extract the description that follows the main heading
function extractMainHeadingDescription(markdownText) {
  const lines = markdownText.split('\n');
  let foundMainHeading = false;
  let foundBlankLine = false;
  let description = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect the main heading (first # heading)
    if (line.startsWith('# ') && !foundMainHeading) {
      foundMainHeading = true;
      continue;
    }

    // Capture text after a blank line that follows the main heading
    if (foundMainHeading && !foundBlankLine && line === '') {
      foundBlankLine = true;  // Now start capturing description on the next non-blank line
      continue;
    }

    if (foundBlankLine && line !== '') {
      description += line + ' ';
    }

    // Stop collecting description when you hit another heading or a blank line
    if (foundBlankLine && (line.startsWith('#') || line === '')) {
      break;  // Stop capturing description
    }
  }

  if (!foundMainHeading) {
    return 'No main heading found';
  }

  return description.trim() || 'No description under main heading found';
}

// Main function to search repositories and extract README headings
async function main() {
  const repositories = await searchRepositories('language:javascript', 25); // Adjust perPage as needed

  for (let repo of repositories) {
    const owner = repo.owner.login;
    const repoName = repo.name;

    console.log(`Processing repository: ${owner}/${repoName}`);

    const readmeContent = await getReadme(owner, repoName);

    if (readmeContent) {
      // Extract headings and description separately
      const headings = extractHeadings(readmeContent);
      const description = extractMainHeadingDescription(readmeContent);

      console.log('Description:', description);
      console.log('Headings found:', headings);
    } else {
      console.log('No README found for this repository.');
    }

    console.log('--------------------------------');
  }
}

// Execute the main function
main()
