const calculateAge = require("../utils/calculateAge");

module.exports = (db) => {
  return {
    findAll: async (req, res) => {
      try {
        const persons = await db.models.Person.findAll({
          order: [["id", "ASC"]],
        });

        return res.json(persons);
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

        const person = await db.models.Person.findByPk(id);

        if (!person) {
          return res.status(404).json({
            message: "Persoana nu există.",
          });
        }

        return res.json(person);
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

        const person = await db.models.Person.create({
          lastName: lastName.trim(),
          firstName: firstName.trim(),
          cnp: normalizedCnp,
          age,
        });

        return res.status(201).json(person);
      } catch (error) {
        console.error("Failed to create person:", error);

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

        await person.update({
          lastName: lastName.trim(),
          firstName: firstName.trim(),
          cnp: normalizedCnp,
          age,
        });

        return res.json(person);
      } catch (error) {
        console.error("Failed to update person:", error);

        return res.status(500).json({
          message: "Eroare la modificarea persoanei.",
        });
      }
    },
  };
};
