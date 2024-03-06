import express from "express";
import dotenv from "dotenv";
import { handleUserInput } from "./middleware/handleUserInput";
import { formResponseController } from "./controllers/formResponseController";

dotenv.config();
const app = express();
const DEFAULT_PORT = 8000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = Number(process.env.PORT) || DEFAULT_PORT;

app.get("/", (req, res) => {
  res.json({ message: "Welcome! Follow the White Rabbit." });
});

// app.use([path,] middlewareFunction, nextFunction)
app.use("/:formId/filteredResponses", handleUserInput, formResponseController);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
