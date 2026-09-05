module.exports = (sequelize, DataType) => {
  return sequelize.define("Car", {
    brand: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    model: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    manufactureYear: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    engineCapacity: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    tax: {
      type: DataType.INTEGER,
      allowNull: false,
    },
  });
};
