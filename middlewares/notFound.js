function notFound(req, res) {
  res.status(404).json({ error: 'Page not found' });
}

module.exports = { notFound };
