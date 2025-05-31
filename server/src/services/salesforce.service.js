const { conn, SF_USERNAME, SF_PASSWORD } = require('../config/database');

class SalesforceService {
  async login() {
    return conn.login(SF_USERNAME, SF_PASSWORD);
  }

  async describeSObject(sobjectName) {
    await this.login();
    const result = await conn.sobject(sobjectName).describe();
    // Ensure we get the sharing model from the correct location
    result.sharingModel = result.sharingModel || 
                         (result.defaultRecordTypeInfo && result.defaultRecordTypeInfo.sharingModel) || 
                         'Unknown';
    return result;
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
