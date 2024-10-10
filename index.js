require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require("./model/userModel");
const EventRegistration = require("./model/registrationSchema");
const BasicRegistration = require("./model/basicRegistration");
const MembershipCard = require("./model/membershipCard");
const Payment =require("./model/paymentModel");
const sendEmail = require("./utils/sendEmail");
const fs = require('fs');
const PDFDocument = require('pdfkit');
require('./db/conn');
const axios = require('axios');
const Order = require('./model/orderModel');


const PORT = process.env.PORT || 8080;
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
// Create app
const app = express();
app.use(express.json());
app.use(cors({
  origin: `${BASE_URL}`,
  methods: "GET,POST,PUT,DELETE",

}));

function generateBasicPDF(userData) {
  const doc = new PDFDocument();
  const filePath = `./receipt-${userData.email}.pdf`;

  doc.pipe(fs.createWriteStream(filePath));

  // Header styling
  doc.fontSize(25)
    .font('Helvetica-Bold') // Bold font
    .fillColor('#003366') // Blue color
    .text('Payment Receipt', {
      align: 'center',
      underline: true
    });

  doc.moveDown(2); // Adds vertical spacing

  // User Data section with styling
  doc.fontSize(12)
    .font('Helvetica') // Regular font
    .fillColor('#000') // Reset to black text color
    .text(`Name: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.name}`); // Bold for user data

  doc.font('Helvetica')
    .text(`Email: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.email}`);

  doc.font('Helvetica')
    .text(`Phone: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.mobile}`);

  doc.font('Helvetica')
    .text(`Amount Paid: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.amount}`);

  doc.font('Helvetica')
    .text(`Payment_Id: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.payment_Id}`);

  // Footer section
  doc.moveDown(2);
  doc.fontSize(10)
    .font('Helvetica')
    .fillColor('#555') // Lighter color for footer
    .text('Thank you for your purchase!', {
      align: 'center'
    });

  doc.end();

  return filePath;
}

function generateMembershipPDF(userData) {
  const doc = new PDFDocument();
  const filePath = `./receipt-${userData.email}.pdf`;

  doc.pipe(fs.createWriteStream(filePath));

  // Header styling
  doc.fontSize(25)
    .font('Helvetica-Bold') // Bold font
    .fillColor('#003366') // Blue color
    .text('Payment Receipt', {
      align: 'center',
      underline: true
    });

  doc.moveDown(2); // Adds vertical spacing

  // User Data section with styling
  doc.fontSize(12)
    .font('Helvetica') // Regular font
    .fillColor('#000') // Reset to black text color
    .text(`Name: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.name}`); // Bold for user data

  doc.font('Helvetica')
    .text(`Email: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.email}`);

  doc.font('Helvetica')
    .text(`Phone: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.mobile}`);


  doc.font('Helvetica')
    .text(`Amount Paid: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.amount}`);

  doc.font('Helvetica')
    .text(`Payment_Id: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.payment_Id}`);

  // Footer section
  doc.moveDown(2);
  doc.fontSize(10)
    .font('Helvetica')
    .fillColor('#555') // Lighter color for footer
    .text('Thank you for your purchase!', {
      align: 'center'
    });

  doc.end();

  return filePath;
}

function generateEventPDF(userData) {
  const doc = new PDFDocument();
  const filePath = `./receipt-${userData.teamLeaderEmail}.pdf`;

  doc.pipe(fs.createWriteStream(filePath));

  // Header styling
  doc.fontSize(25)
    .font('Helvetica-Bold') // Bold font
    .fillColor('#003366') // Blue color
    .text('Payment Receipt', {
      align: 'center',
      underline: true
    });

  doc.moveDown(2); // Adds vertical spacing

  // User Data section with styling
  doc.fontSize(12)
    .font('Helvetica') // Regular font
    .fillColor('#000') // Reset to black text color
    .text(`Name: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.teamLeaderName}`); // Bold for user data

  doc.font('Helvetica')
    .text(`Email: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.teamLeaderEmail}`);

  doc.font('Helvetica')
    .text(`Phone: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.teamLeaderMobileNo}`);


  doc.font('Helvetica')
    .text(`Amount Paid: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.amount}`);

  doc.font('Helvetica')
    .text(`Payment_Id: `, { continued: true })
    .font('Helvetica-Bold')
    .text(`${userData.payment_Id}`);

  // Footer section
  doc.moveDown(2);
  doc.fontSize(10)
    .font('Helvetica')
    .fillColor('#555') // Lighter color for footer
    .text('Thank you for your purchase!', {
      align: 'center'
    });

  doc.end();

  return filePath;
}

app.post('/basic-registration', async (req, res) => {
    const { name, email, mobile, amount,college, order_Id, payment_Id, signature } = req.body;
  
    try {
      const newRegistration = new BasicRegistration({
        name,
        email,
        mobile,
        amount,
        college,
        Paid:true,
        order_Id,
        payment_Id,
        signature
      });
  
      await newRegistration.save();
      console.log(newRegistration);
      const send_to = email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = email;
        const subject = " PYREXIA 2024 Basic Registration Confirmation";
        const message = `
        <p> Dear ${newRegistration.name},</p>
        
          <p> We are excited to confirm your basic registration for PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
        
        <p> PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
        
       <p> Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
        
       <p> Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
        
       <p> Best regards,</p>
       <p> Team PYREXIA </p>
        `;


        const pdfPath = generateBasicPDF(newRegistration);
        try {
          await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }
          return res.status(200).json({
            success: true,
            message: "Registration saved. A confirmation email has been sent.",
          });
        } catch (error) {
          console.error("Error sending confirmation email:", error);
          return res.status(500).json({
            success: true, // Payment was still successful, but email failed
            message: "Registration saved but failed to send confirmation email. Please contact support.",
          });
        }
    } catch (error) {
      res.status(500).json({ error: 'Error processing registration' });
    }
  });
 
app.post('/add-member', async (req, res) => {
  const { name, email, mobile, amount, college, order_Id, payment_Id, signature } = req.body;

  try {
    const newRegistration = new MembershipCard({
      name,
      email,
      mobile,
      amount,
      college, 
      Paid:true,
      order_Id,
      payment_Id,
      signature
    });

    await newRegistration.save();
    console.log(newRegistration);

        const send_to = email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = email;
        const subject = " PYREXIA 2024 Membership Card Confirmation";
        const message = `
        <p>Dear ${newRegistration.name},</p>
        
         <p>We are excited to confirm your registration for  Membership Card of PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
        
         <p>PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
        
         <p>Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
        
         <p>Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
        
         <p>Best regards,</p>
         <p>Team PYREXIA</p>
        `;


        const pdfPath = generateMembershipPDF(newRegistration);


        try {
          await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }
          return res.status(200).json({
            success: true,
            message: "Registration saved. A confirmation email has been sent.",
          });
        } catch (error) {
          console.error("Error sending confirmation email:", error);
          return res.status(500).json({
            success: true, // Payment was still successful, but email failed
            message: "Registration saved but failed to send confirmation email. Please contact support.",
          });
        }
  } catch (error) {
    res.status(500).json({ error: 'Error processing registration' });
  }
}); 

app.post('/add-member-payment-details', async (req, res) => {
  const { email,order_Id, payment_Id, signature } = req.body;

  try {
    const registration = await MembershipCard.findOne({ email:email});
    
    if (!registration) {
      return res.status(404).json({ error: 'Event Registration Not found' });
    }
    
    console.log(registration);

      registration.order_Id = order_Id;
      registration.payment_Id = payment_Id;
      registration.signature = signature;
      registration.Paid = true;
      await registration.save();

      console.log(registration);
    

        const send_to = email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = email;
        const subject = " PYREXIA 2024 Membership Card Confirmation";
        const message = `
        <p>Dear ${registration.name},</p>
        
         <p>We are excited to confirm your registration for  Membership Card of PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
        
         <p>PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
        
         <p>Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
        
         <p>Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
        
         <p>Best regards,</p>
         <p>Team PYREXIA</p>
        `;


        const pdfPath = generateMembershipPDF(registration);
        console.log(subject);

        try {
          await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }
          return res.status(200).json({
            success: true,
            message: "Registration saved. A confirmation email has been sent.",
          });
        } catch (error) {
          console.error("Error sending confirmation email:", error);
          return res.status(500).json({
            success: true, // Payment was still successful, but email failed
            message: "Registration saved but failed to send confirmation email. Please contact support.",
          });
        }
  } catch (error) {
    res.status(500).json({ error: 'Error processing registration' });
  }
}); 

app.post('/add-basic-payment-details', async (req, res) => {
  const {email,order_Id, payment_Id, signature } = req.body;

  try {
    const registration = await BasicRegistration.findOne({ email:email});
    
    if (!registration) {
      return res.status(404).json({ error: 'Basic Registration Not found' });
    }
    
    console.log(registration);

      registration.order_Id = order_Id;
      registration.payment_Id = payment_Id;
      registration.signature = signature;
      registration.Paid = true;
      await registration.save();

      console.log(registration);
   

    const send_to = email;
      const sent_from = process.env.EMAIL_USER;
      const reply_to = email;
      const subject = " PYREXIA 2024 Basic Registration Confirmation";
      const message = `
      <p> Dear ${registration.name},</p>
      
        <p> We are excited to confirm your basic registration for PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
      
      <p> PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
      
     <p> Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
      
     <p> Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
      
     <p> Best regards,</p>
     <p> Team PYREXIA </p>
      `;

console.log(subject);
      const pdfPath = generateBasicPDF(registration);
      try {
        await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }
        return res.status(200).json({
          success: true,
          message: "Registration saved. A confirmation email has been sent.",
        });
      } catch (error) {
        console.error("Error sending confirmation email:", error);
        return res.status(500).json({
          success: true, // Payment was still successful, but email failed
          message: "Registration saved but failed to send confirmation email. Please contact support.",
        });
      }
  } catch (error) {
    res.status(500).json({ error: 'Error processing registration' });
  }
});
app.post('/add-event-payment-details', async (req, res) => {
  const { mainEvent, eventName, email, payment_Id, order_Id, signature } = req.body;
  
  console.log(req.body); // Use console.log instead of console for logging

  try {
    const registration = await EventRegistration.findOne({
      teamLeaderEmail: email,
      mainevent: mainEvent,
      eventName: eventName
    });

    if (!registration) {
      return res.status(404).json({ error: 'Event Registration Not found' });
    }

    console.log(registration);

    // Update registration details
    registration.order_Id = order_Id;
    registration.signature = signature;
    registration.payment_Id = payment_Id;
    registration.Paid = true;

    await registration.save();
    console.log(registration);

    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = email;
   const subject = `PYREXIA 2024 ${eventName} Confirmation`;
      const message = `
      <p>Dear ${registration.teamLeaderName},</p>
      
      <p>We are excited to confirm your registration for event  ${eventName} of PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
      
      <p>PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
      
      <p>Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
      
      <p>Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
      
     <p> Best regards,</p>
     <p> Team PYREXIA</p>
      `;

    const pdfPath = generateEventPDF(registration);
    console.log(subject);

    try {
      await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);

      // Check if PDF exists before trying to delete
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }

      return res.status(200).json({
        success: true,
        message: "Registration saved. A confirmation email has been sent.",
      });
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      return res.status(500).json({
        success: true, // Payment was successful, but email failed
        message: "Registration saved but failed to send confirmation email. Please contact support.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing registration' });
  }
});


app.post('/update-event', async (req, res) => {
  const { mainEvent, eventName, email } = req.body;

  try {
    const registration = await EventRegistration.findOne({ teamLeaderEmail:email, mainevent:mainEvent, eventName:eventName});
    
    if (!registration) {
      return res.status(404).json({ error: 'Event Registration Not found' });
    }
    
    console.log(registration);

    const payment_details = await Payment.findOne({ order_id: registration.order_Id });
    
    if (payment_details) {
      registration.payment_Id = payment_details.payment_id;
      registration.Paid = true;
      await registration.save();

      console.log(registration);

      const send_to = email;
      const sent_from = process.env.EMAIL_USER;
      const reply_to = email;
      const subject = `PYREXIA 2024 ${eventName} Confirmation`;
      const message = `
      <p>Dear ${registration.teamLeaderName},</p>
      
      <p>We are excited to confirm your registration for event  ${eventName} of PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
      
      <p>PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
      
      <p>Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
      
      <p>Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
      
     <p> Best regards,</p>
     <p> Team PYREXIA</p>
      `;

      const pdfPath = generateEventPDF(registration);
      console.log(subject);

      try {
        await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }
        return res.status(200).json({
          success: true,
          message: "Registration saved. A confirmation email has been sent.",
        });
      } catch (error) {
        console.error("Error sending confirmation email:", error);
        return res.status(500).json({
          success: true, // Payment was still successful, but email failed
          message: "Registration saved but failed to send confirmation email. Please contact support.",
        });
      }

    
    } else {
      return res.status(400).json({ message: 'Payment details not found, registration not successful' });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing registration' });
  }
});

app.post('/update-member', async (req, res) => {
  const { email } = req.body;

  try {
    const registration = await MembershipCard.findOne({ email });
    
    if (!registration) {
      return res.status(404).json({ error: 'Membership not found' });
    }
    
    console.log(registration);

    const payment_details = await Payment.findOne({ order_id: registration.order_Id });
    
    if (payment_details) {
      registration.payment_Id = payment_details.payment_id;
      registration.Paid = true;
      await registration.save();

      console.log(registration);

      const send_to = email;
      const sent_from = process.env.EMAIL_USER;
      const reply_to = email;
      const subject = " PYREXIA 2024 Membership Card Confirmation";
      const message = `
      <p>Dear ${registration.name},</p>
      
       <p>We are excited to confirm your registration for  Membership Card of PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
      
       <p>PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
      
       <p>Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
      
       <p>Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
      
       <p>Best regards,</p>
       <p>Team PYREXIA</p>
      `;


      const pdfPath = generateMembershipPDF(registration);
      console.log(subject);

      try {
        await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }
        return res.status(200).json({
          success: true,
          message: "Registration saved. A confirmation email has been sent.",
        });
      } catch (error) {
        console.error("Error sending confirmation email:", error);
        return res.status(500).json({
          success: true, // Payment was still successful, but email failed
          message: "Registration saved but failed to send confirmation email. Please contact support.",
        });
      }

    
    } else {
      return res.status(400).json({ message: 'Payment details not found, registration not successful' });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing registration' });
  }
});

app.post('/update-basic', async (req, res) => {
  const { email } = req.body;

  try {
    const registration = await BasicRegistration.findOne({ email });
    
    if (!registration) {
      return res.status(404).json({ error: 'Basic Registration not found' });
    }
    
    console.log(registration);

    const payment_details = await Payment.findOne({ order_id: registration.order_Id });
    
    if (payment_details) {
      registration.payment_Id = payment_details.payment_id;
      registration.Paid = true;
      await registration.save();
      console.log(registration);

      const send_to = email;
      const sent_from = process.env.EMAIL_USER;
      const reply_to = email;
      const subject = " PYREXIA 2024 Basic Registration Confirmation";
      const message = `
      <p> Dear ${registration.name},</p>
      
        <p> We are excited to confirm your basic registration for PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
      
      <p> PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
      
     <p> Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
      
     <p> Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
      
     <p> Best regards,</p>
     <p> Team PYREXIA </p>
      `;


      const pdfPath = generateBasicPDF(registration);
      console.log(subject);
      try {
        await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
        if (fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath);
        }
        return res.status(200).json({
          success: true,
          message: "Registration saved. A confirmation email has been sent.",
        });
      } catch (error) {
        console.error("Error sending confirmation email:", error);
        return res.status(500).json({
          success: true, // Payment was still successful, but email failed
          message: "Registration saved but failed to send confirmation email. Please contact support.",
        });}
    } else {
      return res.status(400).json({ message: 'Payment details not found, registration not successful' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing registration' });
  }
});

app.post('/update-basic-college', async (req, res) => {
  const { email } = req.body;

  try {
    // Find the basic registration by email
    const registration = await BasicRegistration.findOne({ email });
    
    if (!registration) {
      return res.status(404).json({ error: 'Basic Registration not found' });
    }
    
    console.log(registration);

    // Find the first event registration for the given email
    const college_details = await EventRegistration.findOne({ teamLeaderEmail: email }).sort({ _id: 1 });
    
    // Check if the event registration with college details exists
    if (college_details) {
      // Use the college details from the first event
      registration.college = college_details.teamLeaderCollege;

      // Save the updated basic registration
      await registration.save();
      console.log(registration);

      return res.status(200).json({ message: 'College updated successfully', registration });
    } else {
      return res.status(404).json({ error: 'Event registration with college details not found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing registration' });
  }
});

app.post('/update-member-college', async (req, res) => {
  const { email } = req.body;

  try {
    // Find the basic registration by email
    const registration = await MembershipCard.findOne({ email });
    
    if (!registration) {
      return res.status(404).json({ error: 'Membership Registration not found' });
    }
    
    console.log(registration);

    // Find the first event registration for the given email
    const college_details = await EventRegistration.findOne({ teamLeaderEmail: email }).sort({ _id: 1 });
    
    // Check if the event registration with college details exists
    if (college_details) {
      // Use the college details from the first event
      registration.college = college_details.teamLeaderCollege;

      // Save the updated basic registration
      await registration.save();
      console.log(registration);

      return res.status(200).json({ message: 'College updated successfully', registration });
    } else {
      return res.status(404).json({ error: 'Event registration with college details not found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing registration' });
  }
});




// Route to handle the payment check request
app.post('/payment-check', async (req, res) => {
  const { email, eventName } = req.body;

  try {
    // Find all orders for the given email and event name
    const orders = await Order.find({ email: email, eventName: eventName }); // Changed to Order.find()
    console.log(orders);
    console.log(email);
    console.log(eventName);

    if (!orders || !orders.length) { // Check if orders is null or empty
      return res.status(404).json({ message: 'No orders found for the given email and event name.' });
    }

    // Extract the order IDs from the orders
    const orderIds = orders.map(order => order.order_id);
    console.log(orderIds);

    // Find all payments for the given order IDs
    const payments = await Payment.find({ order_id: { $in: orderIds } });
    console.log(payments);

    if (!payments.length) {
      return res.status(404).json({ message: 'No payments found for the given orders.' });
    }

    // Loop through each payment and send the details to the appropriate API or save registrations
    const payment = payments[0];
      const order = orders.find(order => order.order_id === payment.order_id);
      const payload = {
        order_id: payment.order_id,
        payment_id: payment.payment_id,
        email: order.email,
      };

      // Handle Basic Registration
      if (eventName === 'Basic Registration') {
        try {
          const registration = await BasicRegistration.findOne({ email });
          if (!registration) {
            return res.status(404).json({ message: 'No basic registration found for this email.' });
          }

          registration.order_Id = payment.order_id;
          registration.payment_Id = payment.payment_id;
          registration.Paid = true;
          await registration.save();

          const send_to = email;
          const sent_from = process.env.EMAIL_USER;
          const reply_to = email;
          const subject = "PYREXIA 2024 Basic Registration Confirmation";
          const message = `
          <p> Dear ${registration.name},</p>
          
          <p> We are excited to confirm your basic registration for PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
          
          <p> PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
          
         <p> Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
          
         <p> Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
          
         <p> Best regards,</p>
         <p> Team PYREXIA </p>
          `;
  

          const pdfPath = generateBasicPDF(registration);
          await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
          console.log(subject);

          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }

        } catch (error) {
          console.error("Error processing basic registration:", error);
          return res.status(500).json({ error: 'Error processing basic registration' });
        }

      // Handle Membership Card
      } else if (eventName === 'Membership Card') {
        try {
          const registration = await MembershipCard.findOne({ email });
          if (!registration) {
            return res.status(404).json({ message: 'No membership registration found for this email.' });
          }

          registration.order_Id = payment.order_id;
          registration.payment_Id = payment.payment_id;
          registration.Paid = true;
          await registration.save();

          const send_to = email;
          const sent_from = process.env.EMAIL_USER;
          const reply_to = email;
          const subject = "PYREXIA 2024 Membership Card Confirmation";
          const message = `
          <p>Dear ${registration.name},</p>
          
           <p>We are excited to confirm your registration for  Membership Card of PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
          
           <p>PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
          
           <p>Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
          
           <p>Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
          
           <p>Best regards,</p>
           <p>Team PYREXIA</p>
          `;

          const pdfPath = generateMembershipPDF(registration);
          await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
          console.log(subject);

          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }

        } catch (error) {
          console.error("Error processing membership card:", error);
          return res.status(500).json({ error: 'Error processing membership card' });
        }

      // Handle other events
      } else {
        try {
          const registration = await EventRegistration.findOne({ teamLeaderEmail:email , eventName:eventName });
          if (!registration) {
            return res.status(404).json({ message: 'No event registration found for this email.' });
          }

          registration.order_Id = payment.order_id;
          registration.payment_Id = payment.payment_id;
          registration.Paid = true;
          await registration.save();

          const send_to = email;
          const sent_from = process.env.EMAIL_USER;
          const reply_to = email;
          const subject = `PYREXIA 2024 ${eventName} Confirmation`;
          const message = `
      <p>Dear ${registration.teamLeaderName},</p>
      
      <p>We are excited to confirm your registration for event  ${eventName} of PYREXIA 2024, which will take place from October 10th to October 14th, 2024, at AIIMS Rishikesh. Thank you for being a part of this vibrant event!</p>
      
      <p>PYREXIA promises to be an exciting celebration of culture, talent, and academic excellence, and we’re thrilled to have you join us. In the coming days, you will receive more details regarding the event schedule, activities, and participation guidelines.</p>
      
      <p>Please find the e-bill attached for your reference. Should you have any questions or need further assistance, don’t hesitate to reach out.</p>
      
      <p>Once again, thank you for your registration. We look forward to welcoming you at PYREXIA 2024!</p>
      
     <p> Best regards,</p>
     <p> Team PYREXIA</p>
          `;

          const pdfPath = generateEventPDF(registration);
    
          await sendEmail(subject, message, send_to, sent_from, reply_to, pdfPath);
          console.log(subject);

          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }

        } catch (error) {
          console.error("Error processing event:", error);
          return res.status(500).json({ error: 'Error processing event registration' });
        }
      }
    

    return res.status(200).json({ message: 'Payment details processed and email sent successfully!' });

  } catch (error) {
    console.error('Error processing payment data:', error);
    return res.status(500).json({ message: 'An error occurred while processing payment data.' });
  }
});

app.post('/eventTickets', async (req, res) => {
  const { id } = req.body; // Extract id from the request body
  console.log(id);
  
  try {
      // Find the event registration by ID
      const updatedRegistration = await EventRegistration.findById(id);
      
      if (!updatedRegistration) {
          return res.status(404).json({ message: 'Event registration not found' });
      }
      
      // Update the ticketGiven status
      updatedRegistration.ticketGiven = true;
      await updatedRegistration.save();  // Save the updated document

      console.log(updatedRegistration);
      res.json(updatedRegistration);
  } catch (error) {
      console.error('Error updating ticket status:', error);
      res.status(500).json({ message: 'Error updating ticket status' });
  }
});

app.post('/membershipcardTickets', async (req, res) => {
  const { id } = req.body; // Extract id from the request body
  console.log(id);
  
  try {
      // Find the event registration by ID
      const updatedRegistration = await MembershipCard.findById(id);
      
      if (!updatedRegistration) {
          return res.status(404).json({ message: 'Membership Card registration not found' });
      }
      
      // Update the ticketGiven status
      updatedRegistration.ticketGiven = true;
      await updatedRegistration.save();  // Save the updated document

      console.log(updatedRegistration);
      res.json(updatedRegistration);
  } catch (error) {
      console.error('Error updating ticket status:', error);
      res.status(500).json({ message: 'Error updating ticket status' });
  }
});

app.post('/basicTickets', async (req, res) => {
  const { id } = req.body; // Extract id from the request body
  console.log(id);
  
  try {
      // Find the event registration by ID
      const updatedRegistration = await BasicRegistration.findById(id);
      
      if (!updatedRegistration) {
          return res.status(404).json({ message: 'Basic registration not found' });
      }
      
      // Update the ticketGiven status
      updatedRegistration.ticketGiven = true;
      await updatedRegistration.save();  // Save the updated document

      console.log(updatedRegistration);
      res.json(updatedRegistration);
  } catch (error) {
      console.error('Error updating ticket status:', error);
      res.status(500).json({ message: 'Error updating ticket status' });
  }
});



// Routes for fetching data
app.get('/admin/registrations', async (req, res) => {
    const registrations = await BasicRegistration.find({});
    console.log(registrations)
    res.json(registrations);
});
app.get('/admin/users', async (req, res) => {
    const registrations = await User.find({});
    res.json(registrations);
});

app.get('/admin/membershipcard', async (req, res) => {
    const memberships = await MembershipCard.find({});
    res.json(memberships);
});

app.get('/admin/events', async (req, res) => {
    const events = await EventRegistration.find({});
    
    res.json(events);
});

// Filters using query parameters
app.get('/api/events/filter', async (req, res) => {
    const { date, eventType } = req.query;
    let filter = {};
    if (date) filter.date = date;
    if (eventType) filter.eventName = eventType;
    
    const filteredEvents = await EventRegistration.find(filter);
    res.json(filteredEvents);
});


app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
})
