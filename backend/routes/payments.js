import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

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
  if (!RAZORPAY_KEY_ID) {
    return res.status(503).json({ 
      error: 'Payment service not configured',
      message: 'Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file',
      help: 'Get your keys from https://dashboard.razorpay.com/app/keys'
    });
  }
  return res.json({ key: RAZORPAY_KEY_ID });
});

router.post('/order', async (req, res) => {
  try {
    if (!razor) {
      return res.status(503).json({ 
        error: 'Payment service not configured',
        message: 'Razorpay keys not set. Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file'
      });
    }
    
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Amount required', message: 'Please provide amount in request body' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount', message: 'Amount must be greater than 0' });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    console.log(`Creating Razorpay order for ₹${amount}`);
    const order = await razor.orders.create(options);
    console.log(`Order created: ${order.id}`);
    return res.json(order);
  } catch (err) {
    console.error('Order create error:', err);
    return res.status(500).json({ 
      error: 'Unable to create order',
      message: err.message || 'Failed to create Razorpay order. Please check your Razorpay keys.'
    });
  }
});

router.post('/verify', (req, res) => {
  if (!RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ error: 'Payment service not configured' });
  }
  
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ status: 'failure', message: 'Missing payment details' });
  }
  
  const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
  const digest = hmac.digest('hex');

  if (digest === razorpay_signature) {
    // TODO: mark payment success in DB here
    // You can save payment details to database
    console.log('Payment verified successfully:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });
    return res.json({ 
      status: 'success',
      message: 'Payment verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });
  } else {
    return res.status(400).json({ status: 'failure', message: 'Invalid signature' });
  }
});

export default router;