const calculateAge = require("../utils/calculateAge");
const { Op } = require("sequelize");

module.exports = (db) => {
  const includeCars = [{ association: "cars", through: { attributes: [] } }];

  const validateCarIds = async (carIds, transaction) => {
    if (
      !Array.isArray(carIds) ||
      !carIds.every((id) => Number.isSafeInteger(id) && id > 0)
    ) {
      throw Object.assign(
        new Error(
          "Lista mașinilor trebuie să conțină ID-uri întregi pozitive.",
        ),
        { status: 400 },
      );
    }

    const ids = [...new Set(carIds)];

    if (ids.length === 0) {
      throw Object.assign(new Error("Selectați cel puțin o mașină."), {
        status: 400,
      });
    }

    if (ids.length) {
      const count = await db.models.Car.count({
        where: { id: ids },
        transaction,
      });

      if (count !== ids.length) {
        throw Object.assign(new Error("Una sau mai multe mașini nu există."), {
          status: 400,
        });
      }
    }
    return ids;
  };

  return {
    destroy: async (req, res) => {
      try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
          return res.status(400).json({ message: "ID invalid." });
        }

        const deletedCount = await db.models.Person.destroy({ where: { id } });

        if (deletedCount === 0) {
          return res.status(404).json({ message: "Persoana nu există." });
        }

        return res.status(204).send();
      } catch (error) {
        console.error("Failed to delete person:", error);
        return res
          .status(500)
          .json({ message: "Eroare la ștergerea persoanei." });
      }
    },

    findAll: async (req, res) => {
      try {
        const { lastName = "", firstName = "", cnp = "", age = "" } = req.query;

        const filters = [lastName, firstName, cnp, age];

        if (!filters.every((value) => typeof value === "string")) {
          return res.status(400).json({
            message: "Filtrele trebuie să fie texte.",
          });
        }

        const where = {};

        // Treat %, _ and backslash as literal search characters.
        const contains = (value) =>
          `%${value.trim().replace(/[\\%_]/g, "\\$&")}%`;

        if (lastName.trim()) {
          where.lastName = { [Op.iLike]: contains(lastName) };
        }

        if (firstName.trim()) {
          where.firstName = { [Op.iLike]: contains(firstName) };
        }

        if (cnp.trim()) {
          where.cnp = { [Op.like]: contains(cnp) };
        }

        if (age.trim()) {
          if (!/^\d{1,3}$/.test(age.trim())) {
            return res.status(400).json({
              message: "Vârsta trebuie să fie un număr întreg între 0 și 999.",
            });
          }
        }

        const persons = await db.models.Person.findAll({
          where,
          order: [["id", "ASC"]],
          include: [
            {
              association: "cars",
              through: { attributes: [] },
            },
          ],
        });

        const personsWithCurrentAge = persons.map((person) => {
          const data = person.toJSON();

          return {
            ...data,
            age: calculateAge(data.cnp),
          };
        });

        const result = age.trim()
          ? personsWithCurrentAge.filter(
              (person) => person.age === Number(age.trim()),
            )
          : personsWithCurrentAge;

        return res.json(result);
      } catch (error) {
        console.error("Failed to fetch persons:", error);

        return res.status(500).json({
          message: "Eroare la preluarea persoanelor.",
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

        const person = await db.models.Person.findByPk(id, {
          include: [
            {
              association: "cars",
              through: {
                attributes: [],
              },
            },
          ],
        });

        if (!person) {
          return res.status(404).json({
            message: "Persoana nu există.",
          });
        }

        const data = person.toJSON();

        return res.json({
          ...data,
          age: calculateAge(data.cnp),
        });
      } catch (error) {
        console.error("Failed to fetch person:", error);

        return res.status(500).json({
          message: "Eroare la preluarea persoanei.",
        });
      }
    },

    create: async (req, res) => {
      try {
        const { lastName, firstName, cnp } = req.body;

        if (
          typeof lastName !== "string" ||
          !lastName.trim() ||
          lastName.trim().length > 255
        ) {
          return res.status(400).json({
            message: "Numele este obligatoriu, maximum 255 de caractere.",
          });
        }

        if (
          typeof firstName !== "string" ||
          !firstName.trim() ||
          firstName.trim().length > 255
        ) {
          return res.status(400).json({
            message: "Prenumele este obligatoriu, maximum 255 de caractere.",
          });
        }

        const normalizedCnp = typeof cnp === "string" ? cnp.trim() : "";
        const age = calculateAge(normalizedCnp);

        if (age === null) {
          return res.status(400).json({
            message:
              "CNP-ul trebuie să aibă 13 cifre, prefix 1–6 și o dată de naștere validă, care nu este în viitor.",
          });
        }

        const person = await db.transaction(async (transaction) => {
          const ids = await validateCarIds(
            req.body.carIds === undefined ? [] : req.body.carIds,
            transaction,
          );
          const created = await db.models.Person.create(
            {
              lastName: lastName.trim(),
              firstName: firstName.trim(),
              cnp: normalizedCnp,
              age,
            },
            { transaction },
          );
          await created.setCars(ids, { transaction });
          return created.reload({ include: includeCars, transaction });
        });

        return res.status(201).json(person);
      } catch (error) {
        console.error("Failed to create person:", error);

        if (error.status === 400) {
          return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
          message: "Eroare la salvarea persoanei.",
        });
      }
    },

    update: async (req, res) => {
      try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
          return res.status(400).json({ message: "ID invalid." });
        }

        const person = await db.models.Person.findByPk(id);

        if (!person) {
          return res.status(404).json({
            message: "Persoana nu există.",
          });
        }

        const { lastName, firstName, cnp } = req.body;

        if (
          typeof lastName !== "string" ||
          !lastName.trim() ||
          lastName.trim().length > 255
        ) {
          return res.status(400).json({
            message: "Numele este obligatoriu, maximum 255 de caractere.",
          });
        }

        if (
          typeof firstName !== "string" ||
          !firstName.trim() ||
          firstName.trim().length > 255
        ) {
          return res.status(400).json({
            message: "Prenumele este obligatoriu, maximum 255 de caractere.",
          });
        }

        const normalizedCnp = typeof cnp === "string" ? cnp.trim() : "";
        const age = calculateAge(normalizedCnp);

        if (age === null) {
          return res.status(400).json({
            message: "CNP invalid sau nesuportat pentru calculul vârstei.",
          });
        }

        const updatedPerson = await db.transaction(async (transaction) => {
          const ids = await validateCarIds(req.body.carIds, transaction);

          await person.update(
            {
              lastName: lastName.trim(),
              firstName: firstName.trim(),
              cnp: normalizedCnp,
              age,
            },
            { transaction },
          );

          await person.setCars(ids, { transaction });

          return person.reload({ include: includeCars, transaction });
        });

        return res.json(updatedPerson);
      } catch (error) {
        console.error("Failed to update person:", error);

        if (error.status === 400) {
          return res.status(400).json({ message: error.message });
        }

        return res.status(500).json({
          message: "Eroare la modificarea persoanei.",
        });
      }
    },
  };
};
