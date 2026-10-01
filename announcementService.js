const Announcement = require('./models/Announcement');
const Admin = require('./models/Admin');
const User = require('./models/User');
const Inventory = require('./models/Inventory');
const { sanitizeString } = require('./utils/sanitize');
const {
  resolveAuthenticatedAdmin,
  logAdminTransaction
} = require('./services/authSupportService');

function getActorModelName(actor) {
  return actor?.constructor?.modelName === 'User' ? 'User' : 'Admin';
}

function buildActorSnapshot(actor) {
  return {
    id: actor?._id || null,
    model: getActorModelName(actor),
    name: String(actor?.name || actor?.email || 'Admin').trim() || 'Admin'
  };
}

function normalizeMultilineText(value) {
  return sanitizeString(String(value || '').replace(/\r\n?/g, '\n')).trim();
}

function normalizePriority(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return ['low', 'medium', 'high', 'critical'].includes(normalized) ? normalized : 'medium';
}

function normalizeCategory(value) {
  const category = sanitizeString(value || '').trim();
  return category || 'General';
}

function normalizeExpiryDate(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return { value: null };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { error: 'Expiration date is invalid.' };
  }

  return { value: parsed };
}

function validateAnnouncementPayload(body) {
  const title = sanitizeString(body?.title || '').trim();
  const content = normalizeMultilineText(body?.content || '');
  const category = normalizeCategory(body?.category || '');
  const priority = normalizePriority(body?.priority || '');
  const expiresAtResult = normalizeExpiryDate(body?.expiresAt);

  if (!title) {
    return { error: 'Title is required.' };
  }
  if (title.length > 160) {
    return { error: 'Title must be 160 characters or fewer.' };
  }
  if (!content) {
    return { error: 'Content is required.' };
  }
  if (content.length > 5000) {
    return { error: 'Content must be 5000 characters or fewer.' };
  }
  if (category.length > 80) {
    return { error: 'Category must be 80 characters or fewer.' };
  }
  if (expiresAtResult.error) {
    return { error: expiresAtResult.error };
  }
  if (expiresAtResult.value && expiresAtResult.value.getTime() <= Date.now()) {
    return { error: 'Expiration date must be in the future.' };
  }

  return {
    value: {
      title,
      content,
      category,
      priority,
      audience: 'students',
      expiresAt: expiresAtResult.value
    }
  };
}

const SUPPORTED_RESOURCE_CATEGORIES = ['Books', 'Modules', 'Uniforms'];

function announceableResourceCategory(value) {
  const key = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/s$/, '');
  if (key === 'book') return 'Books';
  if (key === 'module') return 'Modules';
  if (key === 'uniform') return 'Uniforms';
  return null;
}

function serializeAnnouncement(item, { authorRole = null } = {}) {
  const now = Date.now();
  const expiresAtMs = item?.expiresAt ? new Date(item.expiresAt).getTime() : null;

  return {
    _id: item?._id,
    title: item?.title || '',
    content: item?.content || '',
    category: item?.category || 'General',
    priority: item?.priority || 'medium',
    audience: item?.audience || 'students',
    publishedAt: item?.publishedAt || item?.createdAt || null,
    expiresAt: item?.expiresAt || null,
    createdAt: item?.createdAt || null,
    updatedAt: item?.updatedAt || null,
    createdByName: item?.createdByName || 'Admin',
    updatedByName: item?.updatedByName || '',
    isExpired: Boolean(expiresAtMs && expiresAtMs < now),
    authorRole
  };
}

async function resolveAuthorRoleByIds(items) {
  const adminIds = [];
  const userIds = [];
  const seenAdmin = new Set();
  const seenUser = new Set();

  for (const item of items) {
    const id = item?.createdById;
    if (!id) continue;
    if (item?.createdByModel === 'User') {
      const key = String(id);
      if (seenUser.has(key)) continue;
      seenUser.add(key);
      userIds.push(id);
    } else {
      const key = String(id);
      if (seenAdmin.has(key)) continue;
      seenAdmin.add(key);
      adminIds.push(id);
    }
  }

  const [admins, users] = await Promise.all([
    adminIds.length
      ? Admin.find({ _id: { $in: adminIds } }).select('_id isSuperAdmin').lean()
      : Promise.resolve([]),
    userIds.length
      ? User.find({ _id: { $in: userIds } }).select('_id isAdmin').lean()
      : Promise.resolve([])
  ]);

  const roleKeys = new Map();

  for (const admin of admins) {
    roleKeys.set(`Admin:${String(admin._id)}`, admin.isSuperAdmin ? 'super_admin' : 'admin');
  }

  for (const id of adminIds) {
    const key = `Admin:${String(id)}`;
    if (!roleKeys.has(key)) roleKeys.set(key, 'admin');
  }

  for (const user of users) {
    if (user.isAdmin) roleKeys.set(`User:${String(user._id)}`, 'admin');
  }

  return new Map(items.map(item => {
    const id = item?.createdById;
    if (!id) return [String(item?._id), null];
    const model = item?.createdByModel === 'User' ? 'User' : 'Admin';
    return [String(item?._id), roleKeys.get(`${model}:${String(id)}`) || null];
  }));
}

async function listAdminAnnouncements(req) {
  const { error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const announcements = await Announcement.find({ archivedAt: null })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();

  return { body: announcements.map(serializeAnnouncement) };
}

async function createAnnouncement(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const payload = validateAnnouncementPayload(req.body || {});
  if (payload.error) {
    return { error: { status: 400, body: { error: payload.error } } };
  }

  const actor = buildActorSnapshot(admin);
  const announcement = await Announcement.create({
    ...payload.value,
    publishedAt: new Date(),
    createdById: actor.id,
    createdByModel: actor.model,
    createdByName: actor.name,
    updatedById: actor.id,
    updatedByModel: actor.model,
    updatedByName: actor.name
  });

  await logAdminTransaction(
    admin,
    'announcement_created',
    'announcement',
    announcement._id?.toString(),
    `${actor.name} created announcement "${announcement.title}" for students`
  );

  return {
    status: 201,
    body: {
      message: 'Announcement created successfully.',
      announcement: serializeAnnouncement(announcement.toObject())
    }
  };
}

async function updateAnnouncement(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const existing = await Announcement.findById(req.params.id);
  if (!existing) {
    return { error: { status: 404, body: { error: 'Announcement not found.' } } };
  }

  const payload = validateAnnouncementPayload(req.body || {});
  if (payload.error) {
    return { error: { status: 400, body: { error: payload.error } } };
  }

  const actor = buildActorSnapshot(admin);
  existing.title = payload.value.title;
  existing.content = payload.value.content;
  existing.category = payload.value.category;
  existing.priority = payload.value.priority;
  existing.audience = 'students';
  existing.expiresAt = payload.value.expiresAt;
  existing.updatedById = actor.id;
  existing.updatedByModel = actor.model;
  existing.updatedByName = actor.name;
  await existing.save();

  await logAdminTransaction(
    admin,
    'announcement_updated',
    'announcement',
    existing._id?.toString(),
    `${actor.name} updated announcement "${existing.title}"`
  );

  return {
    body: {
      message: 'Announcement updated successfully.',
      announcement: serializeAnnouncement(existing.toObject())
    }
  };
}

async function deleteAnnouncement(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const existing = await Announcement.findById(req.params.id).select('title');
  if (!existing) {
    return { error: { status: 404, body: { error: 'Announcement not found.' } } };
  }

  await Announcement.deleteOne({ _id: existing._id });
  await logAdminTransaction(
    admin,
    'announcement_deleted',
    'announcement',
    existing._id?.toString(),
    `${admin?.name || admin?.email || 'Admin'} deleted announcement "${existing.title || 'Untitled announcement'}"`
  );

  return { body: { message: 'Announcement deleted successfully.' } };
}

async function archiveAnnouncement(req) {
  const { admin, error } = await resolveAuthenticatedAdmin(req);
  if (error) return { error };

  const existing = await Announcement.findById(req.params.id).select('title');
  if (!existing) {
    return { error: { status: 404, body: { error: 'Announcement not found.' } } };
  }

  existing.isArchived = true;
  existing.archivedAt = new Date();
  await existing.save();

  await logAdminTransaction(
    admin,
    'announcement_archived',
    'announcement',
    existing._id?.toString(),
    `${admin?.name || admin?.email || 'Admin'} archived announcement "${existing.title || 'Untitled announcement'}"`
  );

  return { body: { message: 'Announcement archived successfully.' } };
}

async function listStudentAnnouncements() {
  const now = new Date();
  const eligible = await Announcement.find({
    archivedAt: null,
    audience: 'students',
    $or: [
      { expiresAt: null },
      { expiresAt: { $gte: now } }
    ]
  })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();

  const authorRoles = await resolveAuthorRoleByIds(eligible);

  const availability = await Inventory.aggregate([
    { $match: { category: { $in: SUPPORTED_RESOURCE_CATEGORIES } } },
    { $group: { _id: '$category', total: { $sum: { $ifNull: ['$quantity', 0] } } } }
  ]).then(rows => Object.fromEntries(rows.map(row => [row._id, row.total])));

  const visible = eligible.filter(item => {
    const role = authorRoles.get(String(item._id));
    if (!role) return false;
    const resource = announceableResourceCategory(item?.category);
    return !resource || (availability[resource] || 0) > 0;
  });

  return {
    body: visible.map(item => serializeAnnouncement(item, {
      authorRole: authorRoles.get(String(item._id))
    }))
  };
}

module.exports = {
  listAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  archiveAnnouncement,
  listStudentAnnouncements
};
