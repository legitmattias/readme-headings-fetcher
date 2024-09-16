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

// Function to extract headings from Markdown content
function extractHeadings (markdownText) {
  const headings = []
  const lines = markdownText.split('\n')

  for (let line of lines) {
    if (line.startsWith('#')) {
      headings.push(line.trim()) // Collect Markdown headings
    }
  }

  return headings
}

// Main function to search repositories and extract README headings
async function main () {
  // Search for repositories (e.g., in JavaScript language)
  const repositories = await searchRepositories('language:javascript', 5) // Adjust perPage as needed

  // Loop through each repository and get README headings
  for (let repo of repositories) {
    const owner = repo.owner.login
    const repoName = repo.name

    console.log(`Processing repository: ${owner}/${repoName}`)

    // Get the README content
    const readmeContent = await getReadme(owner, repoName)

    if (readmeContent) {
      // Extract headings from the README
      const headings = extractHeadings(readmeContent)
      console.log('Headings found:', headings)
    } else {
      console.log('No README found for this repository.')
    }

    console.log('--------------------------------')
  }
}

// Execute the main function
main()
