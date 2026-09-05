module.exports = (app) => {
  const router = require("express").Router();
  const carCtrl = require("../controllers/carCtrl")(app.locals.db);

  router.get("/", carCtrl.findAll);
  router.get("/:id", carCtrl.find);
  router.post("/", carCtrl.create);
  router.put("/:id", carCtrl.update);
  router.delete("/:id", carCtrl.destroy);

  return router;
};
