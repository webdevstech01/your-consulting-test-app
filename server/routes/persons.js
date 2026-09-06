module.exports = (app) => {
  const router = require("express").Router();
  const personCtrl = require("../controllers/personCtrl")(app.locals.db);

  router.get("/", personCtrl.findAll);
  router.get("/:id", personCtrl.find);
  router.post("/", personCtrl.create);
  router.put("/:id", personCtrl.update);
  router.delete("/:id", personCtrl.destroy);

  return router;
};
