module.exports = (sequelize, DataType) => {
  return sequelize.define(
    "Junction",
    {
      id_person: {
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Person",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      id_car: {
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "Car",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      timestamps: false,
    },
  );
};
