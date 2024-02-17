import { DataSource } from "typeorm";

export class PostgresqlService {
  private static instance: PostgresqlService;
  private readonly dataSource: DataSource;

  private constructor() {
    this.dataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_HOST ?? "localhost",
      port: parseInt(process.env.DB_PORT ?? "5432") ?? 5432,
      username: process.env.DB_USER ?? "postgres",
      password: process.env.DB_PASSWORD ?? "secret",
      database: process.env.DB_NAME ?? "postgres",
      synchronize: true,
      logging: false,
      entities: [__dirname + "/../**/*.model.{ts,js}"],
      migrations: [__dirname + "/migrations/*.{ts,js}"],
    });
    this.connect();
  }

  public static getInstance(): PostgresqlService {
    if (!PostgresqlService.instance) {
      PostgresqlService.instance = new PostgresqlService();
    }

    return PostgresqlService.instance;
  }

  private connect = async (): Promise<void> => {
    try {
      await this.dataSource.initialize();
      console.log("Connected to PostgreSQL");
    } catch (error) {
      console.error("Failed to connect to PostgreSQL: ", error);
    }
  };

  public getDataSource(): DataSource {
    return this.dataSource;
  }
}
