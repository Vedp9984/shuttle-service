// utils/responses.js
const ok = (res, data) => res.json(data);
const created = (res, data) => res.status(201).json(data);
const bad = (res, msg) => res.status(400).json({ error: msg });
const notfound = (res, msg='Not found') => res.status(404).json({ error: msg });

module.exports = { ok, created, bad, notfound };
