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

// Function to search for repositories with README.md (handling pagination)
async function searchRepositories(query, perPage = 10, maxPages = 3) {
  let allRepositories = [];
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      const response = await axiosInstance.get(`/search/repositories`, {
        params: {
          q: query,       // Query (e.g., "language:javascript")
          per_page: perPage,
          page: page      // Fetch the next page of results
        }
      });

      allRepositories = allRepositories.concat(response.data.items); // Collect all repositories

      // Check if there are no more results (e.g., if less than perPage results were returned)
      if (response.data.items.length < perPage) {
        break;  // Stop fetching pages if there are no more results
      }

    } catch (error) {
      console.error('Error fetching repositories:', error.response?.data || error.message);
      break;  // Exit the loop if there’s an error
    }
  }

  return allRepositories;
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

async function checkRateLimit() {
  const response = await axiosInstance.get('/rate_limit')
  return response.data.rate
}

// Main function to search repositories and extract README headings
async function main() {
  const repositories = await searchRepositories('language:javascript', 5, 3);  // Query, READMEs per page (max: 100), pages.
  console.log('Rate limit status after current query: ', checkRateLimit())

  for (let repo of repositories) {
    const owner = repo.owner.login;
    const repoName = repo.name;

    console.log(`Processing repository: ${owner}/${repoName}`);

    const readmeContent = await getReadme(owner, repoName);

    if (readmeContent) {
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
