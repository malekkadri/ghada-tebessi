# Backend

## CRM Stats Endpoint

`GET /crm/stats` returns aggregated CRM metrics including lead and customer counts,
conversion rates, and timing information.

### Sample response

```json
{
  "leadCount": 5,
  "customerCount": 3,
  "conversionRate": 0.38,
  "weeklyLeadCreation": [
    { "week": "2024-20", "count": 2 }
  ],
  "interactionsPerCustomer": [
    { "customerId": 1, "name": "Alice", "count": 4 }
  ],
  "stageCounts": {
    "new": 1,
    "contacted": 2
  },
  "stageConversionRates": {
    "new": 0.2,
    "contacted": 0.4
  },
  "avgConversionDays": 7.5,
  "avgStageDuration": {
    "new": 2.0,
    "contacted": 3.5,
    "qualified": 1.0,
    "proposal": 0,
    "won": 0
  }
}
```

All duration metrics are expressed in days.

