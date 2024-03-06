import { FilterClauseType } from "../types/filterClauseType";

const conditionsMap = {
  equals: true,
  does_not_equal: true,
  greater_than: true,
  less_than: true,
};

export const handleUserInput = (req, res, next) => {
  const filters: FilterClauseType[] = req.query.filters
    ? JSON.parse(req.query.filters)
    : [];

  const isUserInputValid = filters.every(
    (filter) => conditionsMap[filter.condition]
  );

  if (!isUserInputValid) {
    return res.status(400).json({
      error:
        "Conditions can only be: 'equals', 'does_not_equal', 'greater_than', 'less_than'",
    });
  }

  req.query.filters = filters;
  return next();
};
