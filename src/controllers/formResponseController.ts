import { Router } from "express";
import axios from "axios";
import { FilterClauseType } from "../types/filterClauseType";
import { URLSearchParams } from "url";

const router = Router();
const DEFAULT_LIMIT = 150;

const conditionHandlers = {
  equals: (a, b) => a === b,
  does_not_equal: (a, b) => a !== b,
  greater_than: (a, b) => new Date(a) > new Date(b),
  less_than: (a, b) => new Date(a) < new Date(b),
};

export const formResponseController = async (req, res) => {
  try {
    const { formId } = req.params;
    const { limit = DEFAULT_LIMIT, ...otherParams } = req.query;
    const queryParams = new URLSearchParams(otherParams).toString();

    // New Filter parameter (JSON stringified)
    const filters: FilterClauseType[] = req.query.filters;

    // Fetch all forms from Fillout.com's API which match params
    const filloutAPIURL = "https://api.fillout.com/v1/api/forms";
    const fullUrl = `${filloutAPIURL}/${formId}/submissions?${queryParams}`;

    const filloutResponse = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const filteredResults = filloutResponse.data.responses.filter((form) => {
      return filters.every(({ id, condition, value }) => {
        try {
          const question = form.questions.find(
            (question) => question.id === id
          );

          if (!question || !conditionHandlers[condition]) return false;

          return conditionHandlers[condition](question.value, value);
        } catch (error) {
          console.error("Error filtering responses:", error);
          return false;
        }
      });
    });

    // Making sure pagination still works
    const totalResponses = filteredResults.length;
    const parsedLimit = parseInt(limit, 10);
    const pageCount = Math.ceil(totalResponses / parsedLimit);

    res.json({
      response: filteredResults,
      totalResponses,
      pageCount,
    });
  } catch (error) {
    console.error("Error fetching/filtering responses:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
