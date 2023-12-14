import { Application } from "express";
import database from "./database";
import modules from "./modules";
import express from "./express";
import bullMQ from "./bull";
import waitForPostgresConnection from "./awaitPostgresConnection";

export default async function bootstrap(app: Application): Promise<void> {
  await waitForPostgresConnection();
  await express(app);
  await database(app);
  await modules(app);
  await bullMQ(app); // precisar subir na instancia dos bots
}
