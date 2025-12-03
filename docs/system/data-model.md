# Data Model

**Owner:** <khalid>  
**Last Updated:** YYYY-MM-DD

## Entities

### User

- id: UUID
- email: string
- hashed_password: string
- created_at: timestamp

### Task

- id: UUID
- user_id: UUID (FK)
- title: string
- description: text
- priority: integer (1-10)
- status: enum [todo, in_progress, done]
- created_at, updated_at

### Activity

- id: UUID
- task_id: UUID
- action: string
- metadata: jsonb
- timestamp: timestamp

## Example JSON Schema (Task)

```json
{
  "$id": "task",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "title": { "type": "string" },
    "priority": { "type": "integer", "minimum": 1, "maximum": 10 }
  },
  "required": ["id", "title", "priority"]
}
```
