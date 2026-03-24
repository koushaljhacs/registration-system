function generateUsername(name, email) {
    // Take first part of name or email
    let base = name ? name.split(' ')[0].toLowerCase() : email.split('@')[0].toLowerCase();
    
    // Remove special characters
    base = base.replace(/[^a-z0-9]/g, '');
    
    // Add timestamp for uniqueness
    const timestamp = Date.now().toString().slice(-6);
    
    // Generate username
    const username = `${base}${timestamp}`;
    
    return username;
  }
  
  module.exports = generateUsername;