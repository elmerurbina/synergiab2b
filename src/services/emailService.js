// src/services/emailService.js
import emailjs from '@emailjs/browser';


const EMAILJS_PUBLIC_KEY = '9bHI24VdRqkbRegG1'; 
const EMAILJS_SERVICE_ID = 'service_7z5dcpm'; 
const EMAILJS_TEMPLATE_ID = 'template_meindep'; 

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export const emailService = {
  // Send contact form email
  sendContactEmail: async (formData) => {
    try {
      const templateParams = {
        from_name: formData.nombre,
        from_email: formData.email,
        from_phone: formData.telefono || 'No especificado',
        subject: formData.asunto,
        message: formData.mensaje,
        to_email: 'info@sinergiab2b.com',
        reply_to: formData.email,
        date: new Date().toLocaleString('es-ES', {
          dateStyle: 'full',
          timeStyle: 'medium'
        })
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );
      
      return { success: true, data: response };
    } catch (error) {
      console.error('EmailJS Error:', error);
      return { success: false, error: error.text || 'Error al enviar el mensaje' };
    }
  },

  // Send notification email to user (confirmation)
  sendConfirmationEmail: async (formData) => {
    try {
      const templateParams = {
        to_name: formData.nombre,
        to_email: formData.email,
        subject: formData.asunto,
        message: formData.mensaje,
        company: 'SinergiaB2B',
        year: new Date().getFullYear()
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        'template_confirmation', // You'll need to create this template
        templateParams
      );
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Confirmation email error:', error);
      return { success: false, error: error.text };
    }
  }
};

export default emailService;