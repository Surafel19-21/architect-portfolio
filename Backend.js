/* ============================================
   BACKEND SERVER FOR ARCHITECT PORTFOLIO
   ============================================
   
   This is a Node.js backend server that:
   1. Keeps your Cloudinary API Key SECRET
   2. Handles image fetching from Cloudinary
   3. Serves the frontend files
   4. Provides API endpoints for the portfolio
   
   Line-by-line explanation below!
*/

/* ============================================
   IMPORT REQUIRED LIBRARIES
   ============================================
   
   require() loads external libraries/modules.
   These must be installed via npm first.
*/

const express = require('express');
/* Express = lightweight web framework for Node.js
   Handles HTTP requests and routing */

const cors = require('cors');
/* CORS = Cross-Origin Resource Sharing
   Allows frontend to make requests to this backend */

const axios = require('axios');
/* Axios = library for making HTTP requests
   We use it to call Cloudinary API */

const path = require('path');
/* Path = Node.js module for handling file paths */

/* ============================================
   CREATE EXPRESS APP
   ============================================
*/

const app = express();
/* app is the main Express application object
   We'll add routes and middleware to it */

/* ============================================
   MIDDLEWARE SETUP
   ============================================
   
   Middleware = functions that process requests
   before they reach the route handlers.
*/

app.use(cors());
/* Enable CORS - allows cross-origin requests */

app.use(express.json());
/* Parse incoming JSON data from requests */

app.use(express.static(path.join(__dirname, './')));
/* Serve static files (HTML, CSS, JS) from current directory
   __dirname = current directory path
   This allows browser to load index.html, etc. */

/* ============================================
   CLOUDINARY CONFIGURATION
   ============================================
   
   ⚠️  REPLACE WITH YOUR ACTUAL CREDENTIALS
   This is where API key is SAFE (only on server)
*/

const CLOUDINARY_CLOUD_NAME = 'your-cloud-name';
/* Replace 'your-cloud-name' with your actual Cloud Name */

const CLOUDINARY_API_KEY = 'your-api-key';
/* Replace 'your-api-key' with your actual API Key */

const CLOUDINARY_API_SECRET = 'your-api-secret';
/* Replace 'your-api-secret' with your actual API Secret
   Get this from Cloudinary Dashboard > Settings > API Keys */

const CLOUDINARY_FOLDER = 'architect-portfolio';

/* ============================================
   API ENDPOINT: GET PROJECTS
   ============================================
   
   When browser visits: http://localhost:3000/api/projects
   This function runs and returns the list of images.
   
   app.get() means this responds to GET requests.
   '/api/projects' is the URL path.
   (req, res) => {...} is the function that handles it.
*/

app.get('/api/projects', async (req, res) => {
    /* async = this function can wait for responses */
    
    try {
        /* try/catch = error handling
           If something fails, catch will handle it */
        
        console.log('Fetching projects from Cloudinary...');
        
        /* Call Cloudinary's Search API */
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/search`,
            {
                expression: `folder:${CLOUDINARY_FOLDER}`,
                /* Find all images in architect-portfolio folder */
                
                sort_by: [['uploaded_at', 'desc']],
                /* Sort by upload date (newest first) */
                
                max_results: 100,
                /* Get up to 100 images */
            },
            {
                auth: {
                    username: CLOUDINARY_API_KEY,
                    /* API Key is username */
                    
                    password: CLOUDINARY_API_SECRET,
                    /* API Secret is password */
                }
            }
        );

        /* Extract image data from response */
        const projects = response.data.resources.map((resource) => ({
            id: resource.public_id,
            /* Unique identifier for the image */
            
            url: resource.secure_url,
            /* HTTPS URL to the image */
            
            width: resource.width,
            /* Image width in pixels */
            
            height: resource.height,
            /* Image height in pixels */
        }));

        /* Send success response back to frontend */
        res.json({
            success: true,
            /* success flag tells frontend it worked */
            
            data: projects,
            /* The actual image list */
            
            count: projects.length,
            /* How many images */
        });

        console.log(`✅ Found ${projects.length} projects`);

    } catch (error) {
        /* If something goes wrong, catch it here */
        
        console.error('Error fetching projects:', error.message);
        
        /* Send error response back to frontend */
        res.status(500).json({
            success: false,
            /* false = request failed */
            
            error: 'Failed to fetch projects',
            /* Error message */
        });
    }
});

/* ============================================
   API ENDPOINT: UPLOAD PROJECT
   ============================================
   
   When browser sends image data to: POST /api/upload
   This function processes the upload.
*/

app.post('/api/upload', async (req, res) => {
    try {
        console.log('Upload request received');
        
        /* In a real app, you would:
           1. Receive file from frontend
           2. Save it temporarily
           3. Upload to Cloudinary
           4. Delete temporary file
           
           For now, we'll just return success message.
        */
        
        res.json({
            success: true,
            message: 'Upload processed via backend',
        });

    } catch (error) {
        console.error('Error uploading:', error);
        res.status(500).json({
            success: false,
            error: 'Upload failed',
        });
    }
});

/* ============================================
   HEALTH CHECK ENDPOINT
   ============================================
   
   Simple endpoint to check if server is running.
   Visit: http://localhost:3000/health
*/

app.get('/health', (req, res) => {
    res.json({ status: 'Server is running ✅' });
});

/* ============================================
   CATCH-ALL ROUTE
   ============================================
   
   If no route matches, serve index.html
   (for single-page app routing)
*/

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'));
});

/* ============================================
   START THE SERVER
   ============================================
   
   Listen on port 3000 (localhost:3000)
   When you see "Server running..." = it's ready!
*/

const PORT = process.env.PORT || 3000;
/* Use environment variable PORT if set, otherwise 3000 */

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║  Server Running! 🚀                    ║
    ║  URL: http://localhost:${PORT}              ║
    ║  Portfolio: http://localhost:${PORT}        ║
    ║  Admin: http://localhost:${PORT}/admin-login.html ║
    ╚════════════════════════════════════════╝
    `);
});

/* ============================================
   EXPORTS (for other files to use)
   ============================================
*/

module.exports = app;
