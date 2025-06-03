# SCORM Learning Platform

A comprehensive platform for building, uploading, and managing SCORM (Sharable Content Object Reference Model) packages for e-learning.

## Features

- **SCORM Package Management**: Upload, view, and delete SCORM packages
- **SCORM Player**: Play SCORM 1.2 and SCORM 2004 packages with progress tracking
- **Content Builder**: Advanced drag-and-drop authoring tool for creating interactive SCORM courses
- **Progress Tracking**: Track user progress and completion status

## Technology Stack

- **Frontend**: React, Vite, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **SCORM Utilities**: JSZip, File-Saver, xml2js, adm-zip

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (running locally or remote connection)

### Setup

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/scorm-platform.git
   cd scorm-platform
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a directory for SCORM packages in the server:

   ```
   mkdir -p server/scorm-packages
   ```

4. Start MongoDB (if running locally):
   ```
   mongod --dbpath=/path/to/data/db
   ```

### Running the Application

1. Start the backend server:

   ```
   node server/index.js
   ```

2. In a separate terminal, start the frontend development server:

   ```
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Usage

### Uploading SCORM Packages

1. Navigate to the "Upload SCORM" page
2. Select a SCORM package (.zip file)
3. Enter title, description, and select SCORM version
4. Click "Upload SCORM Package"

### Playing SCORM Content

1. On the "My Courses" page, find the course you want to take
2. Click the "Launch" button to start the course
3. Complete the course to update your progress

### Building a SCORM Package with Content Builder

1. Navigate to the "Content Builder" page
2. Create your course structure with modules and interactive elements
3. Use the drag-and-drop interface to add text, images, videos, quizzes, and more
4. Configure course settings and preview your content
5. Click "Publish SCORM" to download the package
6. The package can be used in any SCORM-compliant LMS

## SCORM Versions Support

- SCORM 1.2 (most widely supported)
- SCORM 2004 (limited support)

## License

MIT License
