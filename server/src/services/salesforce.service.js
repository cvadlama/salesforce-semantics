const { conn, SF_USERNAME, SF_PASSWORD, AUTH_MODE, SF_OAUTH_INSTANCE_URL } = require('../config/database');

class SalesforceService {
  async login() {
    // If using OAuth with valid access token, no need to explicitly login
    if (AUTH_MODE === 'oauth') {
      // OAuth connection should already be authenticated
      return Promise.resolve();
    }
    
    // Username-password login
    return conn.login(SF_USERNAME, SF_PASSWORD);
  }

  async describeSObject(sobjectName) {
    await this.login();
    return conn.sobject(sobjectName).describe();
  }

  async getSharingModel(sobjectName) {
    await this.login();
    
    try {
      // Use metadata API to get organization-wide defaults
      const result = await conn.metadata.read('CustomObject', sobjectName);
      
      return {
        sharingModel: result.sharingModel || 'Unknown',
        defaultRecordAccess: result.sharingModel === 'Private' ? 'None' : result.sharingModel
      };
    } catch (error) {
      console.error('Error fetching sharing settings:', error);
      // If it's not a custom object, try standard object metadata
      try {
        const standardResult = await conn.metadata.read('CustomObject', sobjectName);
        return {
          sharingModel: standardResult.sharingModel || 'Unknown',
          defaultRecordAccess: standardResult.sharingModel === 'Private' ? 'None' : standardResult.sharingModel
        };
      } catch (standardError) {
        console.error('Error fetching standard object sharing settings:', standardError);
        return {
          sharingModel: 'Unknown',
          defaultRecordAccess: 'Unknown'
        };
      }
    }    
  }
  
  explainSharingModel(model) {
    switch (model) {
      case 'Private':
        return 'Records are visible only to the owner and users above them in the role hierarchy. Others need sharing rules or manual sharing to access records.';
      case 'Read':
        return 'Records are visible to all users, but only the owner and users above them in the role hierarchy can edit them.';
      case 'ReadWrite':
        return 'Records are visible and editable by all users.';
      case 'ControlledByParent':
        return 'Access to records is controlled by the parent object sharing settings.';
      case 'PublicReadOnly':
        return 'All users can view records, but only the owner and users above them in the role hierarchy can edit them.';
      case 'PublicReadWrite':
        return 'All users can view and edit records.';
      default:
        return `Sharing model is ${model}.`;
    }
  }
}

module.exports = new SalesforceService();
