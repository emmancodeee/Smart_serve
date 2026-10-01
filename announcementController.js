const announcementService = require('./announcementService');

function sendResult(res, result) {
  if (result.error) {
    return res.status(result.error.status).json(result.error.body);
  }

  return res.status(result.status || 200).json(result.body);
}

async function listAdminAnnouncements(req, res) {
  try {
    return sendResult(res, await announcementService.listAdminAnnouncements(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createAnnouncement(req, res) {
  try {
    return sendResult(res, await announcementService.createAnnouncement(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateAnnouncement(req, res) {
  try {
    return sendResult(res, await announcementService.updateAnnouncement(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteAnnouncement(req, res) {
  try {
    return sendResult(res, await announcementService.deleteAnnouncement(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function archiveAnnouncement(req, res) {
  try {
    return sendResult(res, await announcementService.archiveAnnouncement(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

async function listStudentAnnouncements(req, res) {
  try {
    return sendResult(res, await announcementService.listStudentAnnouncements(req));
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  listAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  archiveAnnouncement,
  listStudentAnnouncements
};
