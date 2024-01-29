import { Sequelize } from "sequelize-typescript";

export class PostgresqlService {
  private static instance: PostgresqlService;
  private sequelize: Sequelize;

  private constructor() {
    this.sequelize = new Sequelize({
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST || "localhost",
      dialect: "postgres",
      storage: ":memory:",
      models: [__dirname + "/../**/*.model.ts"],
    });
  }

  public static async connect(): Promise<void> {
    try {
      await PostgresqlService.getInstance().sequelize.sync();
      console.log("Database synced");
    } catch (error) {
      console.error("Error syncing database:", error);
    }
  }

  public static getInstance(): PostgresqlService {
    if (!PostgresqlService.instance) {
      PostgresqlService.instance = new PostgresqlService();
    }

    return PostgresqlService.instance;
  }

  public getSequelize(): Sequelize {
    return this.sequelize;
  }
}
