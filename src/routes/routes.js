import { signin, signup } from '../controllers/authController';
import {
  validateSigninFormData,
  validateSignupFormData,
  validateCommentData,
  validUser,
  validateInvite,
  validateInviteId,
  validateInviteData,
  validateInviteUpdateData,
  authenticateUserToken,
  validateAdmin,
  validateUserById,
  validateUserId,
  validateUpvoteInput,
  validateInviteOwner,
  passportAuthCallback,
  passportAuthenticate,
  multerUploads,
  verifyUniqueUserUsername,
  verifyUniqueUserEmail,
} from '../middlewares/middlewares';

import {
  deleteInvite,
  upvoteInvite,
  saveNewInvite,
  getOneInvite,
  getAllInvites,
  updateInvite,
  renderSinglePostPage,
  renderJobInvitesPage,
  renderSearchResults,
  searchInvitesApi,
  renderEditInvitePage,
  renderAdminJobInvitesPage
} from '../controllers/inviteController';

import { getComments, createComment } from '../controllers/commentController';
import {
  blockUser,
  getUsers,
  renderAdminUsersPage,
  getUser,
  renderUserProfile,
  getUserByUserId
} from '../controllers/userController';
import { getNotifications, createNotification } from '../controllers/notificationController';
import { validateNotificationData } from '../middlewares/validateNotification';
import { validateCookies, signUserIn, signUserOut } from '../middlewares/cookieHandler';
import { getMetrics } from '../controllers/metricsController';

export const initRoutes = app => {
  // Cookie handlers before all
  app.use(validateCookies);
  app.use(signUserIn);
  app.use(signUserOut);

  // All EJS frontend endpoints below --------------------------------------------------

  app.get('/', (req, res) => res.render('index', { isAuth: req.isAuth, isAdmin: req.auth.isAdmin })); // Pass true or false to toggle state of navbar....
  app.get('/login', (req, res) => res.render('login', { isAuth: req.isAuth, isAdmin: req.auth.isAdmin }));
  app.get('/register', (req, res) => res.render('register', { isAuth: req.isAuth, isAdmin: req.auth.isAdmin }));
  app.get('/post', getUserByUserId, (req, res) => res.render('userPost', { isAuth: req.isAuth, isAdmin: req.auth.isAdmin, user: req.user }));
  app.get('/howitworks', (req, res) => res.render('howitworks', { isAuth: req.isAuth, isAdmin: req.auth.isAdmin }));
  app.get('/posts', renderJobInvitesPage);
  app.get('/post/:inviteId', renderSinglePostPage);
  app.get('/about', (req, res) => res.render('about', { isAuth: req.isAuth, isAdmin: req.auth.isAdmin }));
  app.get('/admin/reported', (req, res) => res.render('admin/reportedUsers', { isAuth: req.isAuth, isAdmin: req.auth.isAdmin }));
  app.get('/reportUser', (req, res) => res.render('reportUser', { isAuth: false }));
  app.get('/users/:username', renderUserProfile);
  app.get('/admin/reportedusers', (req, res) => res.render('admin/reported', { isAuth : false}));
  // Search Invites - Renders view
  app.get('/invites/search', renderSearchResults);
  app.get('/admin', (req, res) => res.render('./admin/index', { isAuth: false }));


  // Edit post endpoint
  app.get('/post/:inviteId/edit', validateInviteId, validateInvite, getUserByUserId, renderEditInvitePage);

  app.get('/admin/users', renderAdminUsersPage);
  app.get('/admin/posts', renderAdminJobInvitesPage);

  // All backend API endpoints below -----------------------------------------------------
  // Auth
  app.post('/api/v1/auth/signin', validateSigninFormData, validUser, signin);
  app.post(
    '/api/v1/auth/signup',
    validateSignupFormData,
    verifyUniqueUserEmail,
    verifyUniqueUserUsername,
    signup
  );
  // Twitter Login
  app.get('/auth/twitter', passportAuthenticate);
  app.get('/auth/twitter/callback', passportAuthCallback);
  // Get all Users
  app.get('/api/v1/users', authenticateUserToken, validateAdmin, getUsers);

  // Get single User - return JSON
  app.get('/api/v1/users/json/:username', getUser);

  // Block a user
  app.patch(
    '/api/v1/users/block/:userId',
    validateUserId,
    authenticateUserToken,
    validateAdmin,
    validateUserById,
    blockUser
  );

  // Post a new job invite.
  app.post(
    '/api/v1/invites',
    authenticateUserToken,
    multerUploads,
    validateInviteData,
    saveNewInvite
  );

  // Get all job invites in the database.
  app.get('/api/v1/invites', getAllInvites);

  // Search Invites - Returns JSON payload
  app.get('/api/v1/invites/search/json', searchInvitesApi);

  // Get a single job invite.
  app.get('/api/v1/invites/:inviteId', validateInviteId, getOneInvite);

  // Update an existing job invite.
  app.put(
    '/api/v1/invites/:inviteId',
    validateInviteUpdateData,
    validateInviteId,
    authenticateUserToken,
    validateInvite,
    validateInviteOwner,
    updateInvite
  );

  // Delete an existing job invite.
  app.delete(
    '/api/v1/invites/:inviteId',
    validateInviteId,
    authenticateUserToken,
    validateAdmin,
    validateInvite,
    deleteInvite
  );

  // Get all comments for a given Invite.
  app.get('/api/v1/comments/:inviteId', validateInviteId, getComments);

  // Post a comment on a specific Invite.
  app.post(
    '/api/v1/comments/:inviteId',
    validateCommentData,
    validateInviteId,
    authenticateUserToken,
    validateInvite,
    createComment
  );

  // Upvote/Downvote a specific Invite.
  app.patch(
    '/api/v1/invites/upvote/:inviteId/:voteType',
    validateUpvoteInput,
    validateInvite,
    upvoteInvite
  );

  // Get the number of users, invites and comments in the database.
  app.get('/api/v1/metrics', getMetrics);

  // Get all comments for a given Invite.
  app.get('/api/v1/notifications/:userId', validateUserId, getNotifications);
  app.post('/api/v1/notifications', validateNotificationData, createNotification);

  // Fallback case for unknown URIs.
  app.all('*', (req, res) => res.status(404).json({ message: 'Route Not Found' }));
};
