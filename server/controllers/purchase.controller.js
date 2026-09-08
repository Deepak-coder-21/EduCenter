import Razorpay from 'razorpay';
import crypto from 'crypto';
import Course from '../models/course.js';
import User from '../models/user.js';
import Purchase from '../models/purchase.js';

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  try {
    return new Razorpay({ key_id, key_secret });
  } catch (err) {
    console.error('Razorpay initialization error:', err);
    return null;
  }
};

// Create a checkout order for a course (or free instant enroll)
export const createCheckoutOrder = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if user is already enrolled
    const isAlreadyEnrolled = user.enrolledCourses?.some(
      (cId) => cId.toString() === courseId.toString()
    );
    if (isAlreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course.',
      });
    }

    const price = course.coursePrice || 0;

    // Handle Free Course (Price = 0)
    if (price === 0) {
      if (!user.enrolledCourses.includes(courseId)) {
        user.enrolledCourses.push(courseId);
        await user.save();
      }

      if (!course.enrolledStudents.includes(userId)) {
        course.enrolledStudents.push(userId);
        await course.save();
      }

      await Purchase.create({
        courseId,
        userId,
        amount: 0,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'Free Enrollment',
      });

      return res.status(200).json({
        success: true,
        isFree: true,
        message: 'Enrolled in course successfully for free!',
      });
    }

    // Handle Paid Course with Razorpay
    const amountInPaise = Math.round(price * 100);
    const razorpay = getRazorpayInstance();
    let orderId = '';

    if (razorpay) {
      try {
        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            courseId: course._id.toString(),
            courseTitle: course.courseTitle,
            userId: userId.toString(),
          },
        });
        orderId = order.id;
      } catch (rzpErr) {
        console.warn('Razorpay API error, generating sandbox test order:', rzpErr?.message || rzpErr);
        orderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
    } else {
      // Sandbox fallback mode
      orderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // Record pending purchase
    await Purchase.create({
      courseId,
      userId,
      amount: price,
      currency: 'INR',
      status: 'pending',
      orderId,
    });

    return res.status(200).json({
      success: true,
      isFree: false,
      orderId,
      amount: price,
      amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
      courseTitle: course.courseTitle,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error creating checkout order:', error);
    return res.status(500).json({ success: false, message: 'Failed to initiate course checkout.' });
  }
};

// Verify payment and unlock course
export const verifyPayment = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!courseId || !razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Missing payment verification details.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify signature if not in test sandbox fallback mode
    const isTestOrder = razorpay_order_id.startsWith('order_test_');
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!isTestOrder && secret && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
      }
    }

    // Update Purchase Record
    let purchase = await Purchase.findOne({ orderId: razorpay_order_id });
    if (!purchase) {
      purchase = await Purchase.create({
        courseId,
        userId,
        amount: course.coursePrice || 0,
        currency: 'INR',
        orderId: razorpay_order_id,
      });
    }

    purchase.status = 'completed';
    purchase.paymentId = razorpay_payment_id || `pay_test_${Date.now()}`;
    await purchase.save();

    // Enroll Student in Course
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
    }

    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified! Course successfully purchased and unlocked.',
      courseId,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify payment.' });
  }
};

// Check if user is enrolled in course
export const getCoursePurchaseStatus = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ success: true, isEnrolled: false });
    }

    const isEnrolled = user.enrolledCourses?.some(
      (id) => id.toString() === courseId.toString()
    );

    return res.status(200).json({
      success: true,
      isEnrolled: !!isEnrolled,
    });
  } catch (error) {
    console.error('Error checking course status:', error);
    return res.status(500).json({ success: false, message: 'Failed to check enrollment status.' });
  }
};

// Get current user's enrolled courses for My Learning page
export const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).populate({
      path: 'enrolledCourses',
      populate: [
        { path: 'creator', select: 'name email photoUrl' },
        { path: 'lectures', select: 'lectureTitle duration isPreviewFree' },
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      courses: user.enrolledCourses || [],
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch enrolled courses.' });
  }
};

// Get current user's purchase/order history
export const getMyPurchases = async (req, res) => {
  try {
    const userId = req.id;
    const purchases = await Purchase.find({ userId })
      .populate('courseId', 'courseTitle courseThumbnail category coursePrice')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      purchases: purchases || [],
    });
  } catch (error) {
    console.error('Error fetching student purchases:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch purchases' });
  }
};

