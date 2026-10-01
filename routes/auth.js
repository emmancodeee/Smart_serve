const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const adminReadController = require('../adminReadController');
const announcementController = require('../announcementController');
const inventoryController = require('../controllers/inventoryController');
const supplyController = require('../controllers/supplyController');
const stockOutController = require('../controllers/stockOutController');
const uniformRequestController = require('../controllers/uniformRequestController');
const feedbackController = require('../controllers/feedbackController');
const returnRequestController = require('../controllers/returnRequestController');
const analyticsController = require('../controllers/analyticsController');
const { orfUpload, orfDiskUpload } = require('../middlewares/orfUpload');
const { authenticateAccount } = require('../middlewares/authenticateAccount');
const { authenticateUser } = require('../middlewares/authenticateUser');
const { authenticateAdmin } = require('../middlewares/authenticateAdmin');
const { isSuperAdminAccount } = require('../services/authSupportService');

const router = express.Router();
const accountRouter = express.Router();
const adminRouter = express.Router();
const inventoryRouter = express.Router();

router.route('/send-verification').post(authController.sendVerificationCode);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password').post(authController.resetPassword);
router.route('/register').post(authController.register);
router.route('/login').post(authController.login);

accountRouter.route('/me').get(authenticateAccount, authController.me);
accountRouter.route('/announcements').get(authenticateUser, announcementController.listStudentAnnouncements);
accountRouter.route('/extract-orf').post(authenticateUser, orfUpload.single('orfImage'), authController.extractOrf);
accountRouter.route('/update-profile').put(authenticateUser, orfDiskUpload.single('orfImage'), authController.updateProfile);
accountRouter.route('/change-password').put(authenticateUser, authController.changePassword);

// Feedback routes for students
accountRouter.route('/feedback').post(authenticateUser, feedbackController.createFeedback);
accountRouter.route('/feedback').get(authenticateUser, feedbackController.getUserFeedbacks);
accountRouter.route('/feedback/:id').get(authenticateUser, feedbackController.getFeedbackById);
accountRouter.route('/feedback/:id').put(authenticateUser, feedbackController.updateFeedback);
accountRouter.route('/feedback/:id/archive').put(authenticateUser, feedbackController.archiveFeedback);

// Return request routes for students
accountRouter.route('/returns').post(authenticateUser, returnRequestController.createReturnRequest);
accountRouter.route('/returns').get(authenticateUser, returnRequestController.getUserReturnRequests);
accountRouter.route('/returns/:id').get(authenticateUser, returnRequestController.getReturnRequestById);
accountRouter.route('/returns/:id/cancel').put(authenticateUser, returnRequestController.cancelReturnRequest);
accountRouter.route('/returns/:id/feedback').put(authenticateUser, returnRequestController.addStudentFeedback);

adminRouter.use(authenticateAdmin);

// Pickup Confirmations is Admin-only. Super Admin accounts are denied.
const restrictPickupConfirmationsToAdmin = (req, res, next) => {
  if (isSuperAdminAccount(req.admin)) {
    return res.status(403).json({ error: 'Pickup confirmations are restricted to admin accounts.' });
  }
  return next();
};

adminRouter.route('/users').get(adminReadController.listUsers);
adminRouter.route('/users/:id')
  .get(adminReadController.getUserDetails)
  .delete(adminController.deleteUser);
adminRouter.route('/admins')
  .get(adminController.listAdmins)
  .post(adminController.createAdmin);
adminRouter.route('/admins/:id').delete(adminController.deleteAdmin);
adminRouter.route('/change-password').put(adminController.changeOwnPassword);
adminRouter.route('/verify-access').post(authController.verifySuperAdminAccess);
adminRouter.route('/announcements')
  .get(announcementController.listAdminAnnouncements)
  .post(announcementController.createAnnouncement);
adminRouter.route('/announcements/:id')
  .put(announcementController.updateAnnouncement)
  .delete(announcementController.deleteAnnouncement);
adminRouter.route('/announcements/:id/archive').put(announcementController.archiveAnnouncement);
adminRouter.route('/registrations').get(adminReadController.listRegistrations);
adminRouter.route('/registrations/:id/status').put(adminController.updateRegistrationStatus);
adminRouter.route('/registrations/:id/archive').put(adminController.archiveRegistration);

// Uniform Request Management Routes
adminRouter.route('/requests').get(uniformRequestController.listRequests);
adminRouter.route('/requests/:id/approve').put(uniformRequestController.approveRequest);
adminRouter.route('/requests/:id/reject').put(uniformRequestController.rejectRequest);
adminRouter.route('/requests/bulk/approve').post(uniformRequestController.bulkApproveRequests);
adminRouter.route('/requests/:id/feedback').put(uniformRequestController.updateFeedback);
adminRouter.route('/requests/:id/return/initiate').put(uniformRequestController.initiateReturn);
adminRouter.route('/requests/:id/return/complete').put(uniformRequestController.completeReturn);

adminRouter.route('/transactions').get(adminController.listTransactions);
adminRouter.route('/pickup-notifications').get(adminController.listPickupNotifications);
adminRouter.route('/pickup-confirmations').get(restrictPickupConfirmationsToAdmin, adminReadController.listPickupConfirmations);
adminRouter.route('/pickup-confirmations/:id').put(restrictPickupConfirmationsToAdmin, adminController.applyPickupConfirmation);

// Feedback management routes for admins
adminRouter.route('/feedback').get(feedbackController.getAllFeedbacks);
adminRouter.route('/feedback/:id').get(feedbackController.getFeedbackDetails);
adminRouter.route('/feedback/:id/response').post(feedbackController.addAdminResponse);
adminRouter.route('/feedback/:id/status').put(feedbackController.updateFeedbackStatus);
adminRouter.route('/feedback/:id/priority').put(feedbackController.updateFeedbackPriority);

// Return request management routes for admins
adminRouter.route('/returns').get(returnRequestController.getAllReturnRequests);
adminRouter.route('/returns/:id').get(returnRequestController.getReturnRequestDetails);
adminRouter.route('/returns/:id/approve').put(returnRequestController.approveReturnRequest);
adminRouter.route('/returns/:id/reject').put(returnRequestController.rejectReturnRequest);
adminRouter.route('/returns/:id/confirm').put(returnRequestController.confirmReturn);
adminRouter.route('/returns/:id/priority').put(returnRequestController.updateReturnRequestPriority);

// Analytics routes for admins
adminRouter.route('/analytics/funnel').get(analyticsController.getRegistrationFunnel);
adminRouter.route('/analytics/inventory').get(analyticsController.getInventoryAnalytics);
adminRouter.route('/analytics/noshow').get(analyticsController.getNoShowAnalytics);
adminRouter.route('/analytics/dashboard').get(analyticsController.getDashboardAnalytics);

inventoryRouter.use(authenticateAdmin);
inventoryRouter.route('/').get(inventoryController.listInventory);
inventoryRouter.route('/analytics/summary').get(inventoryController.getInventorySummary);
inventoryRouter.route('/supply')
  .get(supplyController.listSupply)
  .post(supplyController.addSupply);
inventoryRouter.route('/stock-out')
  .get(stockOutController.listStockOut)
  .post(stockOutController.removeStock);

router.use(accountRouter);
router.use('/admin', adminRouter);
router.use('/inventory', inventoryRouter);

module.exports = router;
