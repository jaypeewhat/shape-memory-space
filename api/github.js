export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Get environment variables (set these in Vercel dashboard)
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
    const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;

    if (!GITHUB_TOKEN || !GITHUB_USERNAME || !GITHUB_REPOSITORY) {
      return res.status(500).json({ 
        error: 'Missing environment variables. Please configure GITHUB_TOKEN, GITHUB_USERNAME, and GITHUB_REPOSITORY in Vercel dashboard.' 
      });
    }

    const { method, body } = req;

    if (method === 'GET') {
      // List files in repository
      const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/contents`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const files = await response.json();
      res.status(200).json(files);

    } else if (method === 'POST') {
      // Upload file to repository
      const { path, content, message } = body;

      if (!path || !content) {
        return res.status(400).json({ error: 'Missing path or content' });
      }

      const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message || `Add ${path}`,
          content: content, // Already base64 encoded
          branch: 'main'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`GitHub API error: ${response.status} - ${error.message}`);
      }

      const result = await response.json();
      res.status(200).json(result);

    } else if (method === 'DELETE') {
      // Delete file from repository
      const { path, message } = body;

      if (!path) {
        return res.status(400).json({ error: 'Missing path' });
      }

      // First get the file to get its SHA
      const getResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/contents/${path}`, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!getResponse.ok) {
        return res.status(404).json({ error: 'File not found' });
      }

      const fileData = await getResponse.json();
      
      // Delete the file
      const deleteResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}/contents/${path}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message || `Delete ${path}`,
          sha: fileData.sha,
          branch: 'main'
        })
      });

      if (!deleteResponse.ok) {
        const error = await deleteResponse.json();
        throw new Error(`GitHub API error: ${deleteResponse.status} - ${error.message}`);
      }

      const result = await deleteResponse.json();
      res.status(200).json(result);

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
