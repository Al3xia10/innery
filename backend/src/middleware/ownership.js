export function requireSameParamUser(paramName) {
  return (req, res, next) => {
    const raw = req.params?.[paramName];
    const id = Number(raw);

    if (!raw || Number.isNaN(id)) {
      return res.status(400).json({ message: `Invalid ${paramName}` });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.id !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}
