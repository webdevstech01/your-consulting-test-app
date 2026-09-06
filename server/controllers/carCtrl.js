const { Op } = require("sequelize");

module.exports = (db) => {
  return {
    findAll: async (req, res) => {
      try {
        const {
          brand = "",
          model = "",
          manufactureYear = "",
          engineCapacity = "",
          tax = "",
        } = req.query;

        const values = [brand, model, manufactureYear, engineCapacity, tax];

        if (!values.every((value) => typeof value === "string")) {
          return res.status(400).json({
            message: "Filtrele trebuie să fie texte.",
          });
        }

        const where = {};

        const contains = (value) =>
          `%${value.trim().replace(/[\\%_]/g, "\\$&")}%`;

        if (brand.trim()) {
          where.brand = { [Op.iLike]: contains(brand) };
        }

        if (model.trim()) {
          where.model = { [Op.iLike]: contains(model) };
        }

        const numericFilters = {
          manufactureYear,
          engineCapacity,
          tax,
        };

        for (const [field, value] of Object.entries(numericFilters)) {
          const search = value.trim();

          if (!search) {
            continue;
          }

          if (!/^\d{1,4}$/.test(search)) {
            return res.status(400).json({
              message: "Filtrele numerice trebuie să conțină maximum 4 cifre.",
            });
          }

          where[field] = Number(search);
        }

        const cars = await db.models.Car.findAll({
          where,
          order: [["id", "ASC"]],
        });

        return res.json(cars);
      } catch (error) {
        console.error("Failed to fetch cars:", error);

        return res.status(500).json({
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
