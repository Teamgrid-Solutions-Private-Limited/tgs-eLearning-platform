const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const xml2js = require('xml2js');

/**
 * Extract a SCORM package to a target directory
 * @param {string} zipFilePath - Path to the zip file
 * @param {string} extractDir - Directory to extract to
 * @returns {Promise<string>} - Path to the extracted directory
 */
exports.extractScormPackage = async (zipFilePath, extractDir) => {
  return new Promise((resolve, reject) => {
    try {
      const zip = new AdmZip(zipFilePath);
      
      // Create target directory if it doesn't exist
      if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true });
      }
      
      // Extract the zip file
      zip.extractAllTo(extractDir, true);
      
      resolve(extractDir);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Parse the imsmanifest.xml file from a SCORM package
 * @param {string} extractedDir - Path to the extracted SCORM package
 * @returns {Promise<Object>} - Parsed manifest data
 */
exports.parseManifest = async (extractedDir) => {
  return new Promise((resolve, reject) => {
    try {
      const manifestPath = path.join(extractedDir, 'imsmanifest.xml');
      
      if (!fs.existsSync(manifestPath)) {
        return reject(new Error('imsmanifest.xml not found. This might not be a valid SCORM package.'));
      }
      
      const manifestXml = fs.readFileSync(manifestPath, 'utf8');
      const parser = new xml2js.Parser({ explicitArray: false });
      
      parser.parseString(manifestXml, (err, result) => {
        if (err) {
          return reject(err);
        }
        
        resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get SCORM version from manifest
 * @param {Object} manifest - Parsed manifest data
 * @returns {string} - SCORM version ('1.2' or '2004')
 */
exports.getScormVersion = (manifest) => {
  try {
    // Look for SCORM 2004 schema
    if (manifest.manifest && manifest.manifest.$) {
      const xmlns = manifest.manifest.$['xmlns'];
      if (xmlns && xmlns.includes('adlcp_v1p3')) {
        return '2004';
      }
    }
    
    // Default to SCORM 1.2
    return '1.2';
  } catch (error) {
    console.error('Error detecting SCORM version:', error);
    return '1.2'; // Default to 1.2 if detection fails
  }
};

/**
 * Get the launch URL for the SCORM package
 * @param {Object} manifest - Parsed manifest data
 * @returns {string} - Launch URL
 */
exports.getLaunchUrl = (manifest) => {
  try {
    let launchUrl = '';
    
    // Try to find the resource with href or adlcp:launch
    if (manifest.manifest && manifest.manifest.resources && manifest.manifest.resources.resource) {
      const resources = Array.isArray(manifest.manifest.resources.resource) 
        ? manifest.manifest.resources.resource 
        : [manifest.manifest.resources.resource];
      
      // Look for the resource with identifier referenced in organizations
      let resourceId = '';
      
      if (manifest.manifest.organizations && manifest.manifest.organizations.organization) {
        const org = Array.isArray(manifest.manifest.organizations.organization)
          ? manifest.manifest.organizations.organization[0]
          : manifest.manifest.organizations.organization;
          
        if (org.item && org.item.$ && org.item.$.identifierref) {
          resourceId = org.item.$.identifierref;
        }
      }
      
      // Find the matching resource
      for (const resource of resources) {
        if (resourceId && resource.$ && resource.$.identifier === resourceId) {
          launchUrl = resource.$.href || '';
          break;
        }
        
        // Check for SCORM 1.2 launch attribute
        if (resource.$ && resource.$['adlcp:scormtype'] === 'sco' && resource.$.href) {
          launchUrl = resource.$.href;
          break;
        }
        
        // Check for SCORM 2004 launch attribute
        if (resource.$ && resource.$['adlcp:scormType'] === 'sco' && resource.$.href) {
          launchUrl = resource.$.href;
          break;
        }
      }
    }
    
    return launchUrl;
  } catch (error) {
    console.error('Error getting launch URL:', error);
    return '';
  }
}; 