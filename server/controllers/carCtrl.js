module.exports = (db) => {
  return {
    findAll: async (req, res) => {
      try {
        const cars = await db.models.Car.findAll({
          order: [["id", "ASC"]],
        });

        res.json(cars);
      } catch (error) {
        console.error("Failed to fetch cars:", error);
        res.status(500).json({
          message: "Eroare la preluarea mașinilor.",
        });
      }
    },

    find: async (req, res) => {
      try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
          return res.status(400).json({
            message: "ID invalid.",
          });
        }

        const car = await db.models.Car.findByPk(id);

        if (!car) {
          return res.status(404).json({
            message: "Mașina nu există.",
          });
        }

        return res.json(car);
      } catch (error) {
        console.error("Failed to fetch car:", error);

        return res.status(500).json({
          message: "Eroare la preluarea mașinii.",
        });
      }
    },

    create: async (req, res) => {
      try {
        const { brand, model, manufactureYear, engineCapacity } = req.body;

        if (
          typeof brand !== "string" ||
          !brand.trim() ||
          brand.trim().length > 255 ||
          typeof model !== "string" ||
          !model.trim() ||
          model.trim().length > 255
        ) {
          return res.status(400).json({
            message:
              "Marca și modelul sunt obligatorii, maximum 255 de caractere.",
          });
        }

        if (
          !Number.isInteger(manufactureYear) ||
          manufactureYear < 1 ||
          manufactureYear > 9999 ||
          !Number.isInteger(engineCapacity) ||
          engineCapacity < 1 ||
          engineCapacity > 9999
        ) {
          return res.status(400).json({
            message:
              "Anul și capacitatea trebuie să fie numere întregi între 1 și 9999.",
          });
        }

        const tax =
          engineCapacity < 1500 ? 50 : engineCapacity <= 2000 ? 100 : 200;

        const car = await db.models.Car.create({
          brand: brand.trim(),
          model: model.trim(),
          manufactureYear,
          engineCapacity,
          tax,
        });

        return res.status(201).json(car);
      } catch (error) {
        console.error("Failed to create car:", error);

        return res.status(500).json({
          message: "Eroare la salvarea mașinii.",
        });
      }
    },

    update: async (req, res) => {
      try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
          return res.status(400).json({
            message: "ID invalid.",
          });
        }

        const car = await db.models.Car.findByPk(id);

        if (!car) {
          return res.status(404).json({
            message: "Mașina nu există.",
          });
        }

        const { brand, model, manufactureYear, engineCapacity } = req.body;

        if (
          typeof brand !== "string" ||
          !brand.trim() ||
          brand.trim().length > 255 ||
          typeof model !== "string" ||
          !model.trim() ||
          model.trim().length > 255
        ) {
          return res.status(400).json({
            message:
              "Marca și modelul sunt obligatorii, maximum 255 de caractere.",
          });
        }

        if (
          !Number.isInteger(manufactureYear) ||
          manufactureYear < 1 ||
          manufactureYear > 9999 ||
          !Number.isInteger(engineCapacity) ||
          engineCapacity < 1 ||
          engineCapacity > 9999
        ) {
          return res.status(400).json({
            message:
              "Anul și capacitatea trebuie să fie numere întregi între 1 și 9999.",
          });
        }

        const tax =
          engineCapacity < 1500 ? 50 : engineCapacity <= 2000 ? 100 : 200;

        await car.update({
          brand: brand.trim(),
          model: model.trim(),
          manufactureYear,
          engineCapacity,
          tax,
        });

        return res.json(car);
      } catch (error) {
        console.error("Failed to update car:", error);

        return res.status(500).json({
          message: "Eroare la modificarea mașinii.",
        });
      }
    },

    destroy: async (req, res) => {
      try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
          return res.status(400).json({
            message: "ID invalid.",
          });
        }

        const deletedCount = await db.models.Car.destroy({
          where: { id },
        });

        if (deletedCount === 0) {
          return res.status(404).json({
            message: "Mașina nu există.",
          });
        }

        return res.status(204).send();
      } catch (error) {
        console.error("Failed to delete car:", error);

        return res.status(500).json({
          message: "Eroare la ștergerea mașinii.",
        });
      }
    },
  };
};
