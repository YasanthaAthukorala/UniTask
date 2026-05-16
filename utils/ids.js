/** Normalize MongoDB ObjectId, populated doc, or string to a comparable string. */
function getIdString(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (value._id != null) return String(value._id);
  if (typeof value.toString === 'function') return value.toString();
  return String(value);
}

function sameId(a, b) {
  const idA = getIdString(a);
  const idB = getIdString(b);
  if (!idA || !idB) return false;
  return idA === idB;
}

module.exports = { getIdString, sameId };
