module.exports = (sequelize, DataType) => {
  return sequelize.define("Person", {
    lastName: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    cnp: {
      type: DataType.STRING(13),
      allowNull: false,
    },
    age: {
      type: DataType.INTEGER,
      allowNull: false,
    },
  });
};
