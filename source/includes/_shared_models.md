## Document

> JSON:

```json
{
  "id": 1,
  "emitter": {
    "id": 456,
    "name": "Emitter Name"
  },
  "receiver": {
    "id": 789,
    "name": "Receiver Name"
  },
  "currency": {
    "id": 1,
    "code": "MXN"
  },
  "factoring_id": "FAC123456",
  "uuid": "21295371-177e-41f0-9c5c-c3c87eb71a13",
  "due_date": "2021-09-30T11:59:59",
  "total": 10000,
  "discount": 100
}
```

| Parameter    | Type                                          | Description                                   |
| ------------ | --------------------------------------------- | --------------------------------------------- |
| id           | Integer                                       | The id of the record                          |
| emitter      | <a href="#company" class="link">Company</a>   | The document's emitter                        |
| receiver     | <a href="#company" class="link">Company</a>   | The document's receiver                       |
| currency     | <a href="#currency" class="link">Currency</a> | The document's currency                       |
| factoring_id | String                                        | The unique supply chain finance identifier    |
| uuid         | String                                        | The document's unique fiscal identifier       |
| due_date     | DateTime                                      | The date the document will be expired or paid |
| total        | Float                                         | The document's total                          |
| discount     | Float                                         | The document's supply chain finance discount  |

## Currency

> JSON:

```json
{
  "id": 1,
  "code": "MXN",
  "description": "Peso Mexicano"
}
```

| Parameter   | Type    | Description                                       |
| ----------- | ------- | ------------------------------------------------- |
| id          | Integer | The id of the record                              |
| code        | String  | The 3-digit international currency representation |
| description | String  | The translated name of the currency               |
