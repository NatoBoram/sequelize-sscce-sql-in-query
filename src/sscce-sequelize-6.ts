import { sql } from "@sequelize/core";
import { expect } from "chai";
import { DataTypes, Model } from "sequelize";
import sinon from "sinon";
import { createSequelize6Instance } from "../setup/create-sequelize-instance";

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set([
  "mssql",
  "sqlite",
  "mysql",
  "mariadb",
  "postgres",
  "postgres-native",
]);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

// Your SSCCE goes inside this function.
export async function run() {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize6Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // For less clutter in the SSCCE
      timestamps: false,
    },
  });

  class Foo extends Model {}

  Foo.init(
    {
      name: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Foo",
    }
  );

  // You can use sinon and chai assertions directly in your SSCCE.
  const spy = sinon.spy();
  sequelize.afterBulkSync(() => spy());
  await sequelize.sync({ force: true });
  expect(spy).to.have.been.called;

  console.log(await Foo.create({ name: "TS foo" }));
  expect(await Foo.count()).to.equal(1);

  // This is the bug. It'll be fixed in `@sequelize/core@7.0.0-alpha.34`.
  // Argument of type 'Literal' is not assignable to parameter of type 'string | { query: string; values: unknown[]; }'
  sequelize.query(sql`SELECT * FROM Foo`);
}
