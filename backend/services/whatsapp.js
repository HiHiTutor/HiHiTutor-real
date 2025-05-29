const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.apiUrl = process.env.WHATSAPP_API_URL;
    this.apiToken = process.env.WHATSAPP_API_TOKEN;
  }

  async sendMessage(phoneNumber, message) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: WhatsApp message would be sent to:', phoneNumber);
        console.log('Message content:', message);
        return true;
      }

      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp message');
    }
  }

  async sendTemplateMessage(phoneNumber, template, variables) {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: WhatsApp template message would be sent to:', phoneNumber);
        console.log('Template:', template);
        console.log('Variables:', variables);
        return true;
      }

      const response = await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: template,
            language: {
              code: 'zh_HK'
            },
            components: [
              {
                type: 'body',
                parameters: variables.map(variable => ({
                  type: 'text',
                  text: variable
                }))
              }
            ]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('WhatsApp API Error:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp template message');
    }
  }
}

module.exports = new WhatsAppService(); 