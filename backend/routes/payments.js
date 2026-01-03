import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';

const router = express.Router();

// Initialize Razorpay only if keys are provided
// Support both standard and custom env variable names
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.key_id;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.key_secret;

let razor = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razor = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
  console.log('Razorpay initialized successfully');
} else {
  console.warn('Razorpay keys not configured. Payment routes will not work.');
  console.warn('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
}

router.get('/key', (req, res) => {
  console.log('[Payment Key] Key requested');
  if (!RAZORPAY_KEY_ID) {
    console.error('[Payment Key] Razorpay key not configured');
    return res.status(503).json({ 
      error: 'Payment service not configured',
      message: 'Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file',
      help: 'Get your keys from https://dashboard.razorpay.com/app/keys'
    });
  }
  console.log('[Payment Key] Key sent successfully');
  return res.json({ key: RAZORPAY_KEY_ID });
});

router.post('/order', async (req, res) => {
  try {
    console.log('[Payment Order] Order creation requested');
    if (!razor) {
      console.error('[Payment Order] Razorpay not initialized');
      return res.status(503).json({ 
        error: 'Payment service not configured',
        message: 'Razorpay keys not set. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file'
      });
    }
    
    const { amount } = req.body;
    console.log('[Payment Order] Request body:', { amount });
    
    if (!amount) {
      console.error('[Payment Order] Amount not provided');
      return res.status(400).json({ error: 'Amount required', message: 'Please provide amount in request body' });
    }

    if (amount <= 0) {
      console.error('[Payment Order] Invalid amount:', amount);
      return res.status(400).json({ error: 'Invalid amount', message: 'Amount must be greater than 0' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    console.log(`[Payment Order] Creating Razorpay order for ₹${amount} (${options.amount} paise)`);
    const order = await razor.orders.create(options);
    console.log(`[Payment Order] Order created successfully: ${order.id}, amount: ${order.amount}`);
    return res.json(order);
  } catch (err) {
    console.error('[Payment Order] Order creation error:', err);
    console.error('[Payment Order] Error details:', {
      message: err.message,
      description: err.error?.description,
      code: err.error?.code
    });
    return res.status(500).json({ 
      error: 'Unable to create order',
      message: err.message || 'Failed to create Razorpay order. Please check your Razorpay keys.'
    });
  }
});

router.post('/verify', async (req, res) => {
  try {
    console.log('[Payment Verify] Verification requested');
    console.log('[Payment Verify] Request body keys:', Object.keys(req.body));
    
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('[Payment Verify] Razorpay secret not configured');
      return res.status(503).json({ error: 'Payment service not configured' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      studentId,
      courseId,
      amount,
      currency,
      method,
      raw
    } = req.body;

    console.log('[Payment Verify] Payment details:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      studentId,
      courseId,
      amount
    });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('[Payment Verify] Missing required fields');
      return res.status(400).json({
        status: 'failure',
        message: 'Missing payment details'
      });
    }

    // Generate signature
    console.log('[Payment Verify] Generating signature for verification');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Secure comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

    if (!isValid) {
      console.error('[Payment Verify] Signature verification failed');
      console.error('[Payment Verify] Expected signature:', generatedSignature);
      console.error('[Payment Verify] Received signature:', razorpay_signature);
      return res.status(400).json({
        status: 'failure',
        message: 'Invalid signature'
      });
    }

    console.log('[Payment Verify] Signature verified successfully');

    // Save payment
    console.log('[Payment Verify] Saving payment to database');
    const paymentDoc = await Payment.create({
      student: studentId || undefined,
      course: courseId || undefined,
      amount: amount || undefined,
      currency: currency || 'INR',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method: method || undefined,
      status: 'paid',
      raw: raw || req.body
    });
    console.log('[Payment Verify] Payment saved with ID:', paymentDoc._id);

    // Activate enrollment
    if (studentId && courseId) {
      console.log('[Payment Verify] Checking enrollment for student:', studentId, 'course:', courseId);
      const enrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId
      });

      if (!enrollment) {
        console.log('[Payment Verify] Creating new enrollment');
        await Enrollment.create({
          student: studentId,
          course: courseId,
          status: 'active'
        });
        console.log('[Payment Verify] Enrollment created successfully');
      } else if (enrollment.status !== 'active') {
        console.log('[Payment Verify] Activating existing enrollment');
        enrollment.status = 'active';
        await enrollment.save();
        console.log('[Payment Verify] Enrollment activated successfully');
      } else {
        console.log('[Payment Verify] Enrollment already active');
      }
    } else {
      console.log('[Payment Verify] No studentId or courseId provided, skipping enrollment');
    }

    console.log('[Payment Verify] Verification complete, sending success response');
    return res.json({
      status: 'success',
      message: 'Payment verified and recorded',
      paymentId: paymentDoc._id,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });

  } catch (error) {
    console.error('[Payment Verify] Verification error:', error);
    console.error('[Payment Verify] Error stack:', error.stack);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

export default router;
