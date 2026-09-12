// Hand-authored OpenAPI summary (spec §43). Extend this as new routes are
// added — swagger-jsdoc per-route annotations can be layered in later, but a
// maintained top-level spec is more valuable than partial JSDoc coverage.
export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'StudentReview API',
    version: '0.1.0',
    description:
      'Anonymous, structured college review platform API. All responses use the envelope ' +
      '{ success, data } or { success: false, message }. Bearer auth via `Authorization: Bearer <accessToken>`.',
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/auth/register': { post: { summary: 'Register a new student account', tags: ['Auth'] } },
    '/auth/login': { post: { summary: 'Log in', tags: ['Auth'] } },
    '/auth/refresh': { post: { summary: 'Rotate access token using refresh cookie', tags: ['Auth'] } },
    '/auth/logout': { post: { summary: 'Revoke refresh token', tags: ['Auth'] } },
    '/auth/forgot-password': { post: { summary: 'Request a password reset email', tags: ['Auth'] } },
    '/auth/reset-password': { post: { summary: 'Reset password with a token', tags: ['Auth'] } },
    '/auth/me': { get: { summary: 'Get the current authenticated user', tags: ['Auth'], security: [{ bearerAuth: [] }] } },

    '/institutions': { get: { summary: 'List/search/filter institutions', tags: ['Institutions'] } },
    '/institutions/search': { get: { summary: 'Typeahead search', tags: ['Institutions'] } },
    '/institutions/compare': { get: { summary: 'Compare 2-3 institutions by slug', tags: ['Institutions'] } },
    '/institutions/{slug}': { get: { summary: 'Get one institution profile', tags: ['Institutions'] } },
    '/institutions/{slug}/reviews': { get: { summary: 'List approved reviews for an institution', tags: ['Institutions'] } },
    '/institutions/{slug}/jobs': { get: { summary: 'List published jobs for an institution', tags: ['Institutions'] } },
    '/institutions/{slug}/questions': { get: { summary: 'List Q&A for an institution', tags: ['Institutions'] } },
    '/institutions/{id}/claim': { post: { summary: 'Submit an organization claim', tags: ['Institutions'], security: [{ bearerAuth: [] }] } },

    '/reviews': { post: { summary: 'Submit a review (runs moderation)', tags: ['Reviews'], security: [{ bearerAuth: [] }] } },
    '/reviews/mine': { get: { summary: 'List my own reviews', tags: ['Reviews'], security: [{ bearerAuth: [] }] } },
    '/reviews/{id}': {
      patch: { summary: 'Edit my review (re-moderated)', tags: ['Reviews'], security: [{ bearerAuth: [] }] },
      delete: { summary: 'Delete my review', tags: ['Reviews'], security: [{ bearerAuth: [] }] },
    },
    '/reviews/{id}/report': { post: { summary: 'Report a review', tags: ['Reviews'], security: [{ bearerAuth: [] }] } },
    '/reviews/{id}/vote': { post: { summary: 'Toggle helpful vote', tags: ['Reviews'], security: [{ bearerAuth: [] }] } },
    '/reviews/{id}/respond': { post: { summary: 'Organization official response', tags: ['Reviews'], security: [{ bearerAuth: [] }] } },

    '/questions': { post: { summary: 'Ask a question', tags: ['Q&A'], security: [{ bearerAuth: [] }] } },
    '/questions/institution/{institutionId}': { get: { summary: 'List questions for an institution', tags: ['Q&A'] } },
    '/questions/{id}': { get: { summary: 'Get a question with answers', tags: ['Q&A'] } },
    '/questions/{id}/answers': { post: { summary: 'Answer a question', tags: ['Q&A'], security: [{ bearerAuth: [] }] } },
    '/questions/answers/{answerId}/upvote': { post: { summary: 'Toggle answer upvote', tags: ['Q&A'], security: [{ bearerAuth: [] }] } },

    '/rankings': { get: { summary: 'Get cached rankings by metric', tags: ['Rankings'] } },

    '/users/saved-institutions': {
      get: { summary: 'List saved colleges', tags: ['Users'], security: [{ bearerAuth: [] }] },
      post: { summary: 'Save a college', tags: ['Users'], security: [{ bearerAuth: [] }] },
    },
    '/users/notifications': { get: { summary: 'List my notifications', tags: ['Users'], security: [{ bearerAuth: [] }] } },
    '/users/verification-requests': { post: { summary: 'Submit student/alumni verification', tags: ['Users'], security: [{ bearerAuth: [] }] } },

    '/organization/me': { get: { summary: 'Get my organization membership', tags: ['Organization'], security: [{ bearerAuth: [] }] } },
    '/organization/analytics': { get: { summary: 'Organization analytics + sentiment', tags: ['Organization'], security: [{ bearerAuth: [] }] } },
    '/organization/sentiment': { get: { summary: 'Per-topic sentiment breakdown (Placement, Faculty, Hostel, ...)', tags: ['Organization'], security: [{ bearerAuth: [] }] } },
    '/organization/jobs': {
      get: { summary: 'List org job postings', tags: ['Organization'], security: [{ bearerAuth: [] }] },
      post: { summary: 'Create a job/internship posting', tags: ['Organization'], security: [{ bearerAuth: [] }] },
    },

    '/admin/dashboard': { get: { summary: 'Platform KPI dashboard', tags: ['Admin'], security: [{ bearerAuth: [] }] } },
    '/admin/moderation/queue': { get: { summary: 'Pending/flagged reviews', tags: ['Admin'], security: [{ bearerAuth: [] }] } },
    '/admin/moderation/{id}/action': { post: { summary: 'Approve/Hide/Remove a review', tags: ['Admin'], security: [{ bearerAuth: [] }] } },
    '/admin/claims': { get: { summary: 'List organization claims', tags: ['Admin'], security: [{ bearerAuth: [] }] } },
    '/admin/claims/{id}/decision': { post: { summary: 'Approve/reject an organization claim', tags: ['Admin'], security: [{ bearerAuth: [] }] } },
    '/admin/jobs': { get: { summary: 'List all job/internship postings platform-wide', tags: ['Admin'], security: [{ bearerAuth: [] }] } },
    '/admin/jobs/{id}/status': { patch: { summary: 'Publish or take down a job listing', tags: ['Admin'], security: [{ bearerAuth: [] }] } },
  },
};
