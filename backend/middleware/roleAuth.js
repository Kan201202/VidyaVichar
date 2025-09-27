export const requireInstructor = (req, res, next) => {
  if (req.user.role !== "instructor") {
    return res
      .status(403)
      .json({ message: "Only instructors can perform this action" });
  }
  next();
};

export const requireStudent = (req, res, next) => {
  if (req.user.role !== "student") {
    return res
      .status(403)
      .json({ message: "Only students can perform this action" });
  }
  next();
};
